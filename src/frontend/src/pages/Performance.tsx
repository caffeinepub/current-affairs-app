import { Badge } from "@/components/ui/badge";
import { Award, CheckCircle2, ClipboardList, Target } from "lucide-react";
import { motion } from "motion/react";

interface TestEntry {
  id: number;
  name: string;
  date: string;
  score: number;
  total: number;
}

const TEST_HISTORY: TestEntry[] = [
  { id: 1, name: "Mock Test #8", date: "21 Mar 2026", score: 44, total: 50 },
  { id: 2, name: "Daily Quiz", date: "20 Mar 2026", score: 8, total: 10 },
  { id: 3, name: "Mock Test #7", date: "18 Mar 2026", score: 38, total: 50 },
  { id: 4, name: "Daily Quiz", date: "17 Mar 2026", score: 6, total: 10 },
  { id: 5, name: "Mock Test #6", date: "15 Mar 2026", score: 47, total: 50 },
  { id: 6, name: "Daily Quiz", date: "14 Mar 2026", score: 5, total: 10 },
  { id: 7, name: "Mock Test #5", date: "12 Mar 2026", score: 31, total: 50 },
  { id: 8, name: "Daily Quiz", date: "11 Mar 2026", score: 7, total: 10 },
  { id: 9, name: "Mock Test #4", date: "9 Mar 2026", score: 24, total: 50 },
  { id: 10, name: "Daily Quiz", date: "8 Mar 2026", score: 4, total: 10 },
];

function accuracy(score: number, total: number) {
  return Math.round((score / total) * 100);
}

function AccuracyBadge({ pct }: { pct: number }) {
  if (pct >= 70) {
    return (
      <Badge className="bg-success/20 text-success border-0 text-xs font-semibold">
        {pct}%
      </Badge>
    );
  }
  if (pct >= 50) {
    return (
      <Badge className="bg-warning/20 text-warning border-0 text-xs font-semibold">
        {pct}%
      </Badge>
    );
  }
  return (
    <Badge className="bg-destructive/20 text-destructive border-0 text-xs font-semibold">
      {pct}%
    </Badge>
  );
}

// Derived stats — single source of truth, no duplication
const totalAttempted = TEST_HISTORY.length;
const overallAccuracy = Math.round(
  TEST_HISTORY.reduce((sum, t) => sum + accuracy(t.score, t.total), 0) /
    totalAttempted,
);
const bestPct = Math.max(
  ...TEST_HISTORY.map((t) => accuracy(t.score, t.total)),
);
const bestEntry = TEST_HISTORY.find(
  (t) => accuracy(t.score, t.total) === bestPct,
)!;
const lastEntry = TEST_HISTORY[0];
const lastPct = accuracy(lastEntry.score, lastEntry.total);

type StatCard = {
  label: string;
  value: string;
  icon: typeof ClipboardList;
  iconClass: string;
  bgClass: string;
  valueClass: string;
};

const STAT_CARDS: StatCard[] = [
  {
    label: "Tests Attempted",
    value: String(totalAttempted),
    icon: ClipboardList,
    iconClass: "text-primary",
    bgClass: "bg-primary/10",
    valueClass: "text-primary",
  },
  {
    label: "Overall Accuracy",
    value: `${overallAccuracy}%`,
    icon: Target,
    iconClass: "text-teal",
    bgClass: "bg-teal/10",
    valueClass: "text-teal",
  },
  {
    label: "Best Score",
    value: `${bestEntry.score}/${bestEntry.total}`,
    icon: Award,
    iconClass: "text-warning",
    bgClass: "bg-warning/10",
    valueClass: "text-warning",
  },
  {
    label: "Last Test Score",
    value: `${lastEntry.score}/${lastEntry.total}`,
    icon: CheckCircle2,
    iconClass:
      lastPct >= 70
        ? "text-success"
        : lastPct >= 50
          ? "text-warning"
          : "text-destructive",
    bgClass:
      lastPct >= 70
        ? "bg-success/10"
        : lastPct >= 50
          ? "bg-warning/10"
          : "bg-destructive/10",
    valueClass:
      lastPct >= 70
        ? "text-success"
        : lastPct >= 50
          ? "text-warning"
          : "text-destructive",
  },
];

export function Performance() {
  return (
    <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        <div className="mb-6">
          <h1 className="text-2xl font-display font-bold text-foreground">
            Performance
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Track your quiz and mock test results.
          </p>
        </div>

        {/* STAT CARDS */}
        <div
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6"
          data-ocid="performance.section"
        >
          {STAT_CARDS.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: i * 0.07,
                  duration: 0.35,
                  ease: "easeOut",
                }}
                className="bg-card rounded-lg border border-border shadow-card px-4 py-4 flex flex-col gap-3"
                data-ocid={`performance.card.${(i + 1) as 1 | 2 | 3 | 4}`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${card.bgClass}`}
                >
                  <Icon className={`w-4 h-4 ${card.iconClass}`} />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium leading-tight">
                    {card.label}
                  </p>
                  <p
                    className={`text-2xl font-display font-bold mt-0.5 leading-none ${card.valueClass}`}
                  >
                    {card.value}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* TEST HISTORY */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.35, ease: "easeOut" }}
          className="bg-card rounded-lg border border-border shadow-card overflow-hidden"
          data-ocid="performance.table"
        >
          <div className="px-5 py-4 border-b border-border">
            <h2 className="font-semibold text-foreground text-sm uppercase tracking-widest text-muted-foreground">
              Test History
            </h2>
          </div>
          <ul className="divide-y divide-border">
            {TEST_HISTORY.map((entry, idx) => {
              const pct = accuracy(entry.score, entry.total);
              return (
                <motion.li
                  key={entry.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.32 + idx * 0.05, duration: 0.28 }}
                  className="px-5 py-3.5 flex items-center gap-3 hover:bg-muted/40 transition-colors"
                  data-ocid={`performance.row.${(idx + 1) as number}`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {entry.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {entry.date}
                    </p>
                  </div>
                  <span className="text-sm font-mono font-semibold text-foreground tabular-nums">
                    {entry.score}/{entry.total}
                  </span>
                  <AccuracyBadge pct={pct} />
                </motion.li>
              );
            })}
          </ul>
        </motion.div>
      </motion.div>
    </div>
  );
}
