"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

import { auth, db } from "../../lib/firebase";

function formatStatus(status = "pending") {
  return status.replaceAll("-", " ");
}

function statusClasses(status) {
  if (status === "completed") {
    return "border-green-500/30 bg-green-500/10 text-green-300";
  }

  if (status === "accepted" || status === "in-progress") {
    return "border-blue-500/30 bg-blue-500/10 text-blue-300";
  }

  if (status === "rejected") {
    return "border-red-500/30 bg-red-500/10 text-red-300";
  }

  return "border-yellow-500/30 bg-yellow-500/10 text-yellow-300";
}

function paymentClasses(paymentStatus = "not-paid") {
  if (paymentStatus === "paid") {
    return "text-green-400";
  }

  if (paymentStatus === "pending-verification") {
    return "text-yellow-400";
  }

  if (paymentStatus === "rejected") {
    return "text-red-400";
  }

  return "text-slate-200";
}

export default function MyOrdersPage() {
  const router = useRouter();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let unsubscribeOrders = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/login");
        return;
      }

      const ordersQuery = query(
        collection(db, "orders"),
        where("userId", "==", user.uid)
      );

      unsubscribeOrders = onSnapshot(
        ordersQuery,
        (snapshot) => {
          const orderData = snapshot.docs.map((orderDocument) => ({
            id: orderDocument.id,
            ...orderDocument.data(),
          }));

          orderData.sort((firstOrder, secondOrder) => {
            const firstTime =
              firstOrder.createdAt?.toMillis?.() || 0;
            const secondTime =
              secondOrder.createdAt?.toMillis?.() || 0;

            return secondTime - firstTime;
          });

          setOrders(orderData);
          setLoading(false);
        },
        (firebaseError) => {
          console.error("My orders loading error:", firebaseError);
          setError("Your orders could not be loaded.");
          setLoading(false);
        }
      );
    });

    return () => {
      unsubscribeAuth();

      if (unsubscribeOrders) {
        unsubscribeOrders();
      }
    };
  }, [router]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <p className="text-lg text-slate-300">
          Loading your orders...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-10 text-white sm:px-8">
      <div className="mx-auto max-w-7xl">

        <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="font-semibold tracking-widest text-blue-400">
              CUSTOMER PORTAL
            </p>

            <h1 className="mt-2 text-4xl font-black sm:text-5xl">
              My Orders
            </h1>

            <p className="mt-3 text-slate-400">
              Track prices, deadlines, payment and admin updates.
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push("/orders")}
            className="rounded-xl bg-gradient-to-r from-blue-500 to-violet-600 px-6 py-3 font-bold shadow-lg shadow-blue-500/20 transition hover:scale-105"
          >
            Place New Order
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
            <h2 className="text-2xl font-bold">
              No orders submitted yet
            </h2>

            <p className="mt-3 text-slate-400">
              Submit your first academic support request.
            </p>

            <button
              type="button"
              onClick={() => router.push("/orders")}
              className="mt-6 rounded-xl bg-gradient-to-r from-blue-500 to-violet-600 px-6 py-3 font-bold"
            >
              Place New Order
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {orders.map((order) => {
              const paymentStatus =
                order.paymentStatus || "not-paid";

              const canPay =
                order.quotedPrice &&
                paymentStatus === "not-paid" &&
                order.status !== "rejected";

              return (
                <article
                  key={order.id}
                  className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl sm:p-8"
                >
                  <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
                    <div>
                      <p className="text-sm font-semibold text-blue-400">
                        ORDER #{order.id.slice(0, 8).toUpperCase()}
                      </p>

                      <h2 className="mt-2 text-2xl font-black">
                        {order.title}
                      </h2>

                      <p className="mt-2 text-slate-400">
                        {order.subject} · {order.pages} pages
                      </p>
                    </div>

                    <span
                      className={`inline-flex w-fit rounded-full border px-4 py-2 text-sm font-semibold capitalize ${statusClasses(
                        order.status
                      )}`}
                    >
                      {formatStatus(order.status)}
                    </span>
                  </div>

                  <div className="mt-7 grid gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                      <p className="text-sm text-slate-500">
                        Deadline
                      </p>

                      <p className="mt-1 font-semibold">
                        {order.deadline || "—"}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                      <p className="text-sm text-slate-500">
                        Quoted Price
                      </p>

                      <p className="mt-1 font-semibold">
                        {order.quotedPrice === null ||
                        order.quotedPrice === undefined
                          ? "Waiting for quote"
                          : `Rs. ${order.quotedPrice}`}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                      <p className="text-sm text-slate-500">
                        Payment
                      </p>

                      <p
                        className={`mt-1 font-semibold capitalize ${paymentClasses(
                          paymentStatus
                        )}`}
                      >
                        {paymentStatus.replaceAll("-", " ")}
                      </p>
                    </div>
                  </div>

                  {order.adminNote && (
                    <div className="mt-6 rounded-2xl border border-blue-500/20 bg-blue-500/10 p-5">
                      <p className="text-sm font-semibold text-blue-300">
                        Admin Note
                      </p>

                      <p className="mt-2 leading-7 text-slate-200">
                        {order.adminNote}
                      </p>
                    </div>
                  )}

                  <div className="mt-6 flex flex-col gap-4 sm:flex-row">
                    {canPay && (
                      <button
                        type="button"
                        onClick={() =>
                          router.push(
                            `/payment?orderId=${order.id}`
                          )
                        }
                        className="rounded-xl bg-gradient-to-r from-blue-500 to-violet-600 px-6 py-3 font-bold shadow-lg shadow-blue-500/20 transition hover:scale-105"
                      >
                        Pay Now
                      </button>
                    )}

                    {paymentStatus === "pending-verification" && (
                      <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-5 py-3 font-semibold text-yellow-300">
                        Payment verification pending
                      </div>
                    )}

                    {paymentStatus === "paid" && (
                      <div className="rounded-xl border border-green-500/30 bg-green-500/10 px-5 py-3 font-semibold text-green-300">
                        Payment verified
                      </div>
                    )}

                    {paymentStatus === "rejected" && (
                      <button
                        type="button"
                        onClick={() =>
                          router.push(
                            `/payment?orderId=${order.id}`
                          )
                        }
                        className="rounded-xl bg-gradient-to-r from-red-500 to-orange-500 px-6 py-3 font-bold transition hover:scale-105"
                      >
                        Resubmit Payment
                      </button>
                    )}

                    {order.completedFileUrl && (
  <div className="mt-6 flex flex-wrap gap-3">

    <a
      href={order.completedFileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-3 font-bold text-white transition hover:scale-105"
    >
      📥 Download Assignment
    </a>

    {order.status !== "completed" && (
      <span className="rounded-xl bg-yellow-500/10 px-4 py-3 text-sm text-yellow-300">
        File uploaded. Status is not Completed yet.
      </span>
    )}

  </div>
)}
                  </div>
                </article>
              );
            })}
          </div>
        )}

      </div>
    </main>
  );
}