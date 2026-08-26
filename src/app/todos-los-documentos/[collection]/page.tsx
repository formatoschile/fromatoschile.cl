import { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  getCollection,
  getCollectionProducts,
  getCollections,
} from "@/lib/shopify";
import { defaultSort, sorting } from "@/lib/utils/constants";

import { CategoryCatalog } from "./_components/CategoryCatalog";

export async function generateStaticParams() {
  const collections = await getCollections();
  // Skip the synthetic "All" collection (empty handle, not a real route).
  return collections
    .filter((collection) => collection.handle)
    .map((collection) => ({ collection: collection.handle }));
}

export async function generateMetadata(props: {
  params: Promise<{ collection: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const collection = await getCollection(params.collection);

  if (!collection) return notFound();

  return {
    title: collection.seo?.title || collection.title,
    description:
      collection.seo?.description ||
      collection.description ||
      `${collection.title} products`,
    alternates: {
      canonical: `/todos-los-documentos/${params.collection}`,
    },
  };
}

export default async function CategoryPage(props: {
  params: Promise<{ collection: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const { sort } = searchParams as { [key: string]: string };
  const { sortKey, reverse } =
    sorting.find((item) => item.slug === sort) || defaultSort;

  const [collection, products] = await Promise.all([
    getCollection(params.collection),
    getCollectionProducts({
      collection: params.collection,
      sortKey,
      reverse,
    }),
  ]);

  if (!collection) return notFound();

  const description = collection.seo?.description || collection.description;

  return (
    <section>
      <h1 className="text-ink text-4xl sm:text-5xl">{collection.title}</h1>

      {description ? (
        <p className="mt-4 max-w-2xl text-lg text-neutral-500">{description}</p>
      ) : null}

      <CategoryCatalog products={products} />
    </section>
  );
}
