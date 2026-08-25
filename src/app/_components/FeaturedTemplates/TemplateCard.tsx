import Link from "next/link";

import { BuyButton } from "@/components/cart/BuyButton";
import { CategoryPill } from "@/components/ui/CategoryPill/CategoryPill";
import type { ProductCard } from "@/lib/shopify/types";
import { formatPrice } from "@/lib/utils/money";

const MAX_FEATURES = 3;

interface TemplateCardProps {
  product: ProductCard;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({ product }) => {
  const price = formatPrice(product.priceRange.minVariantPrice);
  const variantId = product.variants[0]?.id ?? "";
  const features = product.tags.slice(0, MAX_FEATURES);

  return (
    <div className="flex min-h-72 w-72 shrink-0 flex-col rounded-xl border border-neutral-200 bg-white p-6 shadow-sm first:ml-(--inset-x) last:mr-(--inset-x)">
      <Link href={`/product/${product.handle}`}>
        <h3 className="text-lg leading-snug font-medium text-neutral-800 hover:underline">
          {product.title}
        </h3>
      </Link>

      <CategoryPill
        category={product.productType || "General"}
        className="mt-3 self-start"
      />

      {features.length > 0 ? (
        <ul className="mt-4 list-disc space-y-1.5 pl-4 text-xs text-neutral-500">
          {features.map((feature) => (
            <li key={feature}>{feature}</li>
          ))}
        </ul>
      ) : null}

      <div className="mt-auto flex items-center justify-between pt-6">
        <span className="text-lg font-medium text-neutral-800">{price}</span>

        <BuyButton
          variantId={variantId}
          className="rounded-md bg-neutral-900 px-5 py-2 text-sm font-medium text-white hover:bg-neutral-700"
        />
      </div>
    </div>
  );
};
