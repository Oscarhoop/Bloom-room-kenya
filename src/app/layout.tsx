import { Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  variable: "--font-cormorant",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bloom Room Kenya — Flower & Gift Shop in Nairobi",
  description:
    "Nairobi's premier flower and gift shop. Exquisite hand-arranged bouquets, themed collections, and same-day delivery across Nairobi. Perfect for birthdays, baby showers, and special moments.",
  keywords: [
    "flower shop Nairobi",
    "gift shop Kenya",
    "flower delivery Nairobi",
    "premium bouquets Kenya",
    "Bloom Room Kenya",
    "themed flower arrangements",
    "money bouquets",
    "baby shower flowers",
  ],
  openGraph: {
    title: "Bloom Room Kenya — Flower & Gift Shop in Nairobi",
    description:
      "Nairobi's premier flower and gift shop. Exquisite hand-arranged bouquets for life's most meaningful moments.",
    type: "website",
    locale: "en_KE",
    siteName: "Bloom Room Kenya",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${cormorant.variable}`}>
      <body className="antialiased">
        <Navbar />
        <CartDrawer />
        {children}
      </body>
    </html>
  );
}

