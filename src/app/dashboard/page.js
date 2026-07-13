"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  collection,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";

import { auth, db } from "../../lib/firebase";

function formatStatus(status = "pending") {
  return status.replaceAll("-", " ");
}

function statusStyle(status) {
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

export default function DashboardPage() {
  async function markNotificationsAsRead() {
  try {
    const updates = orders
      .filter((order) => order.notification === true)
      .map((order) =>
        updateDoc(doc(db, "orders", order.id), {
          notification: false,
        })
      );

    await Promise.all(updates);
  } catch (error) {
    console.error(error);
  }
}
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let unsubscribeOrders = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.replace("/login");
        return;
      }

      setUser(currentUser);

      const customerOrdersQuery = query(
        collection(db, "orders"),
        where("userId", "==", currentUser.uid)
      );

      unsubscribeOrders = onSnapshot(
        customerOrdersQuery,
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
          console.error("Dashboard orders error:", firebaseError);
          setError("Orders could not be loaded.");
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

  const statistics = useMemo(() => {
  return {
    total: orders.length,

    pending: orders.filter(
      (order) => order.status === "pending"
    ).length,

    inProgress: orders.filter((order) =>
      ["accepted", "in-progress"].includes(order.status)
    ).length,

    completed: orders.filter(
      (order) => order.status === "completed"
    ).length,

    notifications: orders.filter(
      (order) => order.notification === true
    ).length,
  };
}, [orders]);

  async function handleLogout() {
    try {
      await signOut(auth);
      router.replace("/login");
    } catch (firebaseError) {
      console.error("Logout error:", firebaseError);
      setError("Logout failed. Please try again.");
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />

          <p className="mt-5 text-slate-300">
            Loading your dashboard...
          </p>
        </div>
      </main>
    );
  }

  const recentOrders = orders.slice(0, 5);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Top Navigation */}

      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">

          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 text-xl font-black shadow-lg shadow-blue-500/20">
              Z
            </div>

            <div>
              <p className="font-black">Zaigi</p>
              <p className="text-xs text-slate-400">
                Customer Portal
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            <Link
              href="/dashboard"
              className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold"
            >
              Dashboard
            </Link>

            <Link
              href="/orders"
              className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-white/10 hover:text-white"
            >
              New Order
            </Link>

            <Link
              href="/my-orders"
              className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-white/10 hover:text-white"
            >
              My Orders
            </Link>

            <Link
              href="/profile"
              className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-white/10 hover:text-white"
            >
              Profile
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="ml-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-300 hover:bg-red-500/20"
            >
              Logout
            </button>
          </nav>

          <button
            type="button"
            onClick={() => setMenuOpen((current) => !current)}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 md:hidden"
          >
            Menu
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-white/10 px-5 py-4 md:hidden">
            <div className="grid gap-2">
              <Link
                href="/dashboard"
                className="rounded-xl bg-white/10 px-4 py-3"
              >
                Dashboard
              </Link>

              <Link
                href="/orders"
                className="rounded-xl px-4 py-3 text-slate-300 hover:bg-white/10"
              >
                New Order
              </Link>

              <Link
                href="/my-orders"
                className="rounded-xl px-4 py-3 text-slate-300 hover:bg-white/10"
              >
                My Orders
              </Link>

              <Link
                href="/profile"
                className="rounded-xl px-4 py-3 text-slate-300 hover:bg-white/10"
              >
                Profile
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-xl bg-red-500/10 px-4 py-3 text-left text-red-300"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </header>

      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        {/* Welcome Section */}

        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-blue-500/15 via-white/5 to-violet-500/15 p-7 shadow-2xl sm:p-10">

          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-violet-600/20 blur-3xl" />
          <div className="absolute -bottom-20 left-10 h-56 w-56 rounded-full bg-blue-600/20 blur-3xl" />

          <div className="relative flex flex-col justify-between gap-8 lg:flex-row lg:items-center">

            <div>
              <p className="font-semibold tracking-widest text-blue-400">
                CUSTOMER DASHBOARD
              </p>

              <h1 className="mt-3 text-4xl font-black sm:text-5xl">
                Welcome,{" "}
                <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                  {user?.displayName || "Customer"}
                </span>
              </h1>

              <p className="mt-4 max-w-2xl leading-7 text-slate-300">
                Submit new requests, track progress, view quotations and
                manage your profile from one secure dashboard.
              </p>
            </div>

            <button
              type="button"
              onClick={() => router.push("/orders")}
              className="w-fit rounded-xl bg-gradient-to-r from-blue-500 to-violet-600 px-7 py-4 font-bold shadow-xl shadow-blue-500/20 transition hover:scale-105"
            >
              + Place New Order
            </button>
          </div>
        </section>

        {error && (
          
          <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
            {error}
          </div>
        )}
       {statistics.notifications > 0 && (
  <section className="mt-6 rounded-2xl border border-violet-500/30 bg-violet-500/10 p-5">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div className="flex items-center gap-4">
        <div className="text-3xl">🔔</div>

        <div>
          <h2 className="font-bold text-violet-300">
            You have {statistics.notifications} new update
            {statistics.notifications > 1 ? "s" : ""}
          </h2>

          <p className="mt-1 text-sm text-slate-300">
            Admin updated your order status, price, payment, or note.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={markNotificationsAsRead}
        className="rounded-xl border border-violet-400/30 bg-violet-500/20 px-5 py-3 font-semibold text-violet-200 transition hover:bg-violet-500/30"
      >
        Mark as Read
      </button>
    </div>
  </section>
)}
        {/* Statistics */}

        <section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          <DashboardCard
            title="Total Orders"
            value={statistics.total}
            icon="📋"
          />

          <DashboardCard
            title="Pending"
            value={statistics.pending}
            valueClass="text-yellow-400"
            icon="⏳"
          />

          <DashboardCard
            title="In Progress"
            value={statistics.inProgress}
            valueClass="text-blue-400"
            icon="✍️"
          />

          <DashboardCard
            title="Completed"
            value={statistics.completed}
            valueClass="text-green-400"
            icon="✅"
          />
          <DashboardCard
            title="Notifications"
            value={statistics.notifications}
            valueClass="text-red-400"
            icon="🔔"
          />
        </section>

        {/* Quick Actions */}

        <section className="mt-8 grid gap-5 md:grid-cols-3">
          <QuickAction
            title="Submit New Order"
            description="Enter subject, pages, deadline and complete instructions."
            buttonText="Place Order"
            onClick={() => router.push("/orders")}
            icon="📝"
          />

          <QuickAction
            title="Track My Orders"
            description="View quotation, payment status and admin updates."
            buttonText="View Orders"
            onClick={() => router.push("/my-orders")}
            icon="📦"
          />

          <QuickAction
            title="Manage Profile"
            description="Update your name and WhatsApp contact details."
            buttonText="Open Profile"
            onClick={() => router.push("/profile")}
            icon="👤"
          />
        </section>

        {/* Recent Orders */}

        <section className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-xl">
          <div className="flex flex-col justify-between gap-4 border-b border-white/10 px-6 py-5 sm:flex-row sm:items-center">

            <div>
              <h2 className="text-2xl font-black">
                Recent Orders
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Your latest assignment requests and updates.
              </p>
            </div>

            <Link
              href="/my-orders"
              className="font-semibold text-blue-400 hover:text-blue-300"
            >
              View All Orders →
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="p-10 text-center">
              <div className="text-5xl">📭</div>

              <h3 className="mt-5 text-2xl font-bold">
                No orders submitted yet
              </h3>

              <p className="mt-3 text-slate-400">
                Start by submitting your first academic support request.
              </p>

              <button
                type="button"
                onClick={() => router.push("/orders")}
                className="mt-6 rounded-xl bg-gradient-to-r from-blue-500 to-violet-600 px-6 py-3 font-bold"
              >
                Place First Order
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[750px]">
                <thead className="bg-white/5 text-sm text-slate-400">
                  <tr>
                    <th className="p-4 text-left">Order</th>
                    <th className="p-4 text-left">Subject</th>
                    <th className="p-4 text-left">Deadline</th>
                    <th className="p-4 text-left">Price</th>
                    <th className="p-4 text-left">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-t border-white/10 hover:bg-white/[0.03]"
                    >
                      <td className="p-4">
                        <p className="font-semibold">
                          {order.title}
                        </p>

                        <p className="mt-1 text-xs text-blue-400">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </p>
                      </td>

                      <td className="p-4 text-slate-300">
                        {order.subject}
                      </td>

                      <td className="p-4 text-slate-300">
                        {order.deadline || "—"}
                      </td>

                      <td className="p-4">
                        {order.quotedPrice === null ||
                        order.quotedPrice === undefined
                          ? "Waiting"
                          : `Rs. ${order.quotedPrice}`}
                      </td>

                      <td className="p-4">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${statusStyle(
                            order.status
                          )}`}
                        >
                          {formatStatus(order.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Support */}

        <section className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-7 sm:p-8">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">

            <div>
              <h2 className="text-2xl font-black">
                Need Help?
              </h2>

              <p className="mt-2 text-slate-400">
                Contact support through WhatsApp for order assistance.
              </p>
            </div>

            <a
              href="https://wa.me/923297128816"
              target="_blank"
              rel="noopener noreferrer"
              className="w-fit rounded-xl border border-green-500/30 bg-green-500/10 px-6 py-3 font-bold text-green-300 transition hover:bg-green-500/20"
            >
              Chat on WhatsApp
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}

function DashboardCard({
  title,
  value,
  icon,
  valueClass = "text-white",
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg transition hover:-translate-y-1 hover:border-blue-500/30">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-400">{title}</p>

          <h2 className={`mt-3 text-4xl font-black ${valueClass}`}>
            {value}
          </h2>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-2xl">
          {icon}
        </div>
      </div>
    </div>
  );
}

function QuickAction({
  title,
  description,
  buttonText,
  onClick,
  icon,
}) {
  return (
    <article className="rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:-translate-y-1 hover:border-violet-500/30">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 text-3xl">
        {icon}
      </div>

      <h3 className="mt-5 text-xl font-black">
        {title}
      </h3>

      <p className="mt-3 min-h-[56px] leading-7 text-slate-400">
        {description}
      </p>

      <button
        type="button"
        onClick={onClick}
        className="mt-5 font-bold text-blue-400 hover:text-blue-300"
      >
        {buttonText} →
      </button>
    </article>
  );
}