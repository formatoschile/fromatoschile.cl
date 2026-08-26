import { Grid } from "@/components/ui/Grid/Grid";

export const DocumentsCatalogSkeleton: React.FC = () => {
  return (
    <>
      <div className="mt-10 h-14 animate-pulse rounded-full bg-neutral-100" />
      <div className="mt-8 h-4 animate-pulse bg-neutral-100" />
      <Grid className="mt-12 grid-cols-2 lg:grid-cols-4">
        {Array(8)
          .fill(0)
          .map((_, index) => (
            <Grid.Item key={index} className="animate-pulse bg-neutral-100" />
          ))}
      </Grid>
    </>
  );
};
