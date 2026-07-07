export default function DocumentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-dvh bg-neutral-50 pt-20">{children}</div>;
}
