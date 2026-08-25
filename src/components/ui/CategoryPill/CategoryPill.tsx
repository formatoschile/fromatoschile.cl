import { classNames } from "@/lib/utils/classNames";

interface CategoryStyle {
  pill: string;
  bar: string;
}

// Pill/bar colors per category, keyed by the Shopify product type
// (lowercased — Shopify product types aren't reliably cased).
// Single source of truth — do not redeclare per-component color maps.
const CATEGORY_STYLES: Record<string, CategoryStyle> = {
  laboral: { pill: "bg-category-laboral text-ink", bar: "bg-category-laboral" },
  inmobiliario: { pill: "bg-sky-200 text-sky-800", bar: "bg-sky-300" },
  sociedades: { pill: "bg-indigo-200 text-indigo-800", bar: "bg-indigo-300" },
  comercial: {
    pill: "bg-category-comercial text-ink",
    bar: "bg-category-comercial",
  },
  commercial: {
    pill: "bg-category-comercial text-ink",
    bar: "bg-category-comercial",
  },
  civil: { pill: "bg-category-civil text-ink", bar: "bg-category-civil" },
  legal: { pill: "bg-amber-200 text-amber-800", bar: "bg-amber-300" },
  mercantil: { pill: "bg-violet-200 text-violet-800", bar: "bg-violet-300" },
};

const DEFAULT_STYLE: CategoryStyle = {
  pill: "bg-neutral-200 text-neutral-700",
  bar: "bg-neutral-300",
};

export const getCategoryStyle = (category: string): CategoryStyle =>
  CATEGORY_STYLES[category.toLowerCase()] ?? DEFAULT_STYLE;

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
        "inline-block rounded px-2 py-1 text-[11px] font-normal uppercase tracking-[4px]",
        getCategoryStyle(category).pill,
        className
      )}
    >
      {category}
    </span>
  );
};
