import { getProducts } from "@/lib/shopify";

import { ProductCard } from "./ProductCard";

export const PreferitiCarousel = async () => {
  const products = await getProducts({ query: "tag:preferiti" });

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="relative bg-tertiary pt-44 pb-32 overflow-hidden">
      <div className="relative">
        <div className="flex gap-6 overflow-x-auto overflow-y-hidden pb-4 scrollbar-hide pl-6 pr-6">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};
