"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import type { CustomOrderStatus, PaymentStatus } from "@prisma/client";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CustomOrder {
  id: string;
  orderNumber: string;
  theme: string;
  name: string;
  phone: string;
  email: string;
  occasion: string;
  budget: string;
  deliveryDate: string;
  recipientLocation: string;
  specialRequests: string | null;
  status: CustomOrderStatus;
  paymentStatus: PaymentStatus;
  finalPriceKes: number | null;
  adminNotes: string | null;
  contactedAt: string | null;
  createdAt: string;
}

// ─── Status Workflow ───────────────────────────────────────────────────────────

const STATUS_FLOW: CustomOrderStatus[] = [
  "PENDING",
  "CONTACTED",
  "CONFIRMED",
  "IN_PROGRESS",
  "READY",
  "DELIVERED",
];

const STATUS_LABELS: Record<CustomOrderStatus, string> = {
  PENDING: "Pending",
  CONTACTED: "Contacted",
  CONFIRMED: "Confirmed",
  IN_PROGRESS: "In Progress",
  READY: "Ready",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

const STATUS_COLORS: Record<CustomOrderStatus, string> = {
  PENDING: "bg-bloom-blush text-bloom-charcoal border-bloom-blush-dark",
  CONTACTED: "bg-blue-100 text-blue-800 border-blue-200",
  CONFIRMED: "bg-bloom-sage/20 text-bloom-sage-dark border-bloom-sage",
  IN_PROGRESS: "bg-bloom-gold/20 text-bloom-gold-dark border-bloom-gold",
  READY: "bg-purple-100 text-purple-800 border-purple-200",
  DELIVERED: "bg-green-100 text-green-800 border-green-200",
  CANCELLED: "bg-rose-100 text-rose-800 border-rose-200",
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-KE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CustomOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<CustomOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [notes, setNotes] = useState("");
  const [finalPrice, setFinalPrice] = useState<string>("");

  useEffect(() => {
    fetchOrder();
  }, [id]);

  async function fetchOrder() {
    try {
      const res = await fetch(`/api/admin/custom-orders/${id}`);
      const data = await res.json();
      if (data.order) {
        setOrder(data.order);
        setNotes(data.order.adminNotes || "");
        setFinalPrice(data.order.finalPriceKes?.toString() || "");
      }
    } catch (error) {
      console.error("Failed to fetch custom order:", error);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(newStatus: CustomOrderStatus) {
    if (!order) return;
    setUpdating(true);

    try {
      const res = await fetch(`/api/admin/custom-orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (data.success) {
        setOrder({ ...order, status: newStatus });
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setUpdating(false);
    }
  }

  async function saveNotes() {
    if (!order) return;
    setUpdating(true);

    try {
      const res = await fetch(`/api/admin/custom-orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminNotes: notes }),
      });

      const data = await res.json();
      if (data.success) {
        setOrder({ ...order, adminNotes: notes });
      }
    } catch (error) {
      console.error("Failed to save notes:", error);
    } finally {
      setUpdating(false);
    }
  }

  async function updatePaymentStatus(newStatus: PaymentStatus) {
    if (!order) return;
    setUpdating(true);

    try {
      const res = await fetch(`/api/admin/custom-orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus: newStatus }),
      });

      const data = await res.json();
      if (data.success) {
        setOrder({ ...order, paymentStatus: newStatus });
      }
    } catch (error) {
      console.error("Failed to update payment status:", error);
    } finally {
      setUpdating(false);
    }
  }

  async function saveFinalPrice() {
    if (!order) return;
    setUpdating(true);

    const price = parseInt(finalPrice, 10);
    if (isNaN(price) || price < 0) {
      alert("Please enter a valid price");
      setUpdating(false);
      return;
    }

    try {
      const res = await fetch(`/api/admin/custom-orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ finalPriceKes: price }),
      });

      const data = await res.json();
      if (data.success) {
        setOrder({ ...order, finalPriceKes: price });
      }
    } catch (error) {
      console.error("Failed to save price:", error);
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="font-inter text-bloom-taupe">Loading custom order...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
        <p className="font-inter text-bloom-taupe">Custom order not found</p>
        <Link href="/admin/custom-orders" className="font-inter text-sm text-bloom-sage hover:underline">
          ← Back to Custom Orders
        </Link>
      </div>
    );
  }

  const currentStatusIndex = STATUS_FLOW.indexOf(order.status);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/admin/custom-orders" className="font-inter text-xs text-bloom-sage hover:underline">
            ← Back to Custom Orders
          </Link>
          <h1 className="font-cormorant mt-2 text-4xl font-light text-bloom-charcoal">
            {order.orderNumber}
          </h1>
          <p className="font-inter mt-1 text-sm text-bloom-taupe">
            {order.theme} — Requested {formatDate(order.createdAt)}
          </p>
        </div>
        <div className="flex gap-2">
          <span className={`font-inter px-3 py-1.5 text-xs uppercase tracking-[0.12em] border ${STATUS_COLORS[order.status]}`}>
            {STATUS_LABELS[order.status]}
          </span>
          <span className={`font-inter px-3 py-1.5 text-xs uppercase tracking-[0.12em] ${order.paymentStatus === "PAID" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
            {order.paymentStatus.replace(/_/g, " ")}
          </span>
        </div>
      </div>

      {/* Status Workflow */}
      <section className="border border-bloom-sage-light/30 bg-bloom-parchment/20 p-6">
        <h2 className="font-cormorant mb-6 text-2xl font-light text-bloom-charcoal">Order Status</h2>
        
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute left-0 right-0 top-5 h-0.5 bg-bloom-sage-light/30" />
          <div 
            className="absolute left-0 top-5 h-0.5 bg-bloom-sage transition-all duration-500"
            style={{ width: `${(currentStatusIndex / (STATUS_FLOW.length - 1)) * 100}%` }}
          />

          {/* Status Steps */}
          <div className="relative flex justify-between">
            {STATUS_FLOW.map((status, index) => {
              const isActive = index <= currentStatusIndex;
              const isCurrent = index === currentStatusIndex;
              
              return (
                <div key={status} className="flex flex-col items-center gap-2">
                  <button
                    onClick={() => updateStatus(status)}
                    disabled={updating || index < currentStatusIndex}
                    className={`h-10 w-10 rounded-full border-2 font-inter text-xs font-medium transition-all ${
                      isActive
                        ? "border-bloom-sage bg-bloom-sage text-bloom-cream"
                        : "border-bloom-sage-light/50 bg-bloom-cream text-bloom-taupe"
                    } ${isCurrent ? "ring-2 ring-bloom-sage ring-offset-2" : ""}`}
                  >
                    {index + 1}
                  </button>
                  <span className={`font-inter text-[10px] uppercase tracking-[0.12em] ${isActive ? "text-bloom-charcoal" : "text-bloom-taupe"}`}>
                    {STATUS_LABELS[status]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 flex flex-wrap gap-2">
          {order.status !== "DELIVERED" && order.status !== "CANCELLED" && (
            <>
              {order.status === "PENDING" && (
                <button
                  onClick={() => updateStatus("CONTACTED")}
                  disabled={updating}
                  className="font-inter bg-bloom-charcoal px-4 py-2 text-xs uppercase tracking-[0.14em] text-bloom-cream transition-colors hover:bg-bloom-sage disabled:opacity-50"
                >
                  {updating ? "Updating..." : "Mark Contacted"}
                </button>
              )}
              {order.status === "CONTACTED" && (
                <button
                  onClick={() => updateStatus("CONFIRMED")}
                  disabled={updating}
                  className="font-inter bg-bloom-charcoal px-4 py-2 text-xs uppercase tracking-[0.14em] text-bloom-cream transition-colors hover:bg-bloom-sage disabled:opacity-50"
                >
                  {updating ? "Updating..." : "Confirm Order"}
                </button>
              )}
              {order.status === "CONFIRMED" && (
                <button
                  onClick={() => updateStatus("IN_PROGRESS")}
                  disabled={updating}
                  className="font-inter bg-bloom-charcoal px-4 py-2 text-xs uppercase tracking-[0.14em] text-bloom-cream transition-colors hover:bg-bloom-sage disabled:opacity-50"
                >
                  {updating ? "Updating..." : "Start Arranging"}
                </button>
              )}
              {order.status === "IN_PROGRESS" && (
                <button
                  onClick={() => updateStatus("READY")}
                  disabled={updating}
                  className="font-inter bg-bloom-charcoal px-4 py-2 text-xs uppercase tracking-[0.14em] text-bloom-cream transition-colors hover:bg-bloom-sage disabled:opacity-50"
                >
                  {updating ? "Updating..." : "Mark Ready"}
                </button>
              )}
              {order.status === "READY" && (
                <button
                  onClick={() => updateStatus("DELIVERED")}
                  disabled={updating}
                  className="font-inter bg-green-600 px-4 py-2 text-xs uppercase tracking-[0.14em] text-white transition-colors hover:bg-green-700 disabled:opacity-50"
                >
                  {updating ? "Updating..." : "Mark Delivered"}
                </button>
              )}
            </>
          )}
          
          {/* Cancel Button */}
          {order.status !== "DELIVERED" && order.status !== "CANCELLED" && (
            <button
              onClick={() => updateStatus("CANCELLED")}
              disabled={updating}
              className="font-inter border border-rose-300 px-4 py-2 text-xs uppercase tracking-[0.14em] text-rose-600 transition-colors hover:bg-rose-50 disabled:opacity-50"
            >
              Cancel Order
            </button>
          )}
        {/* Payment Toggle */}
          <button
            onClick={() => updatePaymentStatus(order.paymentStatus === "PAID" ? "UNPAID" : "PAID")}
            disabled={updating}
            className={`font-inter border px-4 py-2 text-xs uppercase tracking-[0.14em] transition-colors disabled:opacity-50 ${
              order.paymentStatus === "PAID"
                ? "border-rose-300 text-rose-600 hover:bg-rose-50"
                : "border-green-300 text-green-600 hover:bg-green-50"
            }`}
          >
            {order.paymentStatus === "PAID" ? "Mark Unpaid" : "Mark Paid"}
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Customer Info */}
        <section className="border border-bloom-sage-light/30 p-6">
          <h2 className="font-cormorant mb-4 text-xl font-light text-bloom-charcoal">Customer</h2>
          <div className="space-y-2">
            <p className="font-inter text-sm text-bloom-charcoal">{order.name}</p>
            <p className="font-inter text-sm text-bloom-taupe">{order.phone}</p>
            <p className="font-inter text-sm text-bloom-taupe">{order.email}</p>
          </div>
        </section>

        {/* Order Details */}
        <section className="border border-bloom-sage-light/30 p-6">
          <h2 className="font-cormorant mb-4 text-xl font-light text-bloom-charcoal">Order Details</h2>
          <div className="space-y-3">
            <div>
              <p className="font-inter text-xs uppercase tracking-[0.12em] text-bloom-taupe">Theme</p>
              <p className="font-inter text-sm text-bloom-charcoal">{order.theme}</p>
            </div>
            <div>
              <p className="font-inter text-xs uppercase tracking-[0.12em] text-bloom-taupe">Occasion</p>
              <p className="font-inter text-sm text-bloom-charcoal">{order.occasion}</p>
            </div>
            <div>
              <p className="font-inter text-xs uppercase tracking-[0.12em] text-bloom-taupe">Budget</p>
              <p className="font-inter text-sm text-bloom-charcoal">{order.budget}</p>
            </div>
            <div>
              <p className="font-inter text-xs uppercase tracking-[0.12em] text-bloom-taupe">Delivery</p>
              <p className="font-inter text-sm text-bloom-charcoal">
                {formatDate(order.deliveryDate)} — {order.recipientLocation}
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Payment & Pricing */}
      <section className="border border-bloom-sage-light/30 bg-bloom-parchment/20 p-6">
        <h2 className="font-cormorant mb-4 text-xl font-light text-bloom-charcoal">Payment & Pricing</h2>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Budget Range */}
          <div>
            <p className="font-inter text-xs uppercase tracking-[0.12em] text-bloom-taupe">Customer Budget</p>
            <p className="font-inter text-lg text-bloom-charcoal">{order.budget}</p>
          </div>

          {/* Final Price Input */}
          <div>
            <p className="font-inter text-xs uppercase tracking-[0.12em] text-bloom-taupe">Agreed Final Price (KES)</p>
            <div className="mt-2 flex gap-2">
              <input
                type="number"
                value={finalPrice}
                onChange={(e) => setFinalPrice(e.target.value)}
                placeholder="Enter final price"
                className="font-inter flex-1 border border-bloom-sage-light/50 bg-bloom-cream px-4 py-2 text-sm text-bloom-charcoal placeholder:text-bloom-taupe/60 focus:border-bloom-charcoal focus:outline-none"
              />
              <button
                onClick={saveFinalPrice}
                disabled={updating}
                className="font-inter bg-bloom-charcoal px-4 py-2 text-xs uppercase tracking-[0.14em] text-bloom-cream transition-colors hover:bg-bloom-sage disabled:opacity-50"
              >
                Save
              </button>
            </div>
            {order.finalPriceKes && (
              <p className="font-inter mt-2 text-sm text-bloom-sage">
                Current: Ksh {order.finalPriceKes.toLocaleString()}
              </p>
            )}
          </div>
        </div>

        {/* Payment Status */}
        <div className="mt-6 border-t border-bloom-sage-light/30 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-inter text-xs uppercase tracking-[0.12em] text-bloom-taupe">Payment Status</p>
              <p className={`font-inter mt-1 text-sm font-medium ${order.paymentStatus === "PAID" ? "text-green-600" : "text-amber-600"}`}>
                {order.paymentStatus.replace(/_/g, " ")}
              </p>
            </div>
            <button
              onClick={() => updatePaymentStatus(order.paymentStatus === "PAID" ? "UNPAID" : "PAID")}
              disabled={updating}
              className={`font-inter border px-4 py-2 text-xs uppercase tracking-[0.14em] transition-colors disabled:opacity-50 ${
                order.paymentStatus === "PAID"
                  ? "border-rose-300 text-rose-600 hover:bg-rose-50"
                  : "border-green-300 text-green-600 hover:bg-green-50"
              }`}
            >
              {order.paymentStatus === "PAID" ? "Mark Unpaid" : "Mark Paid"}
            </button>
          </div>
        </div>

        {order.paymentStatus === "PAID" && order.finalPriceKes && (
          <div className="mt-4 border-t border-bloom-sage-light/30 pt-4">
            <p className="font-inter text-xs uppercase tracking-[0.12em] text-bloom-sage">
              This order contributes Ksh {order.finalPriceKes.toLocaleString()} to total revenue
            </p>
          </div>
        )}
      </section>

      {/* Special Requests */}
      {order.specialRequests && (
        <section className="border border-bloom-sage-light/30 bg-bloom-blush/10 p-6">
          <h2 className="font-cormorant mb-4 text-xl font-light text-bloom-charcoal">Special Requests</h2>
          <p className="font-inter text-sm text-bloom-charcoal">{order.specialRequests}</p>
        </section>
      )}

      {/* Staff Notes */}
      <section className="border border-bloom-sage-light/30 p-6">
        <h2 className="font-cormorant mb-4 text-xl font-light text-bloom-charcoal">Staff Notes</h2>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add notes about pricing, materials, customer communication..."
          rows={4}
          className="font-inter w-full resize-none border border-bloom-sage-light/50 bg-bloom-parchment/40 px-4 py-3 text-sm text-bloom-charcoal placeholder:text-bloom-taupe/60 focus:border-bloom-charcoal focus:outline-none"
        />
        <button
          onClick={saveNotes}
          disabled={updating}
          className="font-inter mt-3 bg-bloom-charcoal px-4 py-2 text-xs uppercase tracking-[0.14em] text-bloom-cream transition-colors hover:bg-bloom-sage disabled:opacity-50"
        >
          {updating ? "Saving..." : "Save Notes"}
        </button>
        {order.contactedAt && (
          <p className="font-inter mt-2 text-xs text-bloom-sage">
            Customer first contacted: {formatDate(order.contactedAt)}
          </p>
        )}
      </section>
    </div>
  );
}
