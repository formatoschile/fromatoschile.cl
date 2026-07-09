import { ReactNode, Suspense } from "react";
import { Barlow_Semi_Condensed, DM_Sans, Jost } from "next/font/google";

import { CartProvider } from "@/components/cart/CartContext";
import { Footer } from "@/components/layout/Footer/Footer";
import { Navbar } from "@/components/layout/Navbar/Navbar";
import { getCart } from "@/lib/shopify";
import { baseUrl } from "@/lib/utils";
import { env } from "@/lib/utils/env";

import "./globals.css";

const jost = Jost({
  subsets: ["latin"],
  variable: "--font-jost",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

// Web fallback for "Avenir Next Condensed" (a macOS-only system font).
const barlowCondensed = Barlow_Semi_Condensed({
  subsets: ["latin"],
  variable: "--font-barlow-condensed",
  weight: ["300", "400", "500", "600", "700"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

export const metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: env.SITE_NAME,
    template: `%s | ${env.SITE_NAME}`,
  },
  robots: {
    follow: true,
    index: true,
  },
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Don't await the fetch, pass the Promise to the context provider
  const cart = getCart();

  return (
    <html
      lang="es"
      className={`${jost.variable} ${barlowCondensed.variable} ${dmSans.variable}`}
    >
      <body className="font-main">
        <CartProvider cartPromise={cart}>
          <Suspense>
            <Navbar />
          </Suspense>

          <main>
            <Suspense>{children}</Suspense>
          </main>

          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
