"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store/useCartStore";
import Logo from "./Logo";

// ─── Nav Links ────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: "Shop", href: "/shop" },
  { label: "Custom Orders", href: "/custom-orders" },
] as const;

// ─── Icons ────────────────────────────────────────────────────────────────────

function CartIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.3}
      stroke="currentColor"
      className={className ?? "h-5 w-5"}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z"
      />
    </svg>
  );
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.3}
      stroke="currentColor"
      className={className ?? "h-5 w-5"}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.3}
      stroke="currentColor"
      className={className ?? "h-5 w-5"}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const totalItems = useCartStore((s) => s.totalItems());
  const openCart = useCartStore((s) => s.openCart);

  // Only show cart state after hydration to avoid SSR/CSR mismatch
  useEffect(() => setHasMounted(true), []);

  // Scroll detection
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // initialize on mount
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => setMobileOpen(false), [pathname]);

  // Whether we're on the homepage — navbar starts transparent
  const isHome = pathname === "/";
  const isTransparent = isHome && !scrolled && !mobileOpen;

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          isTransparent
            ? "bg-transparent"
            : "bg-bloom-cream/95 shadow-[0_1px_0_0_rgba(0,0,0,0.06)] backdrop-blur-md"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 sm:px-12 lg:px-24">
          {/* Logo */}
          <Logo 
            size="md" 
            className="transition-colors duration-500"
          />

          {/* Desktop Nav Links */}
          <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
            {NAV_LINKS.map(({ label, href }) => {
              const active = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`group relative font-inter text-xs uppercase tracking-[0.18em] transition-colors duration-300 ${
                    isTransparent
                      ? active
                        ? "text-bloom-cream"
                        : "text-bloom-cream/70 hover:text-bloom-cream"
                      : active
                      ? "text-bloom-charcoal"
                      : "text-bloom-taupe hover:text-bloom-charcoal"
                  }`}
                >
                  {label}
                  {/* Active underline */}
                  <span
                    className={`absolute -bottom-0.5 left-0 h-px transition-all duration-300 ${
                      active ? "w-full bg-current" : "w-0 bg-bloom-sage group-hover:w-full"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Right: Cart + Mobile Menu Toggle */}
          <div className="flex items-center gap-4">
            {/* Cart Button — opens CartDrawer */}
            <button
              id="nav-cart-btn"
              onClick={openCart}
              aria-label={`Open cart${hasMounted && totalItems > 0 ? ` — ${totalItems} ${totalItems === 1 ? "item" : "items"}` : ""}`}
              className={`relative transition-colors duration-300 ${
                isTransparent
                  ? "text-bloom-cream/80 hover:text-bloom-cream"
                  : "text-bloom-charcoal/60 hover:text-bloom-charcoal"
              }`}
            >
              <CartIcon />
              <AnimatePresence>
                {hasMounted && totalItems > 0 && (
                  <motion.span
                    key="badge"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 25 }}
                    className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-bloom-sage font-inter text-[10px] font-medium text-bloom-cream"
                  >
                    {totalItems > 9 ? "9+" : totalItems}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              id="nav-mobile-toggle"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              className={`md:hidden transition-colors duration-300 ${
                isTransparent
                  ? "text-bloom-cream/80 hover:text-bloom-cream"
                  : "text-bloom-charcoal/60 hover:text-bloom-charcoal"
              }`}
            >
              {mobileOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.nav
              key="mobile-menu"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="overflow-hidden border-t border-bloom-sage-light/30 bg-bloom-cream/98 backdrop-blur-md md:hidden"
              aria-label="Mobile navigation"
            >
              <ul className="flex flex-col divide-y divide-bloom-sage-light/20 px-6 py-2">
                {NAV_LINKS.map(({ label, href }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className={`block py-4 font-inter text-xs uppercase tracking-[0.2em] transition-colors duration-200 ${
                        pathname.startsWith(href)
                          ? "text-bloom-charcoal"
                          : "text-bloom-taupe hover:text-bloom-charcoal"
                      }`}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
                <li>
                  <button
                    onClick={() => { setMobileOpen(false); openCart(); }}
                    className="flex w-full py-4 font-inter text-xs uppercase tracking-[0.2em] text-bloom-taupe transition-colors hover:text-bloom-charcoal"
                  >
                    Cart {hasMounted && totalItems > 0 && `(${totalItems})`}
                  </button>
                </li>
              </ul>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      {/* Spacer for non-transparent navbars (non-home pages) */}
      {!isHome && <div className="h-16" aria-hidden="true" />}
    </>
  );
}
