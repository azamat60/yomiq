export function BlockCard({
  title,
  caption,
  children,
}: {
  title?: string;
  caption?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3 rounded-card border border-line bg-surface p-4">
      {title && <h3 className="text-[15px] font-semibold tracking-tight">{title}</h3>}
      {children}
      {caption && <p className="text-[13px] leading-snug text-muted">{caption}</p>}
    </section>
  );
}
