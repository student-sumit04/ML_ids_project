export function PageHeader({ title, kicker }: { title: string; kicker: string }) {
  return (
    <header className="mb-6 flex flex-col gap-2 border-b border-line pb-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-mint">{kicker}</p>
      <h1 className="text-2xl font-semibold text-white sm:text-3xl">{title}</h1>
    </header>
  );
}
