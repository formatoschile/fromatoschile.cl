const PLACEHOLDER_CARDS = 4;

/** Loading placeholder for {@link DocumentCategories}; mirrors its layout. */
export const DocumentCategoriesSkeleton: React.FC = () => {
  return (
    <section className="py-16">
      <div className="section-inset flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <div className="h-9 w-64 animate-pulse rounded-md bg-neutral-100 sm:h-10" />
        <div className="h-10 w-full max-w-md animate-pulse rounded-md bg-neutral-100" />
      </div>

      <div className="mt-10 flex gap-5 overflow-x-hidden pb-4">
        {Array.from({ length: PLACEHOLDER_CARDS }).map((_, index) => (
          <div
            key={index}
            className="flex min-h-40 w-64 shrink-0 flex-col justify-between rounded-xl bg-white p-6 shadow-sm first:ml-(--inset-x) last:mr-(--inset-x)"
          >
            <div>
              <div className="h-6 w-24 animate-pulse rounded-full bg-neutral-100" />
              <div className="mt-4 h-4 w-full animate-pulse rounded-md bg-neutral-100" />
              <div className="mt-2 h-4 w-2/3 animate-pulse rounded-md bg-neutral-100" />
            </div>

            <div className="mt-6 h-4 w-32 animate-pulse rounded-md bg-neutral-100" />
          </div>
        ))}
      </div>
    </section>
  );
};
