"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { auth, db } from "../../lib/firebase";

const statusOptions = [
  "pending",
  "accepted",
  "in-progress",
  "completed",
  "rejected",
];

function formatText(value = "") {
  return value.replaceAll("-", " ");
}

function statusClasses(status) {
  if (status === "completed") {
    return "border-green-500/30 bg-green-500/10 text-green-300";
  }

  if (status === "in-progress" || status === "accepted") {
    return "border-blue-500/30 bg-blue-500/10 text-blue-300";
  }

  if (status === "rejected") {
    return "border-red-500/30 bg-red-500/10 text-red-300";
  }

  return "border-yellow-500/30 bg-yellow-500/10 text-yellow-300";
}

function paymentClasses(paymentStatus) {
  if (paymentStatus === "paid") {
    return "border-green-500/30 bg-green-500/10 text-green-300";
  }

  if (paymentStatus === "pending-verification") {
    return "border-yellow-500/30 bg-yellow-500/10 text-yellow-300";
  }

  if (paymentStatus === "rejected") {
    return "border-red-500/30 bg-red-500/10 text-red-300";
  }

  return "border-slate-500/30 bg-slate-500/10 text-slate-300";
}

export default function AdminPage() {
  const router = useRouter();

  const [authLoading, setAuthLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPayment, setFilterPayment] = useState("all");
  const [status, setStatus] = useState("pending");
  const [quotedPrice, setQuotedPrice] = useState("");
  const [completedFileUrl, setCompletedFileUrl] = useState("");
  const [adminNote, setAdminNote] = useState("");
  
  const [saving, setSaving] = useState(false);
  const [paymentUpdating, setPaymentUpdating] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let unsubscribeOrders = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/login");
        return;
      }

      const adminEmail =
        process.env.NEXT_PUBLIC_ADMIN_EMAIL?.trim().toLowerCase();

      if (user.email?.toLowerCase() !== adminEmail) {
        router.replace("/dashboard");
        return;
      }

      setAuthLoading(false);

      const ordersQuery = query(
        collection(db, "orders"),
        orderBy("createdAt", "desc")
      );

      unsubscribeOrders = onSnapshot(
        ordersQuery,
        (snapshot) => {
          const orderData = snapshot.docs.map((orderDocument) => ({
            id: orderDocument.id,
            ...orderDocument.data(),
          }));

          setOrders(orderData);
          setOrdersLoading(false);

          setSelectedOrder((currentOrder) => {
            if (!currentOrder) {
              return null;
            }

            return (
              orderData.find(
                (order) => order.id === currentOrder.id
              ) || null
            );
          });
        },
        (firebaseError) => {
          console.error("Orders loading error:", firebaseError);
          setError("Orders could not be loaded.");
          setOrdersLoading(false);
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

      paymentPending: orders.filter(
        (order) =>
          order.paymentStatus === "pending-verification"
      ).length,
      revenue: orders
  .filter((order) => order.paymentStatus === "paid")
  .reduce((total, order) => total + Number(order.quotedPrice || 0), 0),
    };
  }, [orders]);
  const filteredOrders = orders.filter((order) => {
  const searchText = search.toLowerCase();

  const matchesSearch =
    (order.customerName || "")
      .toLowerCase()
      .includes(searchText) ||
    (order.customerEmail || "")
      .toLowerCase()
      .includes(searchText) ||
    (order.subject || "")
      .toLowerCase()
      .includes(searchText) ||
    (order.title || "")
      .toLowerCase()
      .includes(searchText);

  const matchesStatus =
  filterStatus === "all" ||
  order.status === filterStatus;

const matchesPayment =
  filterPayment === "all" ||
  (order.paymentStatus || "not-paid") === filterPayment;

return matchesSearch && matchesStatus && matchesPayment;
});

  function openOrder(order) {
    setSelectedOrder(order);

    setStatus(order.status || "pending");

    setQuotedPrice(
      order.quotedPrice === null ||
        order.quotedPrice === undefined
        ? ""
        : String(order.quotedPrice)
    );

    setCompletedFileUrl(order.completedFileUrl || "");
    setAdminNote(order.adminNote || "");
    setMessage("");
    setError("");
  }

  function closeOrder() {
    setSelectedOrder(null);
    setMessage("");
    setError("");
  }

  async function saveOrderChanges() {
    if (!selectedOrder) {
      return;
    }

    if (quotedPrice !== "" && Number(quotedPrice) < 0) {
      setError("Please enter a valid price.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      await updateDoc(doc(db, "orders", selectedOrder.id), {
  status,
  quotedPrice: quotedPrice === "" ? null : Number(quotedPrice),
  completedFileUrl: completedFileUrl.trim(),
  adminNote: adminNote.trim(),
  notification: true,
  updatedAt: serverTimestamp(),
});

      setMessage("Order updated successfully.");
    } catch (firebaseError) {
      console.error("Order update error:", firebaseError);
      setError("Order could not be updated.");
    } finally {
      setSaving(false);
    }
  }

  async function updatePaymentStatus(newPaymentStatus) {
    if (!selectedOrder) {
      return;
    }

    try {
      setPaymentUpdating(true);
      setError("");
      setMessage("");

      const updateData = {
        paymentStatus: newPaymentStatus,
        paymentVerifiedAt:
          newPaymentStatus === "paid"
            ? serverTimestamp()
            : null,
        updatedAt: serverTimestamp(),
      };

      if (newPaymentStatus === "paid") {
        updateData.status = "in-progress";
        updateData.adminNote =
          "Payment verified. Work on your order has started.";
      }

      if (newPaymentStatus === "rejected") {
        updateData.adminNote =
          "Payment could not be verified. Please check the transaction details and submit again.";
      }

      await updateDoc(
        doc(db, "orders", selectedOrder.id),
        updateData
      );

      setMessage(
        newPaymentStatus === "paid"
          ? "Payment approved successfully."
          : "Payment rejected successfully."
      );
    } catch (firebaseError) {
      console.error(
        "Payment verification error:",
        firebaseError
      );

      setError("Payment status could not be updated.");
    } finally {
      setPaymentUpdating(false);
    }
  }

  if (authLoading || ordersLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <p className="text-lg text-slate-300">
          Loading Admin Panel...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-10 text-white sm:px-8">
      <div className="mx-auto max-w-7xl">

        <div className="mb-10">
          <p className="font-semibold tracking-widest text-blue-400">
            ZAIGI ADMIN
          </p>

          <h1 className="mt-2 text-4xl font-black sm:text-5xl">
            Order Management
          </h1>

          <p className="mt-3 text-slate-400">
            Manage orders, prices, payments and customer updates.
          </p>
        </div>

        <div className="mb-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-6">
          <StatCard
            label="Total Orders"
            value={statistics.total}
          />

          <StatCard
            label="Pending"
            value={statistics.pending}
            valueClass="text-yellow-400"
          />

          <StatCard
            label="In Progress"
            value={statistics.inProgress}
            valueClass="text-blue-400"
          />

          <StatCard
            label="Completed"
            value={statistics.completed}
            valueClass="text-green-400"
          />

          <StatCard
  label="Payment Reviews"
  value={statistics.paymentPending}
  valueClass="text-violet-400"
/>

<StatCard
  label="Revenue"
  value={`Rs. ${statistics.revenue}`}
  valueClass="text-emerald-400"
/>
        </div>

        {error && !selectedOrder && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
            {error}
          </div>
        )}
            <div className="mb-6 grid gap-4 md:grid-cols-3">
  <input
    type="text"
    value={search}
    onChange={(event) => setSearch(event.target.value)}
    placeholder="Search by customer, email, subject or title..."
    className="w-full rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
  />

  <select
    value={filterStatus}
    onChange={(event) => setFilterStatus(event.target.value)}
    
    className="w-full rounded-xl border border-white/10 bg-slate-900 px-5 py-4 text-white outline-none focus:border-blue-500"
  >
    <option value="all">All Statuses</option>
    <option value="pending">Pending</option>
    <option value="accepted">Accepted</option>
    <option value="in-progress">In Progress</option>
    <option value="completed">Completed</option>
    <option value="rejected">Rejected</option>
  </select>

<select
  value={filterPayment}
  onChange={(event) => setFilterPayment(event.target.value)}
  className="w-full rounded-xl border border-white/10 bg-slate-900 px-5 py-4 text-white outline-none focus:border-blue-500"
>
  <option value="all">All Payments</option>
  <option value="not-paid">Not Paid</option>
  <option value="pending-verification">Pending Verification</option>
  <option value="paid">Paid</option>
  <option value="rejected">Rejected</option>
</select>

</div>
  

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl">

          <div className="border-b border-white/10 px-6 py-5">
            <h2 className="text-2xl font-bold">
              Customer Orders
            </h2>
          </div>

          {orders.length === 0 ? (
            <div className="p-10 text-center text-slate-400">
              No orders have been submitted yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px]">

                <thead className="bg-white/5 text-sm text-slate-300">
                  <tr>
                    <th className="p-4 text-left">
                      Customer
                    </th>

                    <th className="p-4 text-left">
                      Subject
                    </th>

                    <th className="p-4 text-left">
                      Pages
                    </th>

                    <th className="p-4 text-left">
                      Deadline
                    </th>

                    <th className="p-4 text-left">
                      Price
                    </th>

                    <th className="p-4 text-left">
                      Payment
                    </th>

                    <th className="p-4 text-left">
                      Status
                    </th>

                    <th className="p-4 text-left">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-t border-white/10 text-sm hover:bg-white/[0.03]"
                    >
                      <td className="p-4">
                        <p className="font-semibold text-white">
                          {order.customerName || "Customer"}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {order.customerEmail}
                        </p>
                      </td>

                      <td className="p-4">
                        <p className="font-medium">
                          {order.subject}
                        </p>

                        <p className="mt-1 max-w-[230px] truncate text-xs text-slate-400">
                          {order.title}
                        </p>
                      </td>

                      <td className="p-4">
                        {order.pages || "—"}
                      </td>

                      <td className="p-4">
                        {order.deadline || "—"}
                      </td>

                      <td className="p-4">
                        {order.quotedPrice === null ||
                        order.quotedPrice === undefined
                          ? "Not set"
                          : `Rs. ${order.quotedPrice}`}
                      </td>

                      <td className="p-4">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${paymentClasses(
                            order.paymentStatus || "not-paid"
                          )}`}
                        >
                          {formatText(
                            order.paymentStatus || "not-paid"
                          )}
                        </span>
                      </td>

                      <td className="p-4">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${statusClasses(
                            order.status
                          )}`}
                        >
                          {formatText(order.status)}
                        </span>
                      </td>

                      <td className="p-4">
                        <button
                          type="button"
                          onClick={() => openOrder(order)}
                          className="rounded-lg bg-gradient-to-r from-blue-500 to-violet-600 px-4 py-2 font-semibold transition hover:scale-105"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          )}
        </div>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">

          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl sm:p-8">

            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-sm font-semibold text-blue-400">
                  ORDER DETAILS
                </p>

                <h2 className="mt-2 text-2xl font-black">
                  {selectedOrder.title}
                </h2>

                <p className="mt-2 break-all text-sm text-slate-400">
                  ID: {selectedOrder.id}
                </p>
              </div>

              <button
                type="button"
                onClick={closeOrder}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-slate-300 hover:bg-white/10"
              >
                Close
              </button>
            </div>

            <div className="mt-8 grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 sm:grid-cols-2">

              <Detail
                label="Customer"
                value={selectedOrder.customerName}
              />

              <Detail
                label="Email"
                value={selectedOrder.customerEmail}
              />

              <Detail
                label="Service"
                value={selectedOrder.service}
              />

              <Detail
                label="Subject"
                value={selectedOrder.subject}
              />

              <Detail
                label="Pages"
                value={selectedOrder.pages}
              />

              <Detail
                label="Deadline"
                value={selectedOrder.deadline}
              />
            </div>

            <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-5">

              <p className="text-sm font-semibold text-slate-400">
                Instructions
              </p>

              <p className="mt-3 whitespace-pre-wrap leading-7 text-slate-200">
                {selectedOrder.instructions ||
                  "No instructions provided."}
              </p>
            </div>

            <div className="mt-6 rounded-2xl border border-violet-500/20 bg-violet-500/10 p-5">

              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

                <div>
                  <p className="text-sm font-semibold text-violet-300">
                    PAYMENT INFORMATION
                  </p>

                  <p className="mt-2 capitalize text-white">
                    Status:{" "}
                    {formatText(
                      selectedOrder.paymentStatus ||
                        "not-paid"
                    )}
                  </p>
                </div>

                <span
                  className={`w-fit rounded-full border px-4 py-2 text-sm font-semibold capitalize ${paymentClasses(
                    selectedOrder.paymentStatus || "not-paid"
                  )}`}
                >
                  {formatText(
                    selectedOrder.paymentStatus ||
                      "not-paid"
                  )}
                </span>
              </div>

              {selectedOrder.paymentMethod && (
                <div className="mt-5 grid gap-4 sm:grid-cols-2">

                  <Detail
                    label="Payment Method"
                    value={formatText(
                      selectedOrder.paymentMethod
                    )}
                  />

                  <Detail
                    label="Transaction ID"
                    value={selectedOrder.transactionId}
                  />
                </div>
              )}

              {selectedOrder.paymentStatus ===
                "pending-verification" && (
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">

                  <button
                    type="button"
                    disabled={paymentUpdating}
                    onClick={() =>
                      updatePaymentStatus("paid")
                    }
                    className="flex-1 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-3 font-bold disabled:opacity-50"
                  >
                    Approve Payment
                  </button>

                  <button
                    type="button"
                    disabled={paymentUpdating}
                    onClick={() =>
                      updatePaymentStatus("rejected")
                    }
                    className="flex-1 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 px-6 py-3 font-bold disabled:opacity-50"
                  >
                    Reject Payment
                  </button>
                </div>
              )}
            </div>

            <div className="mt-7 grid gap-5 sm:grid-cols-2">

              <div>
                <label
                  htmlFor="orderStatus"
                  className="mb-2 block font-semibold text-slate-300"
                >
                  Order Status
                </label>

                <select
                  id="orderStatus"
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value)
                  }
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-4 text-white outline-none focus:border-blue-500"
                >
                  {statusOptions.map((statusOption) => (
                    <option
                      key={statusOption}
                      value={statusOption}
                    >
                      {formatText(statusOption)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="quotedPrice"
                  className="mb-2 block font-semibold text-slate-300"
                >
                  Quoted Price (Rs.)
                </label>

                <input
                  id="quotedPrice"
                  type="number"
                  min="0"
                  value={quotedPrice}
                  onChange={(event) =>
                    setQuotedPrice(event.target.value)
                  }
                  placeholder="e.g. 2500"
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-4 text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="mt-5">
              <label
                htmlFor="adminNote"
                className="mb-2 block font-semibold text-slate-300"
              >
                <div className="mt-5">
  <label
    htmlFor="completedFileUrl"
    className="mb-2 block font-semibold text-slate-300"
  >
    Completed File URL (Google Drive)
  </label>

  <input
    id="completedFileUrl"
    type="url"
    value={completedFileUrl}
    onChange={(e) => setCompletedFileUrl(e.target.value)}
    placeholder="https://drive.google.com/..."
    className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-4 text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
  />
</div>
                Note for Customer
              </label>

              <textarea
                id="adminNote"
                rows="4"
                value={adminNote}
                onChange={(event) =>
                  setAdminNote(event.target.value)
                }
                placeholder="Write price, payment or progress instructions..."
                className="w-full resize-none rounded-xl border border-white/10 bg-slate-950 px-4 py-4 text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
              />
            </div>

            {error && (
              <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
                {error}
              </div>
            )}

            {message && (
              <div className="mt-5 rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-green-300">
                {message}
              </div>
            )}

            <button
              type="button"
              onClick={saveOrderChanges}
              disabled={saving}
              className="mt-7 w-full rounded-xl bg-gradient-to-r from-blue-500 to-violet-600 py-4 font-bold shadow-lg shadow-blue-500/20 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Saving Changes..."
                : "Save Order Changes"}
            </button>

          </div>
        </div>
      )}
    </main>
  );
}

function StatCard({
  label,
  value,
  valueClass = "text-white",
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <p className="text-slate-400">{label}</p>

      <h2
        className={`mt-3 text-4xl font-black ${valueClass}`}
      >
        {value}
      </h2>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-1 break-words text-slate-200">
        {value || "—"}
      </p>
    </div>
  );
}