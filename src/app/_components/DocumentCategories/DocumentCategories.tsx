import Link from "next/link";

import { CategoryPill } from "@/components/ui/CategoryPill/CategoryPill";
import { getCollections, getProducts } from "@/lib/shopify";
import type { Collection } from "@/lib/shopify/types";
import { getProductCategory } from "@/lib/utils/product";

interface Category {
  collection: Collection;
  description: string;
  count: number;
}

export const DocumentCategories = async () => {
  const [collections, products] = await Promise.all([
    getCollections(),
    getProducts({}),
  ]);

  const counts = new Map<string, number>();
  for (const product of products) {
    const handle = getProductCategory(product).toLowerCase();
    counts.set(handle, (counts.get(handle) ?? 0) + 1);
  }

  const categories: Category[] = collections
    // The synthetic "All" collection (empty handle) links to the full catalog.
    .filter((collection) => collection.handle)
    .map((collection) => ({
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

interface CategoryCardProps {
  category: Category;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  const { collection, description, count } = category;

  return (
    <div className="flex min-h-40 w-64 shrink-0 flex-col justify-between rounded-xl bg-white p-6 shadow-sm first:ml-(--inset-x) last:mr-(--inset-x)">
      <div>
        <CategoryPill category={collection.title} />

        <p className="mt-4 text-sm text-neutral-600">{description}</p>
      </div>

      <Link
        href={`/todos-los-documentos/${collection.handle}`}
        className="text-ink mt-6 self-end text-sm font-normal underline underline-offset-4 hover:text-black"
      >
        ver {count} documentos
      </Link>
    </div>
  );
};
