import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

// ─── Data Fetching ────────────────────────────────────────────────────────────

async function getCustomOrders() {
  return prisma.customOrder.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      orderNumber: true,
      theme: true,
      name: true,
      phone: true,
      email: true,
      occasion: true,
      budget: true,
      deliveryDate: true,
      recipientLocation: true,
      specialRequests: true,
      status: true,
      adminNotes: true,
      contactedAt: true,
      createdAt: true,
    },
  });
}

// ─── Components ───────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    PENDING: "bg-bloom-blush text-bloom-charcoal",
    CONTACTED: "bg-blue-100 text-blue-700",
    CONFIRMED: "bg-bloom-sage/20 text-bloom-sage-dark",
    IN_PROGRESS: "bg-bloom-gold/20 text-bloom-gold-dark",
    READY: "bg-purple-100 text-purple-700",
    DELIVERED: "bg-green-100 text-green-700",
    CANCELLED: "bg-rose-100 text-rose-700",
  };

  return (
    <span className={`font-inter px-2 py-1 text-[10px] uppercase tracking-[0.12em] ${colors[status] || "bg-bloom-parchment text-bloom-taupe"}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function AdminCustomOrdersPage() {
  const orders = await getCustomOrders();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-cormorant text-4xl font-light text-bloom-charcoal">Custom Orders</h1>
          <p className="font-inter mt-1 text-sm text-bloom-taupe">Manage special requests and themed arrangements</p>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total", value: orders.length },
          { label: "Pending", value: orders.filter((o) => o.status === "PENDING").length, color: "text-bloom-blush-dark" },
          { label: "In Progress", value: orders.filter((o) => ["CONTACTED", "CONFIRMED", "IN_PROGRESS"].includes(o.status)).length, color: "text-bloom-sage" },
          { label: "Delivered", value: orders.filter((o) => o.status === "DELIVERED").length, color: "text-green-600" },
        ].map(({ label, value, color }) => (
          <div key={label} className="border border-bloom-sage-light/30 bg-bloom-parchment/40 p-4">
            <p className="font-inter text-[10px] uppercase tracking-[0.18em] text-bloom-taupe">{label}</p>
            <p className={`font-cormorant mt-1 text-3xl font-light ${color || "text-bloom-charcoal"}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Custom Orders Table */}
      <div className="overflow-x-auto border border-bloom-sage-light/30">
        <table className="w-full">
          <thead>
            <tr className="border-b border-bloom-sage-light/30 bg-bloom-parchment/40">
              <th className="font-inter py-4 px-4 text-left text-[10px] uppercase tracking-[0.14em] text-bloom-taupe">Order</th>
              <th className="font-inter py-4 px-4 text-left text-[10px] uppercase tracking-[0.14em] text-bloom-taupe">Theme</th>
              <th className="font-inter py-4 px-4 text-left text-[10px] uppercase tracking-[0.14em] text-bloom-taupe">Customer</th>
              <th className="font-inter py-4 px-4 text-left text-[10px] uppercase tracking-[0.14em] text-bloom-taupe">Occasion</th>
              <th className="font-inter py-4 px-4 text-left text-[10px] uppercase tracking-[0.14em] text-bloom-taupe">Budget</th>
              <th className="font-inter py-4 px-4 text-left text-[10px] uppercase tracking-[0.14em] text-bloom-taupe">Delivery</th>
              <th className="font-inter py-4 px-4 text-left text-[10px] uppercase tracking-[0.14em] text-bloom-taupe">Status</th>
              <th className="font-inter py-4 px-4 text-right text-[10px] uppercase tracking-[0.14em] text-bloom-taupe">Received</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center">
                  <p className="font-inter text-sm text-bloom-taupe">No custom orders yet.</p>
                  <p className="font-inter mt-1 text-xs text-bloom-sage">
                    Custom orders will appear here when customers submit requests.
                  </p>
                </td>
              </tr>
            ) : (
              orders.map((order: {
                id: string;
                orderNumber: string;
                theme: string;
                name: string;
                phone: string;
                email: string;
                occasion: string;
                budget: string;
                deliveryDate: Date;
                recipientLocation: string;
                specialRequests: string | null;
                status: string;
                createdAt: Date;
              }) => (
                <tr key={order.id} className="border-b border-bloom-sage-light/20 hover:bg-bloom-parchment/20">
                  <td className="py-4 px-4">
                    <Link href={`/admin/custom-orders/${order.id}`} className="font-inter text-sm font-medium text-bloom-charcoal hover:underline">
                      {order.orderNumber}
                    </Link>
                    <div className="mt-1">
                      <Link href={`/admin/custom-orders/${order.id}`} className="font-inter text-[10px] text-bloom-sage hover:underline">
                        Manage →
                      </Link>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <p className="font-inter text-sm text-bloom-charcoal">{order.theme}</p>
                  </td>
                  <td className="py-4 px-4">
                    <p className="font-inter text-sm text-bloom-charcoal">{order.name}</p>
                    <p className="font-inter text-xs text-bloom-taupe">{order.phone}</p>
                    <p className="font-inter text-xs text-bloom-taupe">{order.email}</p>
                  </td>
                  <td className="py-4 px-4">
                    <p className="font-inter text-sm text-bloom-taupe">{order.occasion}</p>
                  </td>
                  <td className="py-4 px-4">
                    <p className="font-inter text-sm text-bloom-charcoal">{order.budget}</p>
                  </td>
                  <td className="py-4 px-4">
                    <p className="font-inter text-sm text-bloom-charcoal">
                      {new Date(order.deliveryDate).toLocaleDateString()}
                    </p>
                    <p className="font-inter text-xs text-bloom-taupe">{order.recipientLocation}</p>
                  </td>
                  <td className="py-4 px-4">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="py-4 px-4 text-right">
                    <p className="font-inter text-xs text-bloom-taupe">
                      {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                    </p>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Special Requests Note */}
      {orders.some((o) => o.specialRequests) && (
        <div className="border border-bloom-sage-light/30 bg-bloom-parchment/20 p-4">
          <p className="font-inter text-[10px] uppercase tracking-[0.14em] text-bloom-taupe mb-2">Special Requests to Review</p>
          <div className="space-y-2">
            {orders
              .filter((o) => o.specialRequests)
              .slice(0, 3)
              .map((order) => (
                <div key={order.id} className="flex gap-4 text-sm">
                  <span className="font-medium text-bloom-charcoal">{order.orderNumber}:</span>
                  <span className="text-bloom-taupe">{order.specialRequests}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
