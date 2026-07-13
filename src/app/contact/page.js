"use client";

import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";

export default function ContactPage() {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    whatsapp: "",
    subject: "",
    message: "",
  });

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setLoading(true);

      await addDoc(collection(db, "contacts"), {
        ...form,
        createdAt: serverTimestamp(),
      });

      alert("Message sent successfully.");

      setForm({
        name: "",
        email: "",
        whatsapp: "",
        subject: "",
        message: "",
      });

    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">

      <div className="mx-auto max-w-3xl">

        <h1 className="text-center text-5xl font-black">
          Contact Us
        </h1>

        <p className="mt-4 text-center text-slate-400">
          We'd love to hear from you.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-12 space-y-5 rounded-3xl border border-white/10 bg-white/5 p-8"
        >

          <input
            name="name"
            placeholder="Full Name"
            required
            value={form.name}
            onChange={handleChange}
            className="w-full rounded-xl border border-white/10 bg-slate-900 p-4 outline-none"
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            required
            value={form.email}
            onChange={handleChange}
            className="w-full rounded-xl border border-white/10 bg-slate-900 p-4 outline-none"
          />

          <input
            name="whatsapp"
            placeholder="WhatsApp Number"
            required
            value={form.whatsapp}
            onChange={handleChange}
            className="w-full rounded-xl border border-white/10 bg-slate-900 p-4 outline-none"
          />

          <input
            name="subject"
            placeholder="Subject"
            required
            value={form.subject}
            onChange={handleChange}
            className="w-full rounded-xl border border-white/10 bg-slate-900 p-4 outline-none"
          />

          <textarea
            rows={6}
            name="message"
            placeholder="Your Message..."
            required
            value={form.message}
            onChange={handleChange}
            className="w-full rounded-xl border border-white/10 bg-slate-900 p-4 outline-none"
          />

          <button
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-violet-600 py-4 font-bold"
          >
            {loading ? "Sending..." : "Send Message"}
          </button>

        </form>

      </div>

    </main>
  );
}