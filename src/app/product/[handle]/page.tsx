import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PdfViewer } from "@/components/product/PdfViewer/PdfViewer";
import { ProductProvider } from "@/components/product/ProductContext";
import { ProductDescription } from "@/components/product/ProductDescription";
import { getProduct } from "@/lib/shopify";
import { HIDDEN_PRODUCT_TAG } from "@/lib/utils/constants";

import { Breadcrumb } from "./_components/Breadcrumb";
import { RelatedProducts } from "./_components/RelatedProducts";

export async function generateMetadata(props: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const product = await getProduct(params.handle);

  if (!product) return notFound();

  const { url, width, height, altText: alt } = product.featuredImage || {};
  const indexable = !product.tags.includes(HIDDEN_PRODUCT_TAG);

  return {
    title: product.seo.title || product.title,
    description: product.seo.description || product.description,
    robots: {
      index: indexable,
      follow: indexable,
      googleBot: {
        index: indexable,
        follow: indexable,
      },
    },
    openGraph: url
      ? {
          images: [
            {
              url,
              width,
              height,
              alt,
            },
          ],
        }
      : null,
  };
}

export default async function ProductPage(props: {
  params: Promise<{ handle: string }>;
}) {
  const params = await props.params;
  const product = await getProduct(params.handle);

  if (!product) return notFound();

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: product.featuredImage?.url,
    offers: {
      "@type": "AggregateOffer",
      availability: product.availableForSale
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      priceCurrency: product.priceRange.minVariantPrice.currencyCode,
      highPrice: product.priceRange.maxVariantPrice.amount,
      lowPrice: product.priceRange.minVariantPrice.amount,
    },
  };

  return (
    <ProductProvider>
      <script
        type="application/ld+json"
        /* oxlint-disable-next-line react/no-danger -- JSON-LD from app data */
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd),
        }}
      />
      <div className="section-inset pt-28 pb-24">
        <Breadcrumb
          category={product.productType || "General"}
          title={product.title}
        />

        <div className="flex flex-col gap-8 lg:flex-row">
          <div className="w-full lg:basis-4/6">
            {product.previewPdf?.reference?.url ? (
              <PdfViewer url={product.previewPdf.reference.url} />
            ) : null}
          </div>

          <div className="w-full lg:basis-2/6">
            <Suspense fallback={null}>
              <ProductDescription product={product} />
            </Suspense>
          </div>
        </div>
        {/* Suspense keeps recommendations from blocking the page stream. */}
        <Suspense fallback={null}>
          <RelatedProducts
            handle={product.handle}
            category={product.productType || "General"}
          />
        </Suspense>
      </div>
    </ProductProvider>
  );
}
