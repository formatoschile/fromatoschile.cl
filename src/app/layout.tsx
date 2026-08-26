import { ReactNode, Suspense } from "react";
import { Afacad } from "next/font/google";

import { RouteFocus } from "@/components/a11y/RouteFocus";
import { Analytics } from "@/components/Analytics/Analytics";
import { CartProvider } from "@/components/cart/CartContext";
import { JsonLd } from "@/components/JsonLd/JsonLd";
import { Footer } from "@/components/layout/Footer/Footer";
import { Navbar } from "@/components/layout/Navbar/Navbar";
import { env } from "@/env";
import { buildOrganizationJsonLd, buildWebSiteJsonLd } from "@/lib/seo/jsonLd";
import { getCart } from "@/lib/shopify";
import { baseUrl } from "@/lib/utils";

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
  twitter: {
    card: "summary_large_image",
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
    <html lang="es-CL" className={afacad.variable}>
      <body className="font-main">
        <a
          href="#main-content"
          className="focus:text-ink sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:underline"
        >
          Saltar al contenido principal
        </a>

        <Suspense fallback={null}>
          <RouteFocus />
        </Suspense>
        <JsonLd data={buildOrganizationJsonLd()} />
        <JsonLd data={buildWebSiteJsonLd()} />

        <CartProvider cartPromise={cart}>
          <Suspense>
            <Navbar />
          </Suspense>

          <main id="main-content" tabIndex={-1}>
            <Suspense>{children}</Suspense>
          </main>

          <Footer />

          <Analytics />
        </CartProvider>
      </body>
    </html>
  );
}
