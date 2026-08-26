import { Suspense } from "react";

import { CatalogResults } from "./_components/CatalogResults";
import { DocumentsCatalogSkeleton } from "./_components/DocumentsCatalogSkeleton";

export const metadata = {
  title: "Todos los documentos",
  description:
    "Encuentra el contrato o documento legal que necesitas, redactado conforme a la normativa chilena.",
  alternates: {
    canonical: "/todos-los-documentos",
  },
};

export default function DocumentsPage(props: {
  searchParams?: Promise<{ categoria?: string; q?: string }>;
}) {
  return (
    <>
      <h1 className="text-ink text-4xl sm:text-5xl">
        Encuentra tu Documento Legal
      </h1>

      {/* searchParams are only read inside this boundary, so the static shell
          above (and generateStaticParams-driven routes elsewhere) stays
          prerenderable under `cacheComponents`. */}
      <Suspense fallback={<DocumentsCatalogSkeleton />}>
        <CatalogResults searchParams={props.searchParams} />
      </Suspense>
    </>
  );
}
