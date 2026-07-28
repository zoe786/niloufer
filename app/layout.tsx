import type { Metadata, Viewport } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";

export const metadata: Metadata = {
  title: "Cafe Niloufer – Banjara Hills | Order Here",
  description:
    "Smart kiosk ordering for Cafe Niloufer, Banjara Hills. The Home of Chai that is Truly Hyderabadi – serving Hyderabad since 1978.",
  keywords: ["Cafe Niloufer", "Irani Chai", "Hyderabad", "Banjara Hills", "kiosk ordering"],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  // Kiosk orientation – portrait primary, landscape secondary for smart tables
  themeColor: "#7C1D33",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/*
          Kiosk guidance: add the line below to lock portrait on a
          dedicated kiosk device. Smart-table deployments may omit this.
          <meta name="screen-orientation" content="portrait" />
        */}
      </head>
      <body className="antialiased bg-niloufer-cream text-niloufer-charcoal min-h-screen">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}

