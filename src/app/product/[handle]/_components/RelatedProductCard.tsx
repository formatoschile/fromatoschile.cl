import Link from "next/link";

import { CategoryPill } from "@/components/ui/CategoryPill/CategoryPill";
import type { ProductCard } from "@/lib/shopify/types";
import { getProductCardDisplay } from "@/lib/utils/product";

interface RelatedProductCardProps {
  product: ProductCard;
}

export const RelatedProductCard: React.FC<RelatedProductCardProps> = ({
  product,
}) => {
  const { category, price } = getProductCardDisplay(product);

  return (
    <Link
      href={`/product/${product.handle}`}
      prefetch={true}
      className="flex h-full flex-col border border-neutral-200 p-6 sm:p-8"
    >
      <p className="text-ink mb-10 line-clamp-2 text-lg leading-snug">
        {product.title}
      </p>

      <div className="mt-auto flex items-center justify-between gap-2 border-t border-neutral-200 pt-6">
        <CategoryPill category={category} />
        <span className="text-ink text-2xl">{price}</span>
      </div>
    </Link>
  );
};
