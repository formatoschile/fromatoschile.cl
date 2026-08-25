import Link from "next/link";

interface BreadcrumbProps {
  category: string;
  title: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ category, title }) => {
  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-6 flex flex-wrap items-center gap-2 text-sm text-neutral-500"
    >
      <Link href="/todos-los-documentos" className="hover:text-ink">
        Todos los documentos
      </Link>
      <span aria-hidden="true">—</span>
      <Link
        href={{
          pathname: "/todos-los-documentos",
          query: { categoria: category },
        }}
        className="hover:text-ink"
      >
        {category}
      </Link>
      <span aria-hidden="true">—</span>
      <span className="text-ink truncate">{title}</span>
    </nav>
  );
};
