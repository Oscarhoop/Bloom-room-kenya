"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import type { OrderStatus, PaymentStatus } from "@prisma/client";

interface DashboardStats {
  totalOrders: number;
  todayOrders: number;
  pendingOrders: number;
  customOrdersPending: number;
  totalRevenue: number;
}

interface Order {
  id: string;
  orderNumber: string;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  totalKes: number;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
}

interface CustomOrder {
  id: string;
  orderNumber: string;
  theme: string;
  name: string;
  status: string;
  budget: string;
  createdAt: string;
}

// ─── Components ───────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-800",
    CONFIRMED: "bg-blue-100 text-blue-800",
    ARRANGING: "bg-purple-100 text-purple-800",
    OUT_FOR_DELIVERY: "bg-orange-100 text-orange-800",
    DELIVERED: "bg-green-100 text-green-800",
    CANCELLED: "bg-rose-100 text-rose-800",
    PAID: "bg-green-100 text-green-700",
    UNPAID: "bg-amber-100 text-amber-700",
    CONTACTED: "bg-blue-100 text-blue-800",
    IN_PROGRESS: "bg-purple-100 text-purple-800",
    READY: "bg-orange-100 text-orange-800",
  };

  return (
    <span className={`font-inter px-2 py-1 text-[10px] uppercase tracking-[0.12em] ${colors[status] || "bg-gray-100 text-gray-600"}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  href,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  href?: string;
}) {
  const content = (
    <div className="border border-bloom-sage-light/30 bg-bloom-parchment/40 p-6 transition-all hover:border-bloom-charcoal/30">
      <p className="font-inter text-[10px] uppercase tracking-[0.2em] text-bloom-taupe">{title}</p>
      <p className="font-cormorant mt-2 text-4xl font-light text-bloom-charcoal">{value}</p>
      {subtitle && <p className="font-inter mt-1 text-xs text-bloom-sage">{subtitle}</p>}
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}

// ─── Dashboard Client Component ─────────────────────────────────────────────────

export default function DashboardClient() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [recentCustomOrders, setRecentCustomOrders] = useState<CustomOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  async function fetchDashboardData() {
    try {
      const res = await fetch("/api/admin/dashboard");
      const data = await res.json();
      
      if (data.stats) setStats(data.stats);
      if (data.recentOrders) setRecentOrders(data.recentOrders);
      if (data.recentCustomOrders) setRecentCustomOrders(data.recentCustomOrders);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDashboardData();
    
    // Poll every 5 seconds for real-time updates
    const interval = setInterval(fetchDashboardData, 5000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="font-inter text-bloom-taupe">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Last Updated Indicator */}
      <div className="flex items-center justify-between">
        <p className="font-inter text-xs text-bloom-taupe">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </p>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
          <p className="font-inter text-xs text-bloom-sage">Live updates</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          subtitle="All time"
          href="/admin/orders"
        />
        <StatCard
          title="Today's Orders"
          value={stats.todayOrders}
          subtitle="Since midnight"
        />
        <StatCard
          title="Pending"
          value={stats.pendingOrders}
          subtitle="Action needed"
          href="/admin/orders?status=PENDING"
        />
        <StatCard
          title="Custom Requests"
          value={stats.customOrdersPending}
          subtitle="Awaiting contact"
          href="/admin/custom-orders"
        />
        <StatCard
          title="Total Revenue"
          value={`Ksh ${stats.totalRevenue.toLocaleString()}`}
          subtitle="All paid orders combined"
        />
      </div>

      {/* Recent Orders */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-cormorant text-2xl font-light text-bloom-charcoal">Recent Orders</h2>
          <Link href="/admin/orders" className="font-inter text-xs uppercase tracking-[0.14em] text-bloom-sage hover:underline">
            View All →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-bloom-sage-light/30">
                <th className="font-inter py-3 text-left text-[10px] uppercase tracking-[0.14em] text-bloom-taupe">Order</th>
                <th className="font-inter py-3 text-left text-[10px] uppercase tracking-[0.14em] text-bloom-taupe">Customer</th>
                <th className="font-inter py-3 text-left text-[10px] uppercase tracking-[0.14em] text-bloom-taupe">Status</th>
                <th className="font-inter py-3 text-left text-[10px] uppercase tracking-[0.14em] text-bloom-taupe">Payment</th>
                <th className="font-inter py-3 text-right text-[10px] uppercase tracking-[0.14em] text-bloom-taupe">Total</th>
                <th className="font-inter py-3 text-right text-[10px] uppercase tracking-[0.14em] text-bloom-taupe">Time</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id} className="border-b border-bloom-sage-light/20">
                  <td className="py-3">
                    <Link href={`/admin/orders/${order.id}`} className="font-inter text-sm font-medium text-bloom-charcoal hover:underline">
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="py-3">
                    <p className="font-inter text-sm text-bloom-charcoal">
                      {order.customer.firstName} {order.customer.lastName}
                    </p>
                    <p className="font-inter text-xs text-bloom-taupe">{order.customer.email}</p>
                  </td>
                  <td className="py-3">
                    <StatusBadge status={order.orderStatus} />
                  </td>
                  <td className="py-3">
                    <StatusBadge status={order.paymentStatus} />
                  </td>
                  <td className="py-3 text-right">
                    <p className="font-inter text-sm text-bloom-charcoal">Ksh {order.totalKes.toLocaleString()}</p>
                  </td>
                  <td className="py-3 text-right">
                    <p className="font-inter text-xs text-bloom-taupe">
                      {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Recent Custom Orders */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-cormorant text-2xl font-light text-bloom-charcoal">Recent Custom Orders</h2>
          <Link href="/admin/custom-orders" className="font-inter text-xs uppercase tracking-[0.14em] text-bloom-sage hover:underline">
            View All →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-bloom-sage-light/30">
                <th className="font-inter py-3 text-left text-[10px] uppercase tracking-[0.14em] text-bloom-taupe">Order</th>
                <th className="font-inter py-3 text-left text-[10px] uppercase tracking-[0.14em] text-bloom-taupe">Theme</th>
                <th className="font-inter py-3 text-left text-[10px] uppercase tracking-[0.14em] text-bloom-taupe">Customer</th>
                <th className="font-inter py-3 text-left text-[10px] uppercase tracking-[0.14em] text-bloom-taupe">Budget</th>
                <th className="font-inter py-3 text-left text-[10px] uppercase tracking-[0.14em] text-bloom-taupe">Status</th>
                <th className="font-inter py-3 text-right text-[10px] uppercase tracking-[0.14em] text-bloom-taupe">Time</th>
              </tr>
            </thead>
            <tbody>
              {recentCustomOrders.map((order) => (
                <tr key={order.id} className="border-b border-bloom-sage-light/20">
                  <td className="py-3">
                    <Link href={`/admin/custom-orders/${order.id}`} className="font-inter text-sm font-medium text-bloom-charcoal hover:underline">
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="py-3">
                    <p className="font-inter text-sm text-bloom-charcoal">{order.theme}</p>
                  </td>
                  <td className="py-3">
                    <p className="font-inter text-sm text-bloom-charcoal">{order.name}</p>
                  </td>
                  <td className="py-3">
                    <p className="font-inter text-sm text-bloom-taupe">{order.budget}</p>
                  </td>
                  <td className="py-3">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="py-3 text-right">
                    <p className="font-inter text-xs text-bloom-taupe">
                      {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
