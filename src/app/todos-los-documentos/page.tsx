import { getProducts } from "@/lib/shopify";

import { DocumentsCatalog } from "./_components/DocumentsCatalog";

export const metadata = {
  title: "Todos los documentos",
  description:
    "Encuentra el contrato o documento legal que necesitas, redactado conforme a la normativa chilena.",
  alternates: {
    canonical: "/todos-los-documentos",
  },
};

export default async function DocumentsPage(props: {
  searchParams?: Promise<{ categoria?: string }>;
}) {
  const searchParams = await props.searchParams;
  const initialCategory = searchParams?.categoria ?? null;

  const products = await getProducts({});

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 lg:px-10">
      <h1 className="text-ink text-4xl sm:text-5xl">
        Encuentra tu Documento Legal
      </h1>

      {/* Keyed by category so client-side navs with a new param reset the filter state. */}
      <DocumentsCatalog
        key={initialCategory ?? "all"}
        products={products}
        initialCategory={initialCategory}
      />
    </div>
  );
}
