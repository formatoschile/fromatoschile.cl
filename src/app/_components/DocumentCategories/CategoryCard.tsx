import Link from "next/link";

import { CategoryPill } from "@/components/ui/CategoryPill/CategoryPill";
import type { Collection } from "@/lib/shopify/types";

export interface Category {
  collection: Collection;
  description: string;
  count: number;
}

interface CategoryCardProps {
  category: Category;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
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
