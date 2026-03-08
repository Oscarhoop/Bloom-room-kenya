"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { OrderStatus, PaymentStatus, DeliveryTimeSlot } from "@prisma/client";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Order {
  id: string;
  orderNumber: string;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  totalKes: number;
  subtotalKes: number;
  deliveryFeeKes: number;
  discountKes: number;
  isGift: boolean;
  giftMessage: string | null;
  recipientName: string | null;
  recipientPhone: string | null;
  deliveryDate: string;
  deliveryTimeSlot: DeliveryTimeSlot;
  deliveryAddress: {
    street: string;
    estate: string;
    area: string;
    city: string;
    landmark?: string;
    instructions?: string;
  };
  deliveryNotes: string | null;
  mpesaReceiptNumber: string | null;
  internalNotes: string | null;
  confirmedAt: string | null;
  deliveredAt: string | null;
  createdAt: string;
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
  };
  items: Array<{
    id: string;
    productName: string;
    productSku: string;
    quantity: number;
    unitPriceKes: number;
    subtotalKes: number;
    selectedColor: string | null;
    selectedSize: string | null;
    thumbnailUrl: string | null;
  }>;
}

// ─── Status Workflow ───────────────────────────────────────────────────────────

const STATUS_FLOW: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "ARRANGING",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  ARRANGING: "Arranging",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800 border-amber-200",
  CONFIRMED: "bg-blue-100 text-blue-800 border-blue-200",
  ARRANGING: "bg-purple-100 text-purple-800 border-purple-200",
  OUT_FOR_DELIVERY: "bg-orange-100 text-orange-800 border-orange-200",
  DELIVERED: "bg-green-100 text-green-800 border-green-200",
  CANCELLED: "bg-red-100 text-red-800 border-red-200",
  REFUNDED: "bg-gray-100 text-gray-600 border-gray-200",
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatKes(n: number) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 0,
  }).format(n);
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-KE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [notes, setNotes] = useState("");
  const [orderList, setOrderList] = useState<{id: string; orderNumber: string}[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const router = useRouter();

  useEffect(() => {
    fetchOrder();
    fetchOrderList();
  }, [id]);

  async function fetchOrder() {
    try {
      const res = await fetch(`/api/admin/orders/${id}`);
      const data = await res.json();
      if (data.order) {
        setOrder(data.order);
        setNotes(data.order.internalNotes || "");
      }
    } catch (error) {
      console.error("Failed to fetch order:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchOrderList() {
    try {
      const res = await fetch("/api/admin/orders/list");
      const data = await res.json();
      if (data.orders) {
        setOrderList(data.orders);
        const index = data.orders.findIndex((o: {id: string}) => o.id === id);
        setCurrentIndex(index);
      }
    } catch (error) {
      console.error("Failed to fetch order list:", error);
    }
  }

  function goToNext() {
    if (currentIndex < orderList.length - 1) {
      const nextId = orderList[currentIndex + 1].id;
      router.push(`/admin/orders/${nextId}`);
    }
  }

  function goToPrevious() {
    if (currentIndex > 0) {
      const prevId = orderList[currentIndex - 1].id;
      router.push(`/admin/orders/${prevId}`);
    }
  }

  async function updateStatus(newStatus: OrderStatus) {
    if (!order) return;
    setUpdating(true);

    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderStatus: newStatus }),
      });

      const data = await res.json();
      if (data.success) {
        setOrder({ ...order, orderStatus: newStatus });
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setUpdating(false);
    }
  }

  async function updatePaymentStatus(newStatus: PaymentStatus) {
    if (!order) return;
    setUpdating(true);

    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
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

  async function saveNotes() {
    if (!order) return;
    setUpdating(true);

    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ internalNotes: notes }),
      });

      const data = await res.json();
      if (data.success) {
        setOrder({ ...order, internalNotes: notes });
      }
    } catch (error) {
      console.error("Failed to save notes:", error);
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="font-inter text-bloom-taupe">Loading order...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
        <p className="font-inter text-bloom-taupe">Order not found</p>
        <Link href="/admin/orders" className="font-inter text-sm text-bloom-sage hover:underline">
          ← Back to Orders
        </Link>
      </div>
    );
  }

  const currentStatusIndex = STATUS_FLOW.indexOf(order.orderStatus);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/admin/orders" className="font-inter text-xs text-bloom-sage hover:underline">
            ← Back to Orders
          </Link>
          <h1 className="font-cormorant mt-2 text-4xl font-light text-bloom-charcoal">
            {order.orderNumber}
          </h1>
          <p className="font-inter mt-1 text-sm text-bloom-taupe">
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Previous/Next Navigation */}
          <div className="flex gap-1">
            <button
              onClick={goToPrevious}
              disabled={currentIndex <= 0}
              className="font-inter border border-bloom-sage-light/50 px-3 py-2 text-xs uppercase tracking-[0.12em] text-bloom-charcoal transition-colors hover:bg-bloom-sage-light/20 disabled:opacity-40 disabled:cursor-not-allowed"
              title="Previous order"
            >
              ← Prev
            </button>
            <button
              onClick={goToNext}
              disabled={currentIndex >= orderList.length - 1}
              className="font-inter border border-bloom-sage-light/50 px-3 py-2 text-xs uppercase tracking-[0.12em] text-bloom-charcoal transition-colors hover:bg-bloom-sage-light/20 disabled:opacity-40 disabled:cursor-not-allowed"
              title="Next order"
            >
              Next →
            </button>
          </div>
          <span className={`font-inter px-3 py-1.5 text-xs uppercase tracking-[0.12em] border ${STATUS_COLORS[order.orderStatus]}`}>
            {STATUS_LABELS[order.orderStatus]}
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
          {order.orderStatus !== "DELIVERED" && order.orderStatus !== "CANCELLED" && (
            <>
              {order.orderStatus === "PENDING" && (
                <button
                  onClick={() => updateStatus("CONFIRMED")}
                  disabled={updating}
                  className="font-inter bg-bloom-charcoal px-4 py-2 text-xs uppercase tracking-[0.14em] text-bloom-cream transition-colors hover:bg-bloom-sage disabled:opacity-50"
                >
                  {updating ? "Updating..." : "Confirm Order"}
                </button>
              )}
              {order.orderStatus === "CONFIRMED" && (
                <button
                  onClick={() => updateStatus("ARRANGING")}
                  disabled={updating}
                  className="font-inter bg-bloom-charcoal px-4 py-2 text-xs uppercase tracking-[0.14em] text-bloom-cream transition-colors hover:bg-bloom-sage disabled:opacity-50"
                >
                  {updating ? "Updating..." : "Start Arranging"}
                </button>
              )}
              {order.orderStatus === "ARRANGING" && (
                <button
                  onClick={() => updateStatus("OUT_FOR_DELIVERY")}
                  disabled={updating}
                  className="font-inter bg-bloom-charcoal px-4 py-2 text-xs uppercase tracking-[0.14em] text-bloom-cream transition-colors hover:bg-bloom-sage disabled:opacity-50"
                >
                  {updating ? "Updating..." : "Mark Out for Delivery"}
                </button>
              )}
              {order.orderStatus === "OUT_FOR_DELIVERY" && (
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
            <p className="font-inter text-sm text-bloom-charcoal">
              {order.customer.firstName} {order.customer.lastName}
            </p>
            <p className="font-inter text-sm text-bloom-taupe">{order.customer.email}</p>
            {order.customer.phone && (
              <p className="font-inter text-sm text-bloom-taupe">{order.customer.phone}</p>
            )}
          </div>
        </section>

        {/* Delivery Info */}
        <section className="border border-bloom-sage-light/30 p-6">
          <h2 className="font-cormorant mb-4 text-xl font-light text-bloom-charcoal">Delivery</h2>
          <div className="space-y-2">
            <p className="font-inter text-sm text-bloom-charcoal">
              {order.deliveryAddress.street}
            </p>
            <p className="font-inter text-sm text-bloom-taupe">
              {order.deliveryAddress.estate}, {order.deliveryAddress.area}
            </p>
            <p className="font-inter text-sm text-bloom-taupe">{order.deliveryAddress.city}</p>
            {order.deliveryAddress.landmark && (
              <p className="font-inter text-sm text-bloom-sage">
                Landmark: {order.deliveryAddress.landmark}
              </p>
            )}
            <div className="mt-3 border-t border-bloom-sage-light/30 pt-3">
              <p className="font-inter text-xs uppercase tracking-[0.12em] text-bloom-taupe">
                Delivery Date
              </p>
              <p className="font-inter text-sm text-bloom-charcoal">
                {formatDate(order.deliveryDate)} — {order.deliveryTimeSlot.replace(/_/g, " ")}
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Items */}
      <section className="border border-bloom-sage-light/30 p-6">
        <h2 className="font-cormorant mb-4 text-xl font-light text-bloom-charcoal">Order Items</h2>
        <div className="space-y-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-start gap-4 border-b border-bloom-sage-light/20 pb-4">
              <div className="flex h-16 w-16 items-center justify-center bg-bloom-sage-light/20 text-2xl">
                🌸
              </div>
              <div className="flex-1">
                <p className="font-inter text-sm font-medium text-bloom-charcoal">{item.productName}</p>
                <p className="font-inter text-xs text-bloom-taupe">SKU: {item.productSku}</p>
                {item.selectedColor && (
                  <p className="font-inter text-xs text-bloom-taupe">Color: {item.selectedColor}</p>
                )}
                {item.selectedSize && (
                  <p className="font-inter text-xs text-bloom-taupe">Size: {item.selectedSize}</p>
                )}
              </div>
              <div className="text-right">
                <p className="font-inter text-sm text-bloom-charcoal">
                  {item.quantity} × {formatKes(item.unitPriceKes)}
                </p>
                <p className="font-inter text-sm font-medium text-bloom-charcoal">
                  {formatKes(item.subtotalKes)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="mt-6 space-y-2 border-t border-bloom-sage-light/30 pt-4">
          <div className="flex justify-between font-inter text-sm text-bloom-taupe">
            <span>Subtotal</span>
            <span>{formatKes(order.subtotalKes)}</span>
          </div>
          <div className="flex justify-between font-inter text-sm text-bloom-taupe">
            <span>Delivery Fee</span>
            <span>{formatKes(order.deliveryFeeKes)}</span>
          </div>
          {order.discountKes > 0 && (
            <div className="flex justify-between font-inter text-sm text-bloom-sage">
              <span>Discount</span>
              <span>-{formatKes(order.discountKes)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-bloom-sage-light/30 pt-2">
            <span className="font-inter text-sm font-medium text-bloom-charcoal">Total</span>
            <span className="font-cormorant text-2xl font-light text-bloom-charcoal">
              {formatKes(order.totalKes)}
            </span>
          </div>
        </div>
      </section>

      {/* Gift Info */}
      {order.isGift && (
        <section className="border border-bloom-sage-light/30 bg-bloom-blush/10 p-6">
          <h2 className="font-cormorant mb-4 text-xl font-light text-bloom-charcoal">🎁 Gift Details</h2>
          <div className="space-y-2">
            {order.recipientName && (
              <p className="font-inter text-sm text-bloom-charcoal">
                Recipient: {order.recipientName}
              </p>
            )}
            {order.recipientPhone && (
              <p className="font-inter text-sm text-bloom-taupe">Phone: {order.recipientPhone}</p>
            )}
            {order.giftMessage && (
              <div className="mt-3 border-l-2 border-bloom-sage pl-4">
                <p className="font-inter text-xs uppercase tracking-[0.12em] text-bloom-taupe mb-1">Message</p>
                <p className="font-inter text-sm text-bloom-charcoal italic">"{order.giftMessage}"</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Internal Notes */}
      <section className="border border-bloom-sage-light/30 p-6">
        <h2 className="font-cormorant mb-4 text-xl font-light text-bloom-charcoal">Staff Notes</h2>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add internal notes about this order..."
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
      </section>

      {/* M-Pesa Receipt */}
      {order.mpesaReceiptNumber && (
        <section className="border border-green-200 bg-green-50 p-6">
          <h2 className="font-cormorant mb-2 text-xl font-light text-green-800">M-Pesa Payment</h2>
          <p className="font-inter text-sm text-green-700">
            Receipt Number: {order.mpesaReceiptNumber}
          </p>
        </section>
      )}
    </div>
  );
}
