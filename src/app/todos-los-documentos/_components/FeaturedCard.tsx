import Link from "next/link";

import { BuyButton } from "@/components/cart/BuyButton";
import { CategoryPill } from "@/components/ui/CategoryPill/CategoryPill";
import type { ProductCard } from "@/lib/shopify/types";
import { getProductCardDisplay } from "@/lib/utils/product";

interface FeaturedCardProps {
  product: ProductCard;
}

export const FeaturedCard: React.FC<FeaturedCardProps> = ({ product }) => {
  const { category, price } = getProductCardDisplay(product);
  const variantId = product.variants[0]?.id ?? "";

  return (
    <div className="relative flex flex-col rounded-2xl bg-white p-6 shadow-sm ring-1 ring-neutral-100 transition-shadow hover:shadow-md">
      <Link
        href={`/product/${product.handle}`}
        className="absolute inset-0 z-0 rounded-2xl"
        aria-label={`Ver ${product.title}`}
      />

      <div className="pointer-events-none relative z-10 flex flex-1 flex-col text-left">
        <h3 className="text-ink text-xl leading-snug">{product.title}</h3>

        <CategoryPill category={category} className="mt-4 self-start" />

        <ul className="mt-6 list-disc space-y-2 pl-4 text-sm text-neutral-600">
          {product.tags.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>

        <div className="mt-auto flex items-center justify-between pt-8">
          <span className="text-ink text-2xl">{price}</span>
          <BuyButton
            variantId={variantId}
            className="bg-charcoal hover:bg-charcoal/80 pointer-events-auto rounded-md px-5 py-2.5 text-sm font-medium text-white"
          />
        </div>
      </div>
    </div>
  );
};
