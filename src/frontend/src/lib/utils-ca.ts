export const CATEGORY_COLORS: Record<string, string> = {
  Politics: "bg-blue-100 text-blue-700",
  Economy: "bg-emerald-100 text-emerald-700",
  Science: "bg-violet-100 text-violet-700",
  Environment: "bg-green-100 text-green-700",
  International: "bg-orange-100 text-orange-700",
  Sports: "bg-yellow-100 text-yellow-700",
  Technology: "bg-cyan-100 text-cyan-700",
};

export function getCategoryColor(cat: string) {
  return CATEGORY_COLORS[cat] ?? "bg-slate-100 text-slate-600";
}

export function formatBigIntDate(ns: bigint): string {
  const ms = Number(ns / 1_000_000n);
  return new Date(ms).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function calcProgressPct(completed: number, total: number): number {
  return total > 0 ? Math.round((completed / total) * 100) : 0;
}
