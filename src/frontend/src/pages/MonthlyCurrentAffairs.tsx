import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getCategoryColor } from "@/lib/utils-ca";
import { BookOpen, ChevronDown, ChevronRight, Eye, EyeOff } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { useAllNewsItems } from "../hooks/useQueries";

// Generate exactly 15 months: Jan 2025 → Mar 2026
const MONTHS = (() => {
  const result: { year: number; month: number; label: string }[] = [];
  let year = 2025;
  let month = 1;
  while (result.length < 15) {
    result.push({
      year,
      month,
      label: new Date(year, month - 1, 1).toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
      }),
    });
    month++;
    if (month > 12) {
      month = 1;
      year++;
    }
  }
  return result;
})();

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function toDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function formatBigIntDate(ns: bigint): string {
  const ms = Number(ns / 1_000_000n);
  return new Date(ms).toISOString().split("T")[0];
}

function formatDayLabel(year: number, month: number, day: number): string {
  return new Date(year, month - 1, day).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

type NewsItem = {
  id: bigint;
  title: string;
  description: string;
  category: string;
  date: bigint;
  source: string;
};

type DayRowProps = {
  year: number;
  month: number;
  day: number;
  news: NewsItem[];
  quickMode: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  index: number;
};

function DayRow({
  year,
  month,
  day,
  news,
  quickMode,
  isExpanded,
  onToggle,
  index,
}: DayRowProps) {
  const hasNews = news.length > 0;
  return (
    <div className="border-b border-border last:border-0">
      <button
        type="button"
        onClick={onToggle}
        className={`w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors ${
          hasNews
            ? "hover:bg-muted/30 cursor-pointer"
            : "cursor-default opacity-60"
        }`}
        disabled={!hasNews}
        data-ocid={`monthly_ca.day.${index + 1}.button`}
      >
        <span className="text-sm font-medium text-foreground">
          {formatDayLabel(year, month, day)}
        </span>
        <div className="flex items-center gap-2">
          {hasNews && (
            <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
              {news.length}
            </Badge>
          )}
          {hasNews && (
            <ChevronDown
              className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${
                isExpanded ? "rotate-180" : ""
              }`}
            />
          )}
        </div>
      </button>
      <AnimatePresence>
        {isExpanded && hasNews && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3 pt-1 flex flex-col gap-2">
              {news.map((item) => (
                <div
                  key={String(item.id)}
                  className="bg-background border border-border rounded-lg px-3 py-2.5"
                >
                  {!quickMode && (
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getCategoryColor(item.category)} inline-block mb-1.5`}
                    >
                      {item.category}
                    </span>
                  )}
                  <p className="text-xs font-semibold text-foreground leading-snug">
                    {item.title}
                  </p>
                  {!quickMode && (
                    <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed line-clamp-2">
                      {item.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

type MonthRowProps = {
  year: number;
  month: number;
  label: string;
  newsByDate: Map<string, NewsItem[]>;
  quickMode: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  index: number;
};

function MonthRow({
  year,
  month,
  label,
  newsByDate,
  quickMode,
  isExpanded,
  onToggle,
  index,
}: MonthRowProps) {
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const totalDays = getDaysInMonth(year, month);
  const daysWithNews = useMemo(() => {
    let count = 0;
    for (let d = 1; d <= totalDays; d++) {
      if ((newsByDate.get(toDateStr(year, month, d))?.length ?? 0) > 0) count++;
    }
    return count;
  }, [newsByDate, year, month, totalDays]);

  function toggleDay(day: number) {
    setExpandedDay((prev) => (prev === day ? null : day));
  }

  return (
    <motion.div
      layout
      className="bg-card border border-border rounded-xl overflow-hidden shadow-card hover:border-primary/40 transition-colors"
      data-ocid={`monthly_ca.month.${index + 1}.panel`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/30 transition-colors group"
        data-ocid={`monthly_ca.month.${index + 1}.button`}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-primary/10">
            <BookOpen className="w-4 h-4 text-primary" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-foreground font-display">
              {label}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {daysWithNews > 0
                ? `${daysWithNews} days with news`
                : "No news data"}
            </p>
          </div>
        </div>
        <ChevronRight
          className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
            isExpanded ? "rotate-90" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="border-t border-border">
              {Array.from({ length: totalDays }, (_, i) => i + 1).map(
                (day, dIdx) => {
                  const dateStr = toDateStr(year, month, day);
                  const news = newsByDate.get(dateStr) ?? [];
                  return (
                    <DayRow
                      key={dateStr}
                      year={year}
                      month={month}
                      day={day}
                      news={news}
                      quickMode={quickMode}
                      isExpanded={expandedDay === day}
                      onToggle={() => toggleDay(day)}
                      index={dIdx}
                    />
                  );
                },
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function MonthlyCurrentAffairs() {
  const [expandedMonth, setExpandedMonth] = useState<number | null>(null);
  const [quickMode, setQuickMode] = useState(false);
  const { data: allNews, isLoading } = useAllNewsItems();

  const newsByDate = useMemo(() => {
    const map = new Map<string, NewsItem[]>();
    if (!allNews) return map;
    for (const item of allNews) {
      const dateStr = formatBigIntDate(item.date);
      if (!map.has(dateStr)) map.set(dateStr, []);
      map.get(dateStr)!.push(item);
    }
    return map;
  }, [allNews]);

  function toggleMonth(idx: number) {
    setExpandedMonth((prev) => (prev === idx ? null : idx));
  }

  return (
    <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex items-center justify-between gap-3 mb-6"
      >
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Monthly Current Affairs
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Jan 2025 – Mar 2026
          </p>
        </div>
        <Button
          variant={quickMode ? "default" : "outline"}
          size="sm"
          onClick={() => setQuickMode((v) => !v)}
          className={`flex items-center gap-2 flex-shrink-0 ${
            quickMode
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "border-border hover:border-primary/50"
          }`}
          data-ocid="monthly_ca.toggle"
        >
          {quickMode ? (
            <EyeOff className="w-3.5 h-3.5" />
          ) : (
            <Eye className="w-3.5 h-3.5" />
          )}
          <span className="hidden sm:inline">
            {quickMode ? "Full Mode" : "Quick Revision"}
          </span>
          <span className="sm:hidden">{quickMode ? "Full" : "Quick"}</span>
        </Button>
      </motion.div>

      {quickMode && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 px-4 py-2.5 rounded-lg border text-sm text-primary flex items-center gap-2 bg-primary/10 border-primary/30"
        >
          <Eye className="w-4 h-4 flex-shrink-0 text-primary" />
          <span>Quick Revision Mode — only titles shown</span>
        </motion.div>
      )}

      {isLoading ? (
        <div
          className="flex flex-col gap-3"
          data-ocid="monthly_ca.loading_state"
        >
          {[1, 2, 3, 4, 5].map((k) => (
            <div
              key={k}
              className="bg-card border border-border rounded-xl px-5 py-4 flex items-center gap-3"
            >
              <Skeleton className="w-8 h-8 rounded-lg" />
              <div className="flex-1">
                <Skeleton className="h-4 w-32 mb-1.5" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {MONTHS.map((m, idx) => (
            <MonthRow
              key={`${m.year}-${m.month}`}
              year={m.year}
              month={m.month}
              label={m.label}
              newsByDate={newsByDate}
              quickMode={quickMode}
              isExpanded={expandedMonth === idx}
              onToggle={() => toggleMonth(idx)}
              index={idx}
            />
          ))}
        </div>
      )}
    </div>
  );
}
