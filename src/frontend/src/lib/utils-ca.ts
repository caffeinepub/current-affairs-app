export function getCategoryColor(cat: string): string {
  const map: Record<string, string> = {
    Legal: "border-blue-500/40 text-blue-400 bg-blue-500/10",
    National: "border-orange-500/40 text-orange-400 bg-orange-500/10",
    International: "border-purple-500/40 text-purple-400 bg-purple-500/10",
    Awards: "border-yellow-500/40 text-yellow-400 bg-yellow-500/10",
    Sports: "border-green-500/40 text-green-400 bg-green-500/10",
    Environment: "border-emerald-500/40 text-emerald-400 bg-emerald-500/10",
    Politics: "border-blue-500/40 text-blue-400 bg-blue-500/10",
    Economy: "border-emerald-500/40 text-emerald-400 bg-emerald-500/10",
    Science: "border-violet-500/40 text-violet-400 bg-violet-500/10",
    Technology: "border-cyan-500/40 text-cyan-400 bg-cyan-500/10",
  };
  return map[cat] ?? "border-border text-muted-foreground bg-muted/30";
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
