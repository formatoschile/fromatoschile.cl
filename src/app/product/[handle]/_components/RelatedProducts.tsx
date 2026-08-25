import Link from "next/link";

import { CategoryPill } from "@/components/ui/CategoryPill/CategoryPill";
import { getProducts } from "@/lib/shopify";
import type { ProductCard } from "@/lib/shopify/types";
import { formatPrice } from "@/lib/utils/money";

const RELATED_PRODUCTS_LIMIT = 4;

interface RelatedProductsProps {
  handle: string;
  category: string;
}

export const RelatedProducts = async ({
  handle,
  category,
}: RelatedProductsProps) => {
  const products = await getProducts({ query: `product_type:"${category}"` });
  const relatedProducts = products
    .filter((product) => product.handle !== handle)
    .slice(0, RELATED_PRODUCTS_LIMIT);

  if (!relatedProducts.length) return null;

  return (
    <div className="mt-24">
      <h2 className="text-ink mb-6 text-2xl font-normal">Documentos simil</h2>
      <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {relatedProducts.map((product) => (
          <li key={product.handle}>
            <RelatedProductCard product={product} />
          </li>
        ))}
      </ul>
    </div>
  );
};

interface RelatedProductCardProps {
  product: ProductCard;
}

const RelatedProductCard: React.FC<RelatedProductCardProps> = ({ product }) => {
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
        <CategoryPill category={product.productType || "General"} />
        <span className="text-ink text-2xl">
          {formatPrice(product.priceRange.minVariantPrice)}
        </span>
      </div>
    </Link>
  );
};
