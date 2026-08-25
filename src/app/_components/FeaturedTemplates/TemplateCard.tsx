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
    <div className="flex min-h-72 w-72 shrink-0 flex-col rounded-xl bg-white p-6 shadow-sm first:ml-(--inset-x) last:mr-(--inset-x)">
      <Link href={`/product/${product.handle}`}>
        <h3 className="text-ink text-xl leading-tight font-normal hover:underline">
          {product.title}
        </h3>
      </Link>

      <CategoryPill
        category={product.productType || "General"}
        className="mt-3 self-start"
      />

      {features.length > 0 ? (
        <ul className="mt-4 list-disc space-y-1.5 pl-4 text-sm text-neutral-500">
          {features.map((feature) => (
            <li key={feature}>{feature}</li>
          ))}
        </ul>
      ) : null}

      <div className="border-ink/10 mt-auto flex items-center justify-between border-t pt-6">
        <span className="text-ink text-3xl font-normal">{price}</span>

        <BuyButton
          variantId={variantId}
          className="bg-charcoal hover:bg-charcoal/80 rounded-md px-5 py-2 text-lg font-normal text-white"
        />
      </div>
    </div>
  );
};
