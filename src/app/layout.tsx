import { ReactNode, Suspense } from "react";
import { Jost } from "next/font/google";
import { Toaster } from "sonner";

import { CartProvider } from "@/components/cart/CartContext";
import { Footer } from "@/components/layout/Footer/Footer";
import { Navbar } from "@/components/layout/Navbar/Navbar";
import { getCart } from "@/lib/shopify";
import { baseUrl } from "@/lib/utils";

import "./globals.css";

const jost = Jost({
  subsets: ["latin"],
  variable: "--font-jost",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const { SITE_NAME } = process.env;

export const metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: SITE_NAME!,
    template: `%s | ${SITE_NAME}`,
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
    <html lang="it" className={`${jost.variable} dark`}>
      <body className="font-main">
        <CartProvider cartPromise={cart}>
          <Suspense>
            <Navbar />
          </Suspense>

          <main>
            <Suspense>{children}</Suspense>
            <Toaster closeButton />
          </main>

          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
