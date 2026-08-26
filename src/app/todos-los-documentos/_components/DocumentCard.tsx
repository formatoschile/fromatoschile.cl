import Link from "next/link";

import {
  CategoryPill,
  getCategoryStyle,
} from "@/components/ui/CategoryPill/CategoryPill";
import type { ProductCard } from "@/lib/shopify/types";
import { classNames } from "@/lib/utils/classNames";
import { formatPrice } from "@/lib/utils/money";

import { PreviewThumbnail } from "./PreviewPlaceholder";

interface DocumentCardProps {
  product: ProductCard;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({ product }) => {
  const category = product.productType || "General";
  const price = formatPrice(product.priceRange.minVariantPrice);

  return (
    <Link
      href={`/product/${product.handle}`}
      className="block overflow-hidden rounded-2xl bg-white text-left shadow-sm ring-1 ring-neutral-100 transition-shadow hover:shadow-md"
    >
      <div
        className={classNames("h-2.5 w-full", getCategoryStyle(category).bar)}
      />

      <div className="p-4">
        <div className="flex justify-end">
          <CategoryPill category={category} />
        </div>

        <PreviewThumbnail />

        <h3 className="text-ink mt-4 min-h-[3rem] text-base leading-snug">
          {product.title}
        </h3>

        <p className="text-ink mt-2 text-xl">{price}</p>
      </div>
    </Link>
  );
};
