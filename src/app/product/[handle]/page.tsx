import { Suspense } from "react";
import * as Sentry from "@sentry/nextjs";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/JsonLd/JsonLd";
import { PdfViewer } from "@/components/product/PdfViewer/PdfViewer";
import { ProductProvider } from "@/components/product/ProductContext";
import { ProductDescription } from "@/components/product/ProductDescription";
import { buildBreadcrumbJsonLd, buildProductJsonLd } from "@/lib/seo/jsonLd";
import { getProduct, getProducts } from "@/lib/shopify";
import { HIDDEN_PRODUCT_TAG } from "@/lib/utils/constants";
import { getProductCategory } from "@/lib/utils/product";

import { Breadcrumb } from "./_components/Breadcrumb";
import { RelatedProducts } from "./_components/RelatedProducts";
import { RelatedProductsSkeleton } from "./_components/RelatedProductsSkeleton";

export async function generateStaticParams() {
  try {
    const products = await getProducts({});
    return products.map((product) => ({ handle: product.handle }));
  } catch (error) {
    Sentry.captureException(error, {
      tags: { action: "generateStaticParams:products" },
    });
    return [];
  }
}

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
    alternates: {
      canonical: `/product/${params.handle}`,
    },
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

  const category = getProductCategory(product);
  const productJsonLd = buildProductJsonLd(product);

  const breadcrumbJsonLd = buildBreadcrumbJsonLd(
    [
      { name: "Todos los documentos", path: "/todos-los-documentos" },
      product.collectionHandle
        ? {
            name: category,
            path: `/todos-los-documentos/${product.collectionHandle}`,
          }
        : null,
      { name: product.title, path: `/product/${product.handle}` },
    ].filter((item) => item !== null)
  );

  return (
    // ProductProvider reads the client `useSearchParams()` hook (to
    // pre-select a variant from the URL) — kept out of the static shell via
    // this `<Suspense>` so the route stays prerenderable under
    // `cacheComponents`. The hook itself does no I/O, so this boundary
    // resolves same-tick; `fallback={null}` never actually renders.
    <Suspense fallback={null}>
      <ProductProvider>
        <JsonLd data={productJsonLd} />
        <JsonLd data={breadcrumbJsonLd} />
        <div className="section-inset pt-28 pb-24">
          <Breadcrumb
            category={category}
            collectionHandle={product.collectionHandle}
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
          <Suspense fallback={<RelatedProductsSkeleton />}>
            <RelatedProducts handle={product.handle} category={category} />
          </Suspense>
        </div>
      </ProductProvider>
    </Suspense>
  );
}
