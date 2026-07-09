import { classNames } from "@/lib/utils/classNames";

interface CategoryStyle {
  pill: string;
  bar: string;
}

// Pill/bar colors per category, keyed by the Shopify product type.
// Single source of truth — do not redeclare per-component color maps.
const CATEGORY_STYLES: Record<string, CategoryStyle> = {
  Laboral: { pill: "bg-rose-200 text-rose-800", bar: "bg-rose-300" },
  Inmobiliario: { pill: "bg-sky-200 text-sky-800", bar: "bg-sky-300" },
  Sociedades: { pill: "bg-indigo-200 text-indigo-800", bar: "bg-indigo-300" },
  Comercial: { pill: "bg-purple-200 text-purple-800", bar: "bg-purple-300" },
  Commercial: { pill: "bg-purple-200 text-purple-800", bar: "bg-purple-300" },
  Civil: { pill: "bg-teal-200 text-teal-800", bar: "bg-teal-300" },
  Legal: { pill: "bg-amber-200 text-amber-800", bar: "bg-amber-300" },
  Mercantil: { pill: "bg-violet-200 text-violet-800", bar: "bg-violet-300" },
};

const DEFAULT_STYLE: CategoryStyle = {
  pill: "bg-neutral-200 text-neutral-700",
  bar: "bg-neutral-300",
};

export const getCategoryStyle = (category: string): CategoryStyle =>
  CATEGORY_STYLES[category] ?? DEFAULT_STYLE;

interface CategoryPillProps {
  category: string;
  className?: string;
}

export const CategoryPill: React.FC<CategoryPillProps> = ({
  category,
  className,
}) => {
  return (
    <span
      className={classNames(
        "inline-block rounded px-2 py-1 text-[10px] font-semibold uppercase tracking-widest",
        getCategoryStyle(category).pill,
        className
      )}
    >
      {category}
    </span>
  );
};
