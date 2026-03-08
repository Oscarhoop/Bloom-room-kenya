"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ADMIN_LINKS = [
  { label: "Dashboard", href: "/admin", icon: "📊" },
  { label: "Orders", href: "/admin/orders", icon: "📦" },
  { label: "Custom Orders", href: "/admin/custom-orders", icon: "🎁" },
  { label: "Products", href: "/admin/products", icon: "🌸" },
  { label: "Customers", href: "/admin/customers", icon: "👥" },
] as const;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-bloom-cream">
      {/* Admin Header */}
      <header className="border-b border-bloom-sage-light/30 bg-bloom-parchment px-6 py-4 sm:px-12">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="font-cormorant text-xl font-light tracking-[0.1em] text-bloom-charcoal">
              🌸 Admin
            </Link>
          </div>
          <Link 
            href="/" 
            className="font-inter text-xs uppercase tracking-[0.14em] text-bloom-taupe transition-colors hover:text-bloom-charcoal"
          >
            ← Back to Site
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8 sm:px-12 lg:px-24">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
          {/* Sidebar Navigation */}
          <nav className="space-y-1">
            {ADMIN_LINKS.map(({ label, href, icon }) => {
              const active = pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 rounded-none px-4 py-3 font-inter text-sm transition-all ${
                    active
                      ? "bg-bloom-charcoal text-bloom-cream"
                      : "text-bloom-charcoal hover:bg-bloom-parchment"
                  }`}
                >
                  <span>{icon}</span>
                  <span className="uppercase tracking-[0.12em]">{label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Main Content */}
          <main>{children}</main>
        </div>
      </div>
    </div>
  );
}
