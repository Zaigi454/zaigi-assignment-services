"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";

import { auth, db } from "../../../lib/firebase";

export default function AdminContactsPage() {
  const router = useRouter();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let unsubscribeMessages = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/login");
        return;
      }

      const adminEmail =
        process.env.NEXT_PUBLIC_ADMIN_EMAIL
          ?.trim()
          .toLowerCase();

      if (user.email?.toLowerCase() !== adminEmail) {
        router.replace("/dashboard");
        return;
      }

      const messagesQuery = query(
        collection(db, "contacts"),
        orderBy("createdAt", "desc")
      );

      unsubscribeMessages = onSnapshot(
        messagesQuery,
        (snapshot) => {
          const data = snapshot.docs.map(
            (messageDocument) => ({
              id: messageDocument.id,
              ...messageDocument.data(),
            })
          );

          setMessages(data);
          setLoading(false);
        },
        (firebaseError) => {
          console.error(
            "Contact messages error:",
            firebaseError
          );

          setError(
            "Contact messages could not be loaded."
          );

          setLoading(false);
        }
      );
    });

    return () => {
      unsubscribeAuth();

      if (unsubscribeMessages) {
        unsubscribeMessages();
      }
    };
  }, [router]);

  async function deleteMessage(message) {
    const confirmed = window.confirm(
      `Delete message from ${
        message.name || "this customer"
      }?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(message.id);
      setError("");

      await deleteDoc(
        doc(db, "contacts", message.id)
      );
    } catch (firebaseError) {
      console.error(
        "Delete message error:",
        firebaseError
      );

      setError(
        "Message could not be deleted."
      );
    } finally {
      setDeletingId("");
    }
  }

  function formatDate(timestamp) {
    if (!timestamp?.toDate) {
      return "Just now";
    }

    return timestamp
      .toDate()
      .toLocaleString();
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <p className="text-slate-300">
          Loading contact messages...
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
              ZAIGI ADMIN
            </p>

            <h1 className="mt-2 text-4xl font-black sm:text-5xl">
              Contact Messages
            </h1>

            <p className="mt-3 text-slate-400">
              Review customer questions and contact requests.
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push("/admin")}
            className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 font-semibold text-slate-300 transition hover:bg-white/10"
          >
            ← Back to Admin
          </button>
        </div>

        <div className="mb-8 rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-slate-400">
            Total Messages
          </p>

          <h2 className="mt-3 text-4xl font-black">
            {messages.length}
          </h2>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
            {error}
          </div>
        )}

        {messages.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-slate-400">
            No contact messages yet.
          </div>
        ) : (
          <div className="grid gap-6">
            {messages.map((message) => (
              <article
                key={message.id}
                className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl sm:p-8"
              >
                <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
                  <div>
                    <p className="text-sm font-semibold text-blue-400">
                      {message.subject || "Contact Request"}
                    </p>

                    <h2 className="mt-2 text-2xl font-black">
                      {message.name || "Customer"}
                    </h2>

                    <p className="mt-2 text-sm text-slate-400">
                      {formatDate(message.createdAt)}
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={deletingId === message.id}
                    onClick={() => deleteMessage(message)}
                    className="rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-3 font-semibold text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {deletingId === message.id
                      ? "Deleting..."
                      : "Delete"}
                  </button>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                    <p className="text-sm text-slate-500">
                      Email
                    </p>

                    <a
                      href={`mailto:${message.email || ""}`}
                      className="mt-1 block break-all font-semibold text-blue-300 hover:text-blue-200"
                    >
                      {message.email || "—"}
                    </a>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                    <p className="text-sm text-slate-500">
                      WhatsApp
                    </p>

                    <a
                      href={`https://wa.me/${String(
                        message.whatsapp || ""
                      ).replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 block font-semibold text-green-300 hover:text-green-200"
                    >
                      {message.whatsapp || "—"}
                    </a>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/70 p-5">
                  <p className="text-sm font-semibold text-slate-500">
                    Message
                  </p>

                  <p className="mt-3 whitespace-pre-wrap leading-7 text-slate-200">
                    {message.message ||
                      "No message provided."}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}