"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { OrderStatus, PaymentStatus } from "@prisma/client";
import Logo from "@/components/Logo";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Order {
  id: string;
  orderNumber: string;
  totalKes: number;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  mpesaReceiptNumber?: string;
  deliveryDate: string;
  deliveryTimeSlot: string;
  createdAt: string;
  customer: {
    firstName: string;
    lastName: string;
    phone: string;
  };
  items: {
    productName: string;
    quantity: number;
  }[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatKes(n: number) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 0,
  }).format(n);
}

function formatDate(d: string) {
  const date = new Date(d);
  if (isNaN(date.getTime())) {
    return "Invalid Date";
  }
  return new Intl.DateTimeFormat("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  ARRANGING: "bg-purple-100 text-purple-800",
  OUT_FOR_DELIVERY: "bg-orange-100 text-orange-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  REFUNDED: "bg-gray-100 text-gray-600",
};

const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  UNPAID: "text-red-600",
  PAID: "text-green-600",
  PARTIALLY_REFUNDED: "text-orange-600",
  FULLY_REFUNDED: "text-gray-500",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<OrderStatus | "ALL">("ALL");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/admin/orders");
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = filter === "ALL" 
    ? orders 
    : orders.filter(order => order.orderStatus === filter);

  const totalRevenue = orders
    .filter((o) => o.paymentStatus === "PAID")
    .reduce((sum, o) => sum + o.totalKes, 0);

  const pendingCount = orders.filter((o) => o.orderStatus === "PENDING").length;
  const deliveredCount = orders.filter((o) => o.orderStatus === "DELIVERED").length;

  const stats = [
    { 
      label: "Total Orders", 
      value: orders.length.toString(), 
      color: "text-gray-800", 
      filter: "ALL" as const 
    },
    { 
      label: "Pending", 
      value: pendingCount.toString(), 
      color: "text-amber-600", 
      filter: "PENDING" as const 
    },
    { 
      label: "Revenue (Paid)", 
      value: formatKes(totalRevenue), 
      color: "text-green-600", 
      filter: null 
    },
  ];

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="font-inter text-sm text-gray-400">Loading orders...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Admin Navbar */}
      <nav className="border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Logo size="sm" />
          <Link href="/" className="font-inter text-xs text-gray-500 hover:text-gray-800">
            ← View Site
          </Link>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Stats */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {stats.map(({ label, value, color, filter: statFilter }) => (
            <button
              key={label}
              onClick={() => statFilter && setFilter(statFilter)}
              disabled={!statFilter}
              className={`text-left rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-colors ${
                statFilter ? 'hover:bg-gray-50 cursor-pointer' : 'pointer-events-none'
              }`}
            >
              <p className="font-inter mb-1 text-[10px] uppercase tracking-[0.16em] text-gray-400">{label}</p>
              <p className={`font-cormorant text-3xl font-light ${color}`}>{value}</p>
            </button>
          ))}
        </div>

        {/* Filter Buttons */}
        <div className="mb-6 flex flex-wrap gap-2">
          {["ALL", "PENDING", "CONFIRMED", "ARRANGING", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status as OrderStatus | "ALL")}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-colors ${
                filter === status
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {status.replace(/_/g, " ")}
            </button>
          ))}
        </div>

        {/* Orders Table */}
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 className="font-inter text-sm font-medium text-gray-700">
              {filter === "ALL" ? 'All Orders' : `${filter.replace(/_/g, ' ')} Orders`} ({filteredOrders.length})
            </h2>
            {filter !== "ALL" && (
              <button 
                onClick={() => setFilter("ALL")}
                className="font-inter text-xs text-blue-600 hover:underline"
              >
                Clear filter ✕
              </button>
            )}
          </div>

          {filteredOrders.length === 0 ? (
            <div className="py-16 text-center">
              <p className="font-inter text-sm text-gray-400">
                {filter === "ALL" ? "No orders yet." : `No ${filter.replace(/_/g, ' ').toLowerCase()} orders.`}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    {["Order", "Customer", "Items", "Delivery", "Total", "Payment", "Status", "Placed"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left font-inter text-[10px] uppercase tracking-[0.14em] text-gray-400">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="transition-colors hover:bg-gray-50/70">
                      {/* Order number */}
                      <td className="whitespace-nowrap px-4 py-3">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="font-inter text-xs font-medium text-blue-600 hover:underline"
                        >
                          {order.orderNumber}
                        </Link>
                        <div className="mt-1 flex gap-1">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="font-inter text-[10px] text-blue-500 hover:underline"
                          >
                            Manage →
                          </Link>
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="px-4 py-3">
                        <p className="font-inter text-xs text-gray-800">
                          {order.customer.firstName} {order.customer.lastName}
                        </p>
                        <p className="font-inter text-[11px] text-gray-400">{order.customer.phone}</p>
                      </td>

                      {/* Items */}
                      <td className="px-4 py-3">
                        <ul className="font-inter text-[11px] text-gray-600">
                          {order.items.slice(0, 2).map((item, i) => (
                            <li key={i}>{item.productName} × {item.quantity}</li>
                          ))}
                          {order.items.length > 2 && (
                            <li className="text-gray-400">+{order.items.length - 2} more</li>
                          )}
                        </ul>
                      </td>

                      {/* Delivery date */}
                      <td className="whitespace-nowrap px-4 py-3">
                        <p className="font-inter text-xs text-gray-700">{formatDate(order.deliveryDate)}</p>
                        <p className="font-inter text-[11px] text-gray-400">{order.deliveryTimeSlot.replace(/_/g, " ")}</p>
                      </td>

                      {/* Total */}
                      <td className="whitespace-nowrap px-4 py-3">
                        <span className="font-inter text-xs font-medium text-gray-800">
                          {formatKes(order.totalKes)}
                        </span>
                      </td>

                      {/* Payment status */}
                      <td className="whitespace-nowrap px-4 py-3">
                        <span className={`font-inter text-xs font-medium ${PAYMENT_STATUS_COLORS[order.paymentStatus]}`}>
                          {order.paymentStatus}
                          {order.mpesaReceiptNumber && (
                            <span className="block text-[10px] font-normal text-gray-400">
                              {order.mpesaReceiptNumber}
                            </span>
                          )}
                        </span>
                      </td>

                      {/* Order status */}
                      <td className="whitespace-nowrap px-4 py-3">
                        <span className={`font-inter inline-block rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${ORDER_STATUS_COLORS[order.orderStatus]}`}>
                          {order.orderStatus.replace(/_/g, " ")}
                        </span>
                      </td>

                      {/* Placed at */}
                      <td className="whitespace-nowrap px-4 py-3">
                        <span className="font-inter text-[11px] text-gray-400">
                          {formatDate(order.createdAt)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Delivered count note */}
        {deliveredCount > 0 && (
          <p className="font-inter mt-4 text-right text-xs text-gray-400">
            {deliveredCount} order{deliveredCount !== 1 ? "s" : ""} delivered this period.
          </p>
        )}
      </div>
    </main>
  );
}
