import { april2025Part1 } from "@/data/april2025Part1";
import { april2025Part2 } from "@/data/april2025Part2";
import { february2025Part1 } from "@/data/february2025Part1";
import { february2025Part2 } from "@/data/february2025Part2";
import { january2025Part1 } from "@/data/january2025Part1";
import type { NewsItem } from "@/data/january2025Part1";
import { january2025Part2 } from "@/data/january2025Part2";
import { march2025Part1 } from "@/data/march2025Part1";
import { march2025Part2 } from "@/data/march2025Part2";
import { getCategoryColor } from "@/lib/utils-ca";
import {
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Star,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";

type DayData = { date: string; news: NewsItem[] };

const ALL_DAYS: DayData[] = [
  ...january2025Part1,
  ...january2025Part2,
  ...february2025Part1,
  ...february2025Part2,
  ...march2025Part1,
  ...march2025Part2,
  ...april2025Part1,
  ...april2025Part2,
];

const AVAILABLE_MONTHS = [
  { year: 2025, month: 1, label: "January 2025" },
  { year: 2025, month: 2, label: "February 2025" },
  { year: 2025, month: 3, label: "March 2025" },
  { year: 2025, month: 4, label: "April 2025" },
];

const CATEGORY_COLORS: Record<
  string,
  { bg: string; text: string; border: string; dot: string }
> = {
  National: {
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    border: "border-blue-500/30",
    dot: "bg-blue-400",
  },
  International: {
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    border: "border-purple-500/30",
    dot: "bg-purple-400",
  },
  Legal: {
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/30",
    dot: "bg-amber-400",
  },
  Awards: {
    bg: "bg-pink-500/10",
    text: "text-pink-400",
    border: "border-pink-500/30",
    dot: "bg-pink-400",
  },
  Sports: {
    bg: "bg-green-500/10",
    text: "text-green-400",
    border: "border-green-500/30",
    dot: "bg-green-400",
  },
};

const STAT_CARD_COLORS: Record<
  string,
  { count: string; bg: string; border: string }
> = {
  National: {
    count: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  International: {
    count: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
  },
  Legal: {
    count: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
  Awards: {
    count: "text-pink-400",
    bg: "bg-pink-500/10",
    border: "border-pink-500/20",
  },
  Sports: {
    count: "text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/20",
  },
};

const CATEGORY_LIST = [
  "National",
  "International",
  "Legal",
  "Awards",
  "Sports",
];

function displayDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

type AccordionRowProps = {
  item: NewsItem;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  quickMode: boolean;
};

function AccordionRow({
  item,
  index,
  isExpanded,
  onToggle,
  quickMode,
}: AccordionRowProps) {
  return (
    <div
      className={`border-b border-border last:border-0 transition-colors ${
        isExpanded ? "bg-muted/20" : "hover:bg-muted/10"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left px-4 py-3 flex items-center gap-3 cursor-pointer"
        data-ocid={`monthly_ca.item.${index + 1}.toggle`}
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground leading-snug">
            {item.title}
          </p>
          <div className="flex items-center gap-2 mt-1.5">
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getCategoryColor(item.category)} inline-block`}
            >
              {item.category}
            </span>
          </div>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform duration-200 ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {isExpanded && !quickMode && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                {item.summary}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function MonthlyCurrentAffairs() {
  const [monthIdx, setMonthIdx] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [highlightsExpanded, setHighlightsExpanded] = useState(true);
  const [quickMode, setQuickMode] = useState(false);

  const currentMonth = AVAILABLE_MONTHS[monthIdx];

  const monthNews = useMemo(() => {
    if (!currentMonth) return [];
    const { year, month } = currentMonth;
    const prefix = `${year}-${String(month).padStart(2, "0")}-`;
    const items: NewsItem[] = [];
    for (const day of ALL_DAYS) {
      if (day.date.startsWith(prefix)) {
        items.push(...day.news);
      }
    }
    return items;
  }, [currentMonth]);

  const monthDaysWithNews = useMemo(() => {
    if (!currentMonth) return 0;
    const { year, month } = currentMonth;
    const prefix = `${year}-${String(month).padStart(2, "0")}-`;
    return ALL_DAYS.filter((d) => d.date.startsWith(prefix)).length;
  }, [currentMonth]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const cat of CATEGORY_LIST) counts[cat] = 0;
    for (const item of monthNews) {
      if (counts[item.category] !== undefined) counts[item.category]++;
    }
    return counts;
  }, [monthNews]);

  const highlights = useMemo(() => {
    const seen = new Set<string>();
    const result: NewsItem[] = [];
    for (const item of monthNews) {
      if (!seen.has(item.category)) {
        seen.add(item.category);
        result.push(item);
      }
      if (result.length === CATEGORY_LIST.length) break;
    }
    return result;
  }, [monthNews]);

  const sortedFilteredNews = useMemo(() => {
    if (!currentMonth) return [];
    const { year, month } = currentMonth;
    const prefix = `${year}-${String(month).padStart(2, "0")}-`;
    const withDates: { item: NewsItem; date: string }[] = [];
    for (const day of ALL_DAYS) {
      if (day.date.startsWith(prefix)) {
        for (const item of day.news) {
          if (categoryFilter === "All" || item.category === categoryFilter) {
            withDates.push({ item, date: day.date });
          }
        }
      }
    }
    withDates.sort((a, b) => (a.date < b.date ? -1 : 1));
    return withDates;
  }, [currentMonth, categoryFilter]);

  function toggleItem(id: string) {
    setExpandedKey((prev) => (prev === id ? null : id));
  }

  const canPrev = monthIdx > 0;
  const canNext = monthIdx < AVAILABLE_MONTHS.length - 1;

  return (
    <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground leading-tight">
              Monthly Current Affairs
            </h1>
            <p className="text-muted-foreground text-xs mt-0.5">
              All daily news combined by month
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setQuickMode((v) => !v)}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${
              quickMode
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
            }`}
            data-ocid="monthly_ca.quick_revision_toggle"
          >
            <Zap className="w-3.5 h-3.5" />
            Quick Revision
          </button>
          <button
            type="button"
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
            data-ocid="monthly_ca.download_button"
          >
            <Download className="w-3.5 h-3.5" />
            Download
          </button>
        </div>
      </motion.div>

      {/* Month Navigation */}
      <div className="bg-card border border-border rounded-xl px-5 py-4 mb-5 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => {
            setMonthIdx((v) => v - 1);
            setExpandedKey(null);
            setCategoryFilter("All");
          }}
          disabled={!canPrev}
          className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          data-ocid="monthly_ca.pagination_prev"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="text-center">
          <p className="text-base font-bold text-foreground">
            {currentMonth?.label}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {monthDaysWithNews} days \u00b7 {monthNews.length} news items
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setMonthIdx((v) => v + 1);
            setExpandedKey(null);
            setCategoryFilter("All");
          }}
          disabled={!canNext}
          className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          data-ocid="monthly_ca.pagination_next"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Category Stats Cards */}
      <div className="grid grid-cols-5 gap-2 mb-5">
        {CATEGORY_LIST.map((cat) => {
          const colors = STAT_CARD_COLORS[cat];
          return (
            <div
              key={cat}
              className={`${colors.bg} border ${colors.border} rounded-xl p-3 text-center`}
            >
              <p className={`text-xl font-bold ${colors.count}`}>
                {categoryCounts[cat] ?? 0}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">
                {cat}
              </p>
            </div>
          );
        })}
      </div>

      {/* Important Highlights */}
      <div className="bg-card border border-amber-500/20 rounded-xl overflow-hidden mb-5">
        <button
          type="button"
          onClick={() => setHighlightsExpanded((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/10 transition-colors"
          data-ocid="monthly_ca.highlights.toggle"
        >
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-semibold text-foreground">
              Important Highlights
            </span>
            <span className="text-[10px] bg-amber-500/15 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-medium">
              {highlights.length} key news
            </span>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
              highlightsExpanded ? "rotate-180" : ""
            }`}
          />
        </button>
        <p className="px-4 pb-2 text-xs text-muted-foreground -mt-1">
          One representative story per category
        </p>

        <AnimatePresence>
          {highlightsExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 flex flex-col gap-2 border-t border-border">
                {highlights.map((item) => {
                  const colors = CATEGORY_COLORS[item.category];
                  return (
                    <div
                      key={`highlight-${item.id}`}
                      className={`${colors?.bg ?? ""} border ${
                        colors?.border ?? "border-border"
                      } rounded-lg px-3 py-2.5`}
                    >
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getCategoryColor(item.category)} inline-block mb-1.5`}
                      >
                        {item.category}
                      </span>
                      <p className="text-sm font-semibold text-foreground leading-snug">
                        {item.title}
                      </p>
                      {!quickMode && (
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">
                          {item.summary}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-1.5 flex-wrap mb-4">
        {(["All", ...CATEGORY_LIST] as const).map((cat) => {
          const count =
            cat === "All" ? monthNews.length : (categoryCounts[cat] ?? 0);
          return (
            <button
              key={cat}
              type="button"
              onClick={() => {
                setCategoryFilter(cat);
                setExpandedKey(null);
              }}
              className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors flex items-center gap-1 ${
                categoryFilter === cat
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
              }`}
              data-ocid={`monthly_ca.cat_filter.${cat.toLowerCase()}`}
            >
              {cat}
              <span
                className={`text-[10px] ${
                  categoryFilter === cat ? "opacity-80" : "opacity-60"
                }`}
              >
                ({count})
              </span>
            </button>
          );
        })}
      </div>

      {/* Flat accordion list */}
      {sortedFilteredNews.length === 0 ? (
        <div
          className="bg-card border border-border rounded-xl px-6 py-10 text-center"
          data-ocid="monthly_ca.empty_state"
        >
          <p className="text-muted-foreground text-sm">
            No content for this selection.
          </p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {sortedFilteredNews.map(({ item, date }, idx) => (
            <div key={`${date}-${item.id}`}>
              {(idx === 0 || sortedFilteredNews[idx - 1].date !== date) && (
                <div className="flex items-center gap-2 px-4 py-2 bg-muted/20 border-b border-border">
                  <div className="w-0.5 h-3 rounded-full bg-primary flex-shrink-0" />
                  <span className="text-xs font-medium text-muted-foreground">
                    {displayDate(date)}
                  </span>
                </div>
              )}
              <AccordionRow
                item={item}
                index={idx}
                isExpanded={expandedKey === `${date}-${item.id}`}
                onToggle={() => toggleItem(`${date}-${item.id}`)}
                quickMode={quickMode}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
