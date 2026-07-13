"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../../lib/firebase";

const initialFormData = {
  service: "",
  subject: "",
  title: "",
  pages: "",
  deadline: "",
  instructions: "",
};

export default function OrdersPage() {
  const [formData, setFormData] = useState(initialFormData);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });

    return unsubscribe;
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!user) {
      setError("Please login before submitting an order.");
      return;
    }

    const selectedDeadline = new Date(`${formData.deadline}T23:59:59`);
    const today = new Date();

    if (selectedDeadline < today) {
      setError("Please select a future deadline.");
      return;
    }

    try {
      setSubmitting(true);

      const orderReference = await addDoc(collection(db, "orders"), {
        userId: user.uid,
        customerName: user.displayName || "Customer",
        customerEmail: user.email || "",
        service: formData.service,
        subject: formData.subject.trim(),
        title: formData.title.trim(),
        pages: Number(formData.pages),
        deadline: formData.deadline,
        instructions: formData.instructions.trim(),

        status: "pending",
        paymentStatus: "not-paid",
        quotedPrice: null,
        adminNote: "",
        completedFileUrl: "",

        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setSuccess(
        `Order submitted successfully. Your Order ID is ${orderReference.id}`
      );

      setFormData(initialFormData);
    } catch (firebaseError) {
      console.error("Order submission error:", firebaseError);

      if (firebaseError.code === "permission-denied") {
        setError(
          "Database permission denied. Please check Firestore security rules."
        );
      } else if (firebaseError.code === "unavailable") {
        setError("Internet or Firebase service problem. Please try again.");
      } else {
        setError("Order could not be submitted. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <p className="text-lg text-slate-300">
          Checking your account...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-3xl">

        <div className="text-center">
          <p className="text-sm font-bold tracking-widest text-blue-400">
            NEW REQUEST
          </p>

          <h1 className="mt-3 text-4xl font-black sm:text-5xl">
            Submit Your Academic
            <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
              {" "}Support Request
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl leading-7 text-slate-400">
            Enter your requirements carefully. We will review your request and
            provide a custom quotation.
          </p>
        </div>

        {!user && (
          <div className="mt-8 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-center text-yellow-200">
            You are not logged in. Please login before submitting an order.
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-12 space-y-6 rounded-3xl border border-white/10 bg-white/5 p-7 shadow-2xl backdrop-blur-xl sm:p-10"
        >
          <div>
            <label
              htmlFor="service"
              className="mb-2 block font-semibold text-slate-300"
            >
              Required Service
            </label>

            <select
              id="service"
              name="service"
              value={formData.service}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-4 text-white outline-none focus:border-blue-500"
            >
              <option value="">Select a service</option>
              <option value="writing-guidance">Writing Guidance</option>
              <option value="research-support">Research Support</option>
              <option value="proofreading">Editing & Proofreading</option>
              <option value="formatting">Formatting & Referencing</option>
              <option value="presentation">Presentation Design</option>
            </select>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label
                htmlFor="subject"
                className="mb-2 block font-semibold text-slate-300"
              >
                Subject
              </label>

              <input
                id="subject"
                name="subject"
                type="text"
                value={formData.subject}
                onChange={handleChange}
                placeholder="e.g. Database Systems"
                required
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-4 text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="pages"
                className="mb-2 block font-semibold text-slate-300"
              >
                Estimated Pages
              </label>

              <input
                id="pages"
                name="pages"
                type="number"
                min="1"
                value={formData.pages}
                onChange={handleChange}
                placeholder="e.g. 5"
                required
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-4 text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="title"
              className="mb-2 block font-semibold text-slate-300"
            >
              Topic or Title
            </label>

            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter the topic or task title"
              required
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-4 text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="deadline"
              className="mb-2 block font-semibold text-slate-300"
            >
              Deadline
            </label>

            <input
              id="deadline"
              name="deadline"
              type="date"
              value={formData.deadline}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-4 text-white outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="instructions"
              className="mb-2 block font-semibold text-slate-300"
            >
              Instructions
            </label>

            <textarea
              id="instructions"
              name="instructions"
              rows="6"
              value={formData.instructions}
              onChange={handleChange}
              placeholder="Describe the requirements, formatting style, references, and other instructions."
              required
              className="w-full resize-none rounded-xl border border-white/10 bg-slate-900 px-4 py-4 text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
            />
          </div>

          <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-4 text-sm leading-6 text-blue-200">
            This service provides academic guidance, editing, research support,
            and learning assistance. Users must follow their institution&apos;s
            academic-integrity rules.
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-green-300">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !user}
            className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-violet-600 py-4 font-bold shadow-lg shadow-blue-500/20 transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
          >
            {submitting ? "Submitting Order..." : "Submit Request"}
          </button>
        </form>

      </div>
    </main>
  );
}