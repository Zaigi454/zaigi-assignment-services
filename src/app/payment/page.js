"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { auth, db } from "../../lib/firebase";

export default function PaymentPage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [order, setOrder] = useState(null);
  const [orderId, setOrderId] = useState("");

  const [paymentMethod, setPaymentMethod] = useState("");
  const [transactionId, setTransactionId] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const idFromUrl = params.get("orderId") || "";

    setOrderId(idFromUrl);

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.replace("/login");
        return;
      }

      setUser(currentUser);

      if (!idFromUrl) {
        setError("Order ID is missing.");
        setLoading(false);
        return;
      }

      try {
        const orderReference = doc(db, "orders", idFromUrl);
        const orderSnapshot = await getDoc(orderReference);

        if (!orderSnapshot.exists()) {
          setError("Order was not found.");
          setLoading(false);
          return;
        }

        const orderData = {
          id: orderSnapshot.id,
          ...orderSnapshot.data(),
        };

        if (orderData.userId !== currentUser.uid) {
          setError("You cannot access this order.");
          setLoading(false);
          return;
        }

        setOrder(orderData);
      } catch (firebaseError) {
        console.error("Payment page error:", firebaseError);
        setError("Order information could not be loaded.");
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [router]);

  async function handlePaymentSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!user || !order) {
      setError("Order information is unavailable.");
      return;
    }

    if (!order.quotedPrice) {
      setError("Admin has not set the order price yet.");
      return;
    }

    if (!paymentMethod || !transactionId.trim()) {
      setError("Select a payment method and enter the transaction ID.");
      return;
    }

    try {
      setSubmitting(true);

      await updateDoc(doc(db, "orders", orderId), {
        paymentMethod,
        transactionId: transactionId.trim(),
        paymentStatus: "pending-verification",
        paymentSubmittedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setSuccess(
        "Payment details submitted. Admin will verify your payment."
      );

      setOrder((previousOrder) => ({
        ...previousOrder,
        paymentStatus: "pending-verification",
      }));
    } catch (firebaseError) {
      console.error("Payment submission error:", firebaseError);
      setError("Payment details could not be submitted.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <p className="text-slate-300">Loading payment details...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-12 text-white">
      <div className="mx-auto max-w-2xl">

        <div className="text-center">
          <p className="font-semibold tracking-widest text-blue-400">
            PAYMENT
          </p>

          <h1 className="mt-3 text-4xl font-black">
            Submit Payment Details
          </h1>

          <p className="mt-3 text-slate-400">
            Pay the quoted amount and provide your transaction information.
          </p>
        </div>

        {error && (
          <div className="mt-8 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
            {error}
          </div>
        )}

        {order && (
          <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-7 shadow-2xl sm:p-9">

            <div className="grid gap-4 rounded-2xl border border-white/10 bg-slate-950/70 p-5 sm:grid-cols-2">
              <div>
                <p className="text-sm text-slate-500">Order</p>
                <p className="mt-1 font-bold">{order.title}</p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Quoted Price</p>
                <p className="mt-1 text-xl font-black text-green-400">
                  {order.quotedPrice
                    ? `Rs. ${order.quotedPrice}`
                    : "Waiting for quote"}
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-blue-500/20 bg-blue-500/10 p-5 text-blue-100">
              <p className="font-bold">Payment Account</p>
              <p className="mt-2">Account details will be added here.</p>
            </div>

            <form
              onSubmit={handlePaymentSubmit}
              className="mt-7 space-y-5"
            >
              <div>
                <label
                  htmlFor="paymentMethod"
                  className="mb-2 block font-semibold text-slate-300"
                >
                  Payment Method
                </label>

                <select
                  id="paymentMethod"
                  value={paymentMethod}
                  onChange={(event) =>
                    setPaymentMethod(event.target.value)
                  }
                  required
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-4 text-white outline-none focus:border-blue-500"
                >
                  <option value="">Select payment method</option>
                  <option value="easypaisa">Easypaisa</option>
                  <option value="jazzcash">JazzCash</option>
                  <option value="bank-transfer">Bank Transfer</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="transactionId"
                  className="mb-2 block font-semibold text-slate-300"
                >
                  Transaction ID
                </label>

                <input
                  id="transactionId"
                  type="text"
                  value={transactionId}
                  onChange={(event) =>
                    setTransactionId(event.target.value)
                  }
                  placeholder="Enter transaction/reference number"
                  required
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-4 text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
                />
              </div>

              {success && (
                <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-green-300">
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={
                  submitting ||
                  !order.quotedPrice ||
                  order.paymentStatus === "pending-verification"
                }
                className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-violet-600 py-4 font-bold shadow-lg shadow-blue-500/20 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting
                  ? "Submitting..."
                  : order.paymentStatus === "pending-verification"
                    ? "Waiting for Verification"
                    : "Submit Payment Details"}
              </button>
            </form>

          </div>
        )}

      </div>
    </main>
  );
}