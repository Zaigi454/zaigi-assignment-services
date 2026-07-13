"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, updateProfile } from "firebase/auth";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { auth, db } from "../../lib/firebase";

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [fullName, setFullName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.replace("/login");
        return;
      }

      setUser(currentUser);
      setEmail(currentUser.email || "");
      setFullName(currentUser.displayName || "");

      try {
        const userReference = doc(db, "users", currentUser.uid);
        const userSnapshot = await getDoc(userReference);

        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();

          setFullName(
            userData.fullName || currentUser.displayName || ""
          );

          setWhatsapp(userData.whatsapp || "");
        }
      } catch (firebaseError) {
        console.error("Profile loading error:", firebaseError);
        setError("Profile information could not be loaded.");
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [router]);

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!user) {
      setError("Please login again.");
      return;
    }

    const cleanName = fullName.trim();
    const cleanWhatsapp = whatsapp.trim();

    if (!cleanName || !cleanWhatsapp) {
      setError("Please enter your full name and WhatsApp number.");
      return;
    }

    try {
      setSaving(true);

      await updateProfile(user, {
        displayName: cleanName,
      });

      await setDoc(
        doc(db, "users", user.uid),
        {
          uid: user.uid,
          fullName: cleanName,
          whatsapp: cleanWhatsapp,
          email: user.email || "",
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      setSuccess("Profile updated successfully.");
    } catch (firebaseError) {
      console.error("Profile update error:", firebaseError);

      if (firebaseError.code === "permission-denied") {
        setError("Database permission denied.");
      } else {
        setError("Profile could not be updated. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <p className="text-slate-300">Loading profile...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-12 text-white">
      <div className="mx-auto max-w-2xl">

        <div className="text-center">
          <p className="font-semibold tracking-widest text-blue-400">
            CUSTOMER PROFILE
          </p>

          <h1 className="mt-3 text-4xl font-black sm:text-5xl">
            Manage Your Profile
          </h1>

          <p className="mt-3 text-slate-400">
            Update your contact information and account details.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-10 space-y-6 rounded-3xl border border-white/10 bg-white/5 p-7 shadow-2xl backdrop-blur-xl sm:p-10"
        >
          <div>
            <label
              htmlFor="fullName"
              className="mb-2 block font-semibold text-slate-300"
            >
              Full Name
            </label>

            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Enter your full name"
              required
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-4 text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="whatsapp"
              className="mb-2 block font-semibold text-slate-300"
            >
              WhatsApp Number
            </label>

            <input
              id="whatsapp"
              type="tel"
              value={whatsapp}
              onChange={(event) => setWhatsapp(event.target.value)}
              placeholder="+92 3XX XXXXXXX"
              required
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-4 text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
            />
          </div>

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
              readOnly
              className="w-full cursor-not-allowed rounded-xl border border-white/10 bg-slate-900/60 px-4 py-4 text-slate-400 outline-none"
            />

            <p className="mt-2 text-sm text-slate-500">
              Email changing will be added later.
            </p>
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
            disabled={saving}
            className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-violet-600 py-4 font-bold shadow-lg shadow-blue-500/20 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving Profile..." : "Save Profile"}
          </button>
        </form>

      </div>
    </main>
  );
}