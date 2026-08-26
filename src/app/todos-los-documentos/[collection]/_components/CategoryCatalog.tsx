"use client";

import type { ProductCard } from "@/lib/shopify/types";

import { DocumentCard } from "../../_components/DocumentCard";
import { SearchInput } from "../../_components/SearchInput";
import { useProductSearch } from "../../_components/useProductSearch";

interface CategoryCatalogProps {
  products: ProductCard[];
}

export const CategoryCatalog: React.FC<CategoryCatalogProps> = ({
  products,
}) => {
  const { query, setQuery, filteredProducts } = useProductSearch(products);

  const handleQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };

  if (!products.length) {
    return (
      <p className="mt-12 text-sm text-neutral-500">
        No hay documentos en esta colección.
      </p>
    );
  }

  return (
    <>
      <div className="mt-10">
        <SearchInput value={query} onChange={handleQueryChange} />
      </div>

      {filteredProducts.length ? (
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filteredProducts.map((product) => (
            <DocumentCard key={product.handle} product={product} />
          ))}
        </div>
      ) : (
        <p className="mt-12 text-sm text-neutral-500">
          No encontramos documentos para tu búsqueda.
        </p>
      )}
    </>
  );
};
