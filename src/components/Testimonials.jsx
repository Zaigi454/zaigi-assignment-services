"use client";

import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

import { db } from "../lib/firebase";

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const feedbackQuery = query(
      collection(db, "orders"),
      where("status", "==", "completed")
    );

    const unsubscribe = onSnapshot(
      feedbackQuery,
      (snapshot) => {
        const feedbackData = snapshot.docs
          .map((orderDocument) => ({
            id: orderDocument.id,
            ...orderDocument.data(),
          }))
          .filter(
            (order) =>
              order.feedback &&
              Number(order.rating) >= 4
          )
          .sort((firstReview, secondReview) => {
            const firstTime =
              firstReview.feedbackSubmittedAt?.toMillis?.() || 0;

            const secondTime =
              secondReview.feedbackSubmittedAt?.toMillis?.() || 0;

            return secondTime - firstTime;
          })
          .slice(0, 6);

        setTestimonials(feedbackData);
        setLoading(false);
      },
      (firebaseError) => {
        console.error(
          "Testimonials loading error:",
          firebaseError
        );

        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  return (
    <section
      id="testimonials"
      className="bg-slate-950 px-6 py-24 text-white"
    >
      <div className="mx-auto max-w-7xl">

        <div className="text-center">
          <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-400">
            STUDENT FEEDBACK
          </span>

          <h2 className="mx-auto mt-6 max-w-4xl text-4xl font-extrabold leading-tight sm:text-5xl">
            What Our
            <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
              {" "}Clients Say
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Real feedback from students who received academic support
            and completed their orders.
          </p>
        </div>

        {loading ? (
          <div className="mt-16 text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />

            <p className="mt-4 text-slate-400">
              Loading student feedback...
            </p>
          </div>
        ) : testimonials.length === 0 ? (
          <div className="mx-auto mt-16 max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
            <div className="text-5xl">⭐</div>

            <h3 className="mt-5 text-2xl font-bold">
              Feedback Coming Soon
            </h3>

            <p className="mt-3 leading-7 text-slate-400">
              Completed customers can submit their ratings and reviews
              from the My Orders page.
            </p>
          </div>
        ) : (
          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((item) => {
              const rating = Math.min(
                5,
                Math.max(1, Number(item.rating || 5))
              );

              return (
                <article
                  key={item.id}
                  className="flex h-full flex-col rounded-3xl border border-white/10 bg-white/5 p-8 shadow-xl backdrop-blur-xl transition duration-300 hover:-translate-y-2 hover:border-blue-500/40"
                >
                  <div
                    className="text-xl tracking-widest text-yellow-400"
                    aria-label={`${rating} out of 5 stars`}
                  >
                    {"★".repeat(rating)}

                    <span className="text-slate-700">
                      {"★".repeat(5 - rating)}
                    </span>
                  </div>

                  <p className="mt-6 flex-1 leading-8 text-slate-300">
                    “{item.feedback}”
                  </p>

                  <div className="mt-8 border-t border-white/10 pt-6">
                    <h3 className="text-lg font-bold text-white">
                      {item.customerName || "Verified Student"}
                    </h3>

                    <p className="mt-1 text-sm text-slate-400">
                      {item.subject
                        ? `${item.subject} Student`
                        : "Verified Customer"}
                    </p>

                    <span className="mt-3 inline-flex rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-300">
                      ✓ Verified Completed Order
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
}