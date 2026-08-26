import React from "react";

import { AddToCart } from "@/components/cart/AddToCart";
import { CategoryPill } from "@/components/ui/CategoryPill/CategoryPill";
import { Price } from "@/components/ui/Price";
import { Prose } from "@/components/ui/Prose";
import { Product } from "@/lib/shopify/types";

import { BuyNowButton } from "./BuyNowButton";
import { DetailAccordion } from "./DetailAccordion";
import { VariantSelector } from "./VariantSelector";

interface ProductDescriptionProps {
  product: Product;
}

export const ProductDescription: React.FC<ProductDescriptionProps> = ({
  product,
}) => {
  const sku = product.variants[0]?.sku;
  const category = product.productType || "General";

  return (
    <div className="flex flex-col lg:h-full">
      <div>
        <h1 className="text-ink mb-2 text-3xl font-medium sm:text-4xl">
          {product.title}
        </h1>

        <CategoryPill category={category} className="w-fit" />

        <Price
          className="text-ink mt-6 text-3xl"
          amount={product.priceRange.maxVariantPrice.amount}
          currencyCode={product.priceRange.maxVariantPrice.currencyCode}
        />

        {sku ? (
          <p className="mt-1 text-xs text-neutral-500">SKU {sku}</p>
        ) : null}

        <VariantSelector
          options={product.options}
          variants={product.variants}
        />
      </div>

      <div className="mt-8 flex flex-col gap-6 lg:mt-auto">
        {product.tags.length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {product.tags.map((tag) => (
              <li
                key={tag}
                className="rounded-full border border-neutral-300 px-3 py-1.5 text-xs text-neutral-600"
              >
                {tag}
              </li>
            ))}
          </ul>
        ) : null}

        <div className="flex flex-col gap-3">
          <BuyNowButton
            product={product}
            className="bg-charcoal hover:bg-charcoal/80 w-full border border-transparent py-4 text-sm font-medium tracking-widest text-white uppercase"
          >
            Compra
          </BuyNowButton>
          <AddToCart product={product} />
        </div>

        <div>
          <DetailAccordion title="Detalles producto">
            {product.descriptionHtml ? (
              <Prose
                className="max-w-none text-sm"
                html={product.descriptionHtml}
              />
            ) : (
              <p>Sin descripción disponible.</p>
            )}
          </DetailAccordion>

          <DetailAccordion title="Especificaciones">
            <dl className="space-y-1">
              <div className="flex justify-between gap-4">
                <dt className="text-neutral-500">Categoría</dt>
                <dd>{category}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-neutral-500">Formato</dt>
                <dd>PDF descargable</dd>
              </div>
            </dl>
          </DetailAccordion>
        </div>
      </div>
    </div>
  );
};
