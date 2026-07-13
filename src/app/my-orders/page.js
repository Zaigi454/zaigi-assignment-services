"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
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

  const [feedbackOrder, setFeedbackOrder] = useState(null);
  const [rating, setRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackError, setFeedbackError] = useState("");

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

  function openFeedbackModal(order) {
    setFeedbackOrder(order);
    setRating(0);
    setFeedbackText("");
    setFeedbackError("");
  }

  function closeFeedbackModal() {
    if (submittingFeedback) {
      return;
    }

    setFeedbackOrder(null);
    setRating(0);
    setFeedbackText("");
    setFeedbackError("");
  }

  async function submitFeedback(event) {
    event.preventDefault();

    if (!feedbackOrder) {
      return;
    }

    if (feedbackOrder.status !== "completed") {
      setFeedbackError(
        "Feedback can only be submitted for a completed order."
      );
      return;
    }

    if (feedbackOrder.feedback) {
      setFeedbackError(
        "Feedback has already been submitted for this order."
      );
      return;
    }

    if (rating < 1 || rating > 5) {
      setFeedbackError("Please select a rating from 1 to 5 stars.");
      return;
    }

    if (feedbackText.trim().length < 3) {
      setFeedbackError("Please write a short feedback message.");
      return;
    }

    try {
      setSubmittingFeedback(true);
      setFeedbackError("");

      await updateDoc(doc(db, "orders", feedbackOrder.id), {
        rating,
        feedback: feedbackText.trim(),
        feedbackSubmittedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      closeFeedbackModal();
    } catch (firebaseError) {
      console.error("Feedback submission error:", firebaseError);

      if (firebaseError.code === "permission-denied") {
        setFeedbackError(
          "Database permission denied. Firestore rules need updating."
        );
      } else {
        setFeedbackError(
          "Feedback could not be submitted. Please try again."
        );
      }
    } finally {
      setSubmittingFeedback(false);
    }
  }

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
                Boolean(order.quotedPrice) &&
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

                  {order.feedback && (
                    <div className="mt-6 rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-5">
                      <p className="text-sm font-semibold text-yellow-300">
                        Your Feedback
                      </p>

                      <p className="mt-2 text-2xl">
                        {"★".repeat(Number(order.rating || 0))}
                        <span className="text-slate-600">
                          {"★".repeat(
                            Math.max(0, 5 - Number(order.rating || 0))
                          )}
                        </span>
                      </p>

                      <p className="mt-3 leading-7 text-slate-200">
                        {order.feedback}
                      </p>
                    </div>
                  )}

                  <div className="mt-6 flex flex-wrap gap-4">
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
                      <a
                        href={order.completedFileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-3 font-bold text-white transition hover:scale-105"
                      >
                        📥 Download Assignment
                      </a>
                    )}

                    {order.status === "completed" &&
                      !order.feedback && (
                        <button
                          type="button"
                          onClick={() => openFeedbackModal(order)}
                          className="rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-3 font-bold text-white shadow-lg transition hover:scale-105"
                        >
                          ⭐ Leave Feedback
                        </button>
                      )}

                    {order.status === "completed" &&
                      order.feedback && (
                        <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-5 py-3 font-semibold text-yellow-300">
                          ✓ Feedback Submitted
                        </div>
                      )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {feedbackOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl sm:p-8">

            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-sm font-semibold tracking-widest text-yellow-400">
                  CUSTOMER FEEDBACK
                </p>

                <h2 className="mt-2 text-2xl font-black">
                  Rate Your Experience
                </h2>

                <p className="mt-2 text-sm text-slate-400">
                  Order: {feedbackOrder.title}
                </p>
              </div>

              <button
                type="button"
                onClick={closeFeedbackModal}
                disabled={submittingFeedback}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-slate-300 hover:bg-white/10 disabled:opacity-50"
              >
                Close
              </button>
            </div>

            <form
              onSubmit={submitFeedback}
              className="mt-7 space-y-6"
            >
              <div>
                <p className="mb-3 font-semibold text-slate-300">
                  Select Rating
                </p>

                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`text-4xl transition hover:scale-110 ${
                        star <= rating
                          ? "text-yellow-400"
                          : "text-slate-600"
                      }`}
                      aria-label={`${star} star rating`}
                    >
                      ★
                    </button>
                  ))}
                </div>

                {rating > 0 && (
                  <p className="mt-2 text-sm text-yellow-300">
                    {rating} out of 5 stars selected
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="feedbackText"
                  className="mb-2 block font-semibold text-slate-300"
                >
                  Your Feedback
                </label>

                <textarea
                  id="feedbackText"
                  rows="5"
                  value={feedbackText}
                  onChange={(event) =>
                    setFeedbackText(event.target.value)
                  }
                  placeholder="Tell us about your experience..."
                  required
                  className="w-full resize-none rounded-xl border border-white/10 bg-slate-950 px-4 py-4 text-white outline-none placeholder:text-slate-500 focus:border-yellow-500"
                />
              </div>

              {feedbackError && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
                  {feedbackError}
                </div>
              )}

              <button
                type="submit"
                disabled={submittingFeedback}
                className="w-full rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 py-4 font-bold text-white shadow-lg transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submittingFeedback
                  ? "Submitting Feedback..."
                  : "Submit Feedback"}
              </button>
            </form>

          </div>
        </div>
      )}
    </main>
  );
}