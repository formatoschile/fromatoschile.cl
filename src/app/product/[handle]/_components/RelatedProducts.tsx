import { TrackViewItemList } from "@/components/Analytics/TrackViewItemList";
import { ITEM_LISTS, toAnalyticsItem } from "@/lib/analytics";
import { getProducts } from "@/lib/shopify";
import { buildProductSearchQuery } from "@/lib/shopify/search";

import { RELATED_ITEM_CLASS, RELATED_LIST_CLASS } from "./relatedLayout";
import { RelatedProductCard } from "./RelatedProductCard";

const RELATED_PRODUCTS_LIMIT = 4;

interface RelatedProductsProps {
  handle: string;
  category: string;
}

export const RelatedProducts: React.FC<RelatedProductsProps> = async ({
  handle,
  category,
}) => {
  // Fetch one extra in case the current product lands in the page — avoids
  // pulling the whole category just to keep 4.
  const products = await getProducts({
    query: buildProductSearchQuery({ category }),
    first: RELATED_PRODUCTS_LIMIT + 1,
  });
  const relatedProducts = products
    .filter((product) => product.handle !== handle)
    .slice(0, RELATED_PRODUCTS_LIMIT);

  if (!relatedProducts.length) return null;

  const analyticsItems = relatedProducts.map((product, index) =>
    toAnalyticsItem({ product, listName: ITEM_LISTS.related, index })
  );

  return (
    <div className="mt-24">
      <TrackViewItemList listName={ITEM_LISTS.related} items={analyticsItems} />
      <h2 className="text-ink mb-6 text-2xl font-normal">
        Documentos similares
      </h2>
      <ul className={RELATED_LIST_CLASS}>
        {relatedProducts.map((product, index) => (
          <li key={product.handle} className={RELATED_ITEM_CLASS}>
            <RelatedProductCard
              product={product}
              analyticsItem={analyticsItems[index]}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};
