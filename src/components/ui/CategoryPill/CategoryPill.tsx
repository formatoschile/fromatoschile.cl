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
  inmobiliario: {
    pill: "bg-category-inmobiliario text-ink",
    bar: "bg-category-inmobiliario",
  },
  sociedades: {
    pill: "bg-category-sociedades text-ink",
    bar: "bg-category-sociedades",
  },
  comercial: {
    pill: "bg-category-comercial text-ink",
    bar: "bg-category-comercial",
  },
  commercial: {
    pill: "bg-category-comercial text-ink",
    bar: "bg-category-comercial",
  },
  civil: { pill: "bg-category-civil text-ink", bar: "bg-category-civil" },
  legal: { pill: "bg-category-legal text-ink", bar: "bg-category-legal" },
  mercantil: {
    pill: "bg-category-mercantil text-ink",
    bar: "bg-category-mercantil",
  },
};

const DEFAULT_STYLE: CategoryStyle = {
  pill: "bg-category-default text-ink",
  bar: "bg-category-default",
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
