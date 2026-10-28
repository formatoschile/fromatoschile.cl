import { getCollections, getProducts } from "@/lib/shopify";

import type { Category } from "./CategoryCard";
import { CategoryCard } from "./CategoryCard";

export const DocumentCategories: React.FC = async () => {
  const [collections, products] = await Promise.all([
    getCollections(),
    getProducts({}),
  ]);

  const counts = new Map<string, number>();
  for (const product of products) {
    if (!product.collectionHandle) continue;
    counts.set(
      product.collectionHandle,
      (counts.get(product.collectionHandle) ?? 0) + 1
    );
  }

  const categories: Category[] = collections.map((collection) => ({
    collection,
    description: collection.description || collection.seo?.description || "",
    count: counts.get(collection.handle) ?? 0,
  }));

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="py-16">
      <div className="section-inset flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <h2 className="text-ink text-4xl font-normal sm:text-5xl">
          Categorías de Documentos
        </h2>

        <p className="max-w-md text-lg text-neutral-500">
          Encuentra el contrato o documento legal que necesitas, organizado por
          área de práctica
        </p>
      </div>

      <div className="hide-scrollbar mt-10 flex gap-5 overflow-x-auto pb-4">
        {categories.map((category) => (
          <CategoryCard key={category.collection.handle} category={category} />
        ))}
      </div>
    </section>
  );
};
