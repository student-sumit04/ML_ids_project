import { BarChart3, BrainCircuit, Gauge, ShieldCheck, UploadCloud } from "lucide-react";
import type { ReactNode } from "react";

const nav = [
  { href: "#/", path: "/", label: "Overview", icon: Gauge },
  { href: "#/dashboard", path: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "#/upload", path: "/upload", label: "Upload", icon: UploadCloud },
  { href: "#/explain", path: "/explain", label: "Explain", icon: BrainCircuit },
  { href: "#/models", path: "/models", label: "Models", icon: ShieldCheck },
];

export function Shell({ children, activePath }: { children: ReactNode; activePath: string }) {
  return (
    <div className="min-h-screen bg-ink text-zinc-100">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-line bg-panel/95 px-4 py-5 lg:block">
        <a href="#/" className="flex items-center gap-3 border-b border-line pb-5">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-mint text-white">
            <ShieldCheck size={22} />
          </span>
          <span>
            <span className="block text-sm font-semibold uppercase tracking-wide text-mint">XAI IDS</span>
            <span className="text-xs text-zinc-400">CICIDS2018 engine</span>
          </span>
        </a>
        <nav className="mt-5 space-y-1">
          {nav.map((item) => {
            const active = activePath === item.path;
            const Icon = item.icon;
            return (
              <a
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition ${
                  active ? "bg-mint text-white shadow-glow" : "text-zinc-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </a>
            );
          })}
        </nav>
      </aside>
      <main className="lg:pl-64">
        <div className="mx-auto min-h-screen max-w-7xl px-4 py-5 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
