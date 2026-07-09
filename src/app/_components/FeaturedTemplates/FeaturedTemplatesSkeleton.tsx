const PLACEHOLDER_CARDS = 6;

/** Loading placeholder for {@link FeaturedTemplates}; mirrors its layout. */
export const FeaturedTemplatesSkeleton: React.FC = () => {
  return (
    <section className="bg-white py-16">
      <div className="section-inset flex items-center justify-between">
        <div className="h-9 w-72 animate-pulse rounded-md bg-neutral-100 sm:h-10" />

        <div className="flex items-center gap-3">
          <div className="h-11 w-11 animate-pulse rounded-full bg-neutral-100" />
          <div className="h-11 w-11 animate-pulse rounded-full bg-neutral-100" />
        </div>
      </div>

      <div className="mt-8 flex gap-5 overflow-x-hidden pb-4">
        {Array.from({ length: PLACEHOLDER_CARDS }).map((_, index) => (
          <div
            key={index}
            className="flex min-h-72 w-72 shrink-0 flex-col rounded-xl border border-neutral-200 bg-white p-6 shadow-sm first:ml-(--inset-x) last:mr-(--inset-x)"
          >
            <div className="h-6 w-3/4 animate-pulse rounded-md bg-neutral-100" />
            <div className="mt-3 h-6 w-24 animate-pulse rounded-full bg-neutral-100" />

            <div className="mt-4 space-y-2">
              <div className="h-3 w-full animate-pulse rounded bg-neutral-100" />
              <div className="h-3 w-5/6 animate-pulse rounded bg-neutral-100" />
              <div className="h-3 w-2/3 animate-pulse rounded bg-neutral-100" />
            </div>

            <div className="mt-auto flex items-center justify-between pt-6">
              <div className="h-6 w-20 animate-pulse rounded-md bg-neutral-100" />
              <div className="h-9 w-24 animate-pulse rounded-md bg-neutral-100" />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 ml-(--inset-x) h-4 w-48 animate-pulse rounded-md bg-neutral-100" />
    </section>
  );
};
