"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store/useCartStore";
import Logo from "./Logo";

const NAV_LINKS = [
  { label: "Shop", href: "/shop" },
  { label: "Custom Orders", href: "/custom-orders" },
] as const;

function CartIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.3} stroke="currentColor" className={className ?? "h-5 w-5"}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z" />
    </svg>
  );
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.3} stroke="currentColor" className={className ?? "h-5 w-5"}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.3} stroke="currentColor" className={className ?? "h-5 w-5"}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const totalItems = useCartStore((s) => s.totalItems());
  const openCart = useCartStore((s) => s.openCart);

  useEffect(() => setHasMounted(true), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMobileOpen(false), [pathname]);

  const isHome = pathname === "/";
  const isTransparent = isHome && !scrolled && !mobileOpen;

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          isTransparent
            ? "bg-transparent"
            : "bg-[#faf9f6]/95 shadow-sm backdrop-blur-md border-b border-black/5"
        }`}
      >
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 sm:px-12 lg:px-24">
          {/* Logo - The mix-blend-multiply is inside the Logo component */}
          <Logo size="md" />

          {/* Desktop Nav Links */}
          <nav className="hidden items-center gap-10 md:flex">
            {NAV_LINKS.map(({ label, href }) => {
              const active = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`group relative text-[10px] uppercase tracking-[0.25em] transition-colors duration-300 ${
                    isTransparent
                      ? "text-white/90 hover:text-white"
                      : "text-neutral-500 hover:text-black"
                  }`}
                >
                  {label}
                  <span className={`absolute -bottom-1 left-0 h-[1px] transition-all duration-300 ${
                    active ? "w-full bg-current" : "w-0 bg-neutral-400 group-hover:w-full"
                  }`} />
                </Link>
              );
            })}
          </nav>

          {/* Right Icons */}
          <div className="flex items-center gap-6">
            <button
              onClick={openCart}
              className={`relative p-2 transition-colors duration-300 ${
                isTransparent ? "text-white/80 hover:text-white" : "text-neutral-600 hover:text-black"
              }`}
            >
              <CartIcon />
              <AnimatePresence>
                {hasMounted && totalItems > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-[#4a5d4e] text-[9px] font-medium text-white"
                  >
                    {totalItems}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            <button
              onClick={() => setMobileOpen((o) => !o)}
              className={`md:hidden p-2 transition-colors duration-300 ${
                isTransparent ? "text-white/80 hover:text-white" : "text-neutral-600 hover:text-black"
              }`}
            >
              {mobileOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </header>
      {!isHome && <div className="h-20" />}
    </>
  );
}