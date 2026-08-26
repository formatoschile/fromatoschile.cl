import { Suspense } from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/JsonLd/JsonLd";
import { buildBreadcrumbJsonLd } from "@/lib/seo/jsonLd";
import { getCollection, getCollections } from "@/lib/shopify";

import { DocumentsCatalogSkeleton } from "../_components/DocumentsCatalogSkeleton";

import { CategoryResults } from "./_components/CategoryResults";

export async function generateStaticParams() {
  try {
    const collections = await getCollections();
    // Skip the synthetic "All" collection (empty handle, not a real route).
    return collections
      .filter((collection) => collection.handle)
      .map((collection) => ({ collection: collection.handle }));
  } catch (error) {
    console.error("Failed to list collections for static generation:", error);
    return [];
  }
}

export async function generateMetadata(props: {
  params: Promise<{ collection: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const collection = await getCollection(params.collection);

  if (!collection) return notFound();

  const title = collection.seo?.title || collection.title;
  const description =
    collection.seo?.description ||
    collection.description ||
    `${collection.title} products`;

  return {
    title,
    description,
    alternates: {
      canonical: `/todos-los-documentos/${params.collection}`,
    },
    openGraph: {
      type: "website",
      title,
      description,
    },
  };
}

export default async function CategoryPage(props: {
  params: Promise<{ collection: string }>;
  searchParams?: Promise<{ q?: string; sort?: string }>;
}) {
  const params = await props.params;
  const collection = await getCollection(params.collection);

  if (!collection) return notFound();

  const description = collection.seo?.description || collection.description;

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Todos los documentos", path: "/todos-los-documentos" },
    {
      name: collection.title,
      path: `/todos-los-documentos/${collection.handle}`,
    },
  ]);

  return (
    <section>
      <JsonLd data={breadcrumbJsonLd} />

      <h1 className="text-ink text-4xl sm:text-5xl">{collection.title}</h1>

      {description ? (
        <p className="mt-4 max-w-2xl text-lg text-neutral-500">{description}</p>
      ) : null}

      {/* searchParams are only read inside this boundary, so the static
          shell above stays prerenderable under `cacheComponents`. */}
      <Suspense fallback={<DocumentsCatalogSkeleton />}>
        <CategoryResults
          categoryTitle={collection.title}
          searchParams={props.searchParams}
        />
      </Suspense>
    </section>
  );
}
