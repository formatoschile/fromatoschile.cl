import { ReactNode, Suspense } from "react";
import { Afacad } from "next/font/google";

import { CartProvider } from "@/components/cart/CartContext";
import { Footer } from "@/components/layout/Footer/Footer";
import { Navbar } from "@/components/layout/Navbar/Navbar";
import { getCart } from "@/lib/shopify";
import { baseUrl } from "@/lib/utils";
import { env } from "@/lib/utils/env";

import "./globals.css";

const afacad = Afacad({
  subsets: ["latin"],
  variable: "--font-afacad",
  weight: ["400", "500", "600", "700"],
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
    <html lang="es" className={afacad.variable}>
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
