import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "mint",
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: "mint" | "ember" | "amber" | "sky";
}) {
  const tones = {
    mint: "text-mint",
    ember: "text-ember",
    amber: "text-amber",
    sky: "text-sky",
  };

  return (
    <article className="rounded-lg border border-line bg-panel p-4 shadow-glow">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-zinc-400">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
        </div>
        <Icon className={tones[tone]} size={24} />
      </div>
    </article>
  );
}
