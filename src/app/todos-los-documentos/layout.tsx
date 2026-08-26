export default function DocumentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-neutral-50 pt-20">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-10">{children}</div>
    </div>
  );
}
