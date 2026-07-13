"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";

import { auth } from "../lib/firebase";

export default function Navbar() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });

    return unsubscribe;
  }, []);

  async function handleLogout() {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      alert("Logout failed.");
    }
  }

  const adminEmail =
    process.env.NEXT_PUBLIC_ADMIN_EMAIL?.trim().toLowerCase();

  const isAdmin =
    user?.email?.trim().toLowerCase() === adminEmail;

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/90 text-white backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 text-xl font-black shadow-lg shadow-blue-500/20">
            Z
          </div>

          <div>
            <h1 className="text-xl font-bold leading-none">
              Zaigi
            </h1>

            <p className="mt-1 text-xs text-slate-400">
              Assignment Services
            </p>
          </div>
        </Link>

        <div className="hidden items-center gap-8 text-sm font-medium text-slate-300 md:flex">
          <Link href="/" className="transition hover:text-white">
            Home
          </Link>

          <Link
            href="/#services"
            className="transition hover:text-white"
          >
            Services
          </Link>

          <Link
            href="/#process"
            className="transition hover:text-white"
          >
            How It Works
          </Link>

          <Link
            href="/#pricing"
            className="transition hover:text-white"
          >
            Pricing
          </Link>

          <Link
            href="/contact"
            className="transition hover:text-white"
          >
            Contact
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {!authLoading && !user && (
            <>
              <Link
                href="/login"
                className="hidden rounded-xl px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white sm:block"
              >
                Login
              </Link>

              <Link
                href="/signup"
                className="rounded-xl bg-gradient-to-r from-blue-500 to-violet-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:scale-105"
              >
                Get Started
              </Link>
            </>
          )}

          {!authLoading && user && !isAdmin && (
            <>
              <Link
                href="/dashboard"
                className="hidden rounded-xl px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white lg:block"
              >
                Dashboard
              </Link>

              <Link
                href="/my-orders"
                className="hidden rounded-xl px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white lg:block"
              >
                My Orders
              </Link>

              <Link
                href="/profile"
                className="hidden rounded-xl px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white lg:block"
              >
                Profile
              </Link>
            </>
          )}

          {!authLoading && user && isAdmin && (
            <>
              <Link
                href="/admin"
                className="rounded-xl bg-gradient-to-r from-blue-500 to-violet-600 px-5 py-2.5 text-sm font-bold text-white"
              >
                Admin
              </Link>

              <Link
                href="/admin/contacts"
                className="hidden rounded-xl px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white lg:block"
              >
                Messages
              </Link>
            </>
          )}

          {!authLoading && user && (
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-2.5 text-sm font-bold text-red-300 transition hover:bg-red-500/20"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}