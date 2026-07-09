import Link from "next/link";

import { CategoryPill } from "@/components/ui/CategoryPill/CategoryPill";
import { getProducts } from "@/lib/shopify";

// Marketing copy per category (Shopify product type). Categories without an
// entry still render — counts always come from the live catalog.
const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  Laboral: "Contratos de trabajo, confidencialidad, finiquitos",
  Inmobiliario: "Arrendamiento, compraventa, opciones de compra",
  Sociedades: "Constitución, pactos sociales, acuerdos",
  Comercial: "Compraventa, distribución, servicios",
  Civil: "Préstamos, donaciones, poderes",
  Legal: "Reclamaciones, acuerdos extrajudiciales",
  Mercantil: "Joint ventures, acuerdos de inversión",
};

interface Category {
  label: string;
  description: string;
  count: number;
}

export const DocumentCategories = async () => {
  const products = await getProducts({});
  const categories = getCategories(products.map((p) => p.productType));

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="py-16">
      <div className="section-inset flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <h2 className="font-condensed text-3xl text-neutral-800 sm:text-4xl">
          <span className="font-bold">Categorías</span>{" "}
          <span className="font-light">de Documentos</span>
        </h2>

        <p className="max-w-md text-sm text-neutral-500">
          Encuentra el contrato o documento legal que necesitas, organizado por
          área de práctica
        </p>
      </div>

      <div className="hide-scrollbar mt-10 flex gap-5 overflow-x-auto pb-4">
        {categories.map((category) => (
          <CategoryCard key={category.label} category={category} />
        ))}
      </div>
    </section>
  );
};

interface CategoryCardProps {
  category: Category;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  const { label, description, count } = category;

  return (
    <div className="flex min-h-40 w-64 shrink-0 flex-col justify-between rounded-xl bg-white p-6 shadow-sm first:ml-(--inset-x) last:mr-(--inset-x)">
      <div>
        <CategoryPill category={label} />

        <p className="mt-4 text-sm text-neutral-600">{description}</p>
      </div>

      <Link
        href={{
          pathname: "/todos-los-documentos",
          query: { categoria: label },
        }}
        className="mt-6 text-sm font-medium text-neutral-800 underline underline-offset-4 hover:text-neutral-950"
      >
        ver {count} documentos
      </Link>
    </div>
  );
};

function getCategories(productTypes: string[]): Category[] {
  const counts = new Map<string, number>();

  for (const productType of productTypes) {
    const label = productType || "General";
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }

  return Array.from(counts, ([label, count]) => ({
    label,
    count,
    description: CATEGORY_DESCRIPTIONS[label] ?? "",
  }));
}
