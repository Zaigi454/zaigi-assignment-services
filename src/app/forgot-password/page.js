"use client";

import { useState } from "react";
import Link from "next/link";
import { sendPasswordResetEmail } from "firebase/auth";

import { auth } from "../../lib/firebase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    setMessage("");
    setError("");

    const cleanEmail = email.trim();

    if (!cleanEmail) {
      setError("Please enter your email address.");
      return;
    }

    try {
      setSending(true);

      await sendPasswordResetEmail(auth, cleanEmail);

      setMessage(
        "Password reset link sent. Please check your inbox and spam folder."
      );

      setEmail("");
    } catch (firebaseError) {
      console.error("Password reset error:", firebaseError);

      if (firebaseError.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (firebaseError.code === "auth/user-not-found") {
        setError("No account was found with this email.");
      } else if (firebaseError.code === "auth/too-many-requests") {
        setError("Too many attempts. Please try again later.");
      } else {
        setError("Reset email could not be sent. Please try again.");
      }
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-12 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl sm:p-10">

        <div className="text-center">
          <p className="font-semibold tracking-widest text-blue-400">
            ACCOUNT RECOVERY
          </p>

          <h1 className="mt-3 text-4xl font-black">
            Forgot Password?
          </h1>

          <p className="mt-3 leading-7 text-slate-400">
            Enter your registered email and we will send you a password reset
            link.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5"
        >
          <div>
            <label
              htmlFor="email"
              className="mb-2 block font-semibold text-slate-300"
            >
              Email Address
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your registered email"
              required
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-4 text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
              {error}
            </div>
          )}

          {message && (
            <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-green-300">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={sending}
            className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-violet-600 py-4 font-bold shadow-lg shadow-blue-500/20 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {sending
              ? "Sending Reset Link..."
              : "Send Reset Link"}
          </button>
        </form>

        <p className="mt-7 text-center text-slate-400">
          Remembered your password?{" "}
          <Link
            href="/login"
            className="font-semibold text-blue-400 hover:text-blue-300"
          >
            Back to Login
          </Link>
        </p>

      </div>
    </main>
  );
}