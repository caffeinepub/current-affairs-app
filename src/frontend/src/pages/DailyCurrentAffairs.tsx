import { Button } from "@/components/ui/button";
import { april2025Part1 } from "@/data/april2025Part1";
import { april2025Part2 } from "@/data/april2025Part2";
import { february2025Part1 } from "@/data/february2025Part1";
import { february2025Part2 } from "@/data/february2025Part2";
import { january2025Part1 } from "@/data/january2025Part1";
import type { NewsItem } from "@/data/january2025Part1";
import { january2025Part2 } from "@/data/january2025Part2";
import { march2025Part1 } from "@/data/march2025Part1";
import { march2025Part2 } from "@/data/march2025Part2";
import { may2025Part1 } from "@/data/may2025Part1";
import { getCategoryColor } from "@/lib/utils-ca";
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronDown,
  XCircle,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";

type TimeFilter = "Today" | "This Week" | "This Month" | "All Time";
type CategoryFilter =
  | "All"
  | "National"
  | "International"
  | "Economy"
  | "Legal"
  | "Awards"
  | "Sports";
type ImportanceFilter = "All" | "Most Important" | "Exam Likely";

const TIME_FILTERS: TimeFilter[] = [
  "Today",
  "This Week",
  "This Month",
  "All Time",
];
const CATEGORIES: CategoryFilter[] = [
  "All",
  "National",
  "International",
  "Economy",
  "Legal",
  "Awards",
  "Sports",
];

const ALL_DAYS = [
  ...january2025Part1,
  ...january2025Part2,
  ...february2025Part1,
  ...february2025Part2,
  ...march2025Part1,
  ...march2025Part2,
  ...april2025Part1,
  ...april2025Part2,
  ...may2025Part1,
];

const OPTION_LABELS = ["A", "B", "C", "D"];

function simpleHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function isImportant(item: NewsItem): boolean {
  return item.category === "Legal" || simpleHash(item.id) % 5 === 0;
}

function isExamLikely(item: NewsItem): boolean {
  return simpleHash(item.id) % 3 === 0;
}

function displayDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

type MCQSectionProps = { item: NewsItem; index: number };

function MCQSection({ item, index }: MCQSectionProps) {
  const [selected, setSelected] = useState<number | null>(null);

  function optionClass(i: number) {
    const base =
      "w-full text-left px-3 py-2 rounded-lg border text-sm transition-all duration-150 flex items-center gap-2.5 ";
    if (selected === null) {
      return `${base}border-border hover:border-primary/60 hover:bg-primary/5 text-foreground`;
    }
    if (i === item.mcq.correctIndex) {
      return `${base}border-green-500/60 bg-green-500/10 text-green-400`;
    }
    if (i === selected) {
      return `${base}border-red-500/60 bg-red-500/10 text-red-400`;
    }
    return `${base}border-border text-muted-foreground opacity-40`;
  }

  return (
    <div className="mt-4 pt-4 border-t border-border">
      <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">
        Practice MCQ
      </p>
      <p className="text-sm font-medium text-foreground mb-3 leading-snug">
        {item.mcq.question}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
        {item.mcq.options.map((opt, i) => (
          <button
            key={`opt-${OPTION_LABELS[i]}`}
            type="button"
            onClick={() => selected === null && setSelected(i)}
            disabled={selected !== null}
            className={optionClass(i)}
            data-ocid={`ca.item.${index + 1}.option.${i + 1}`}
          >
            <span className="w-5 h-5 rounded-full border border-current flex-shrink-0 flex items-center justify-center text-[10px] font-bold">
              {OPTION_LABELS[i]}
            </span>
            <span className="flex-1">{opt}</span>
            {selected !== null && i === item.mcq.correctIndex && (
              <CheckCircle2 className="w-4 h-4 ml-auto flex-shrink-0" />
            )}
            {selected === i && i !== item.mcq.correctIndex && (
              <XCircle className="w-4 h-4 ml-auto flex-shrink-0" />
            )}
          </button>
        ))}
      </div>
      {selected !== null && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-3 p-3 rounded-lg text-xs leading-relaxed ${
            selected === item.mcq.correctIndex
              ? "bg-green-500/10 text-green-400 border border-green-500/20"
              : "bg-red-500/10 text-red-400 border border-red-500/20"
          }`}
        >
          <span className="font-semibold">
            {selected === item.mcq.correctIndex
              ? "\u2713 Correct! "
              : "\u2717 Incorrect. "}
          </span>
          {item.mcq.explanation}
        </motion.div>
      )}
    </div>
  );
}

type AccordionRowProps = {
  item: NewsItem;
  dateStr: string;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  quickMode: boolean;
  isImportantItem: boolean;
  isExamLikelyItem: boolean;
};

function AccordionRow({
  item,
  dateStr,
  index,
  isExpanded,
  onToggle,
  quickMode,
  isImportantItem,
  isExamLikelyItem,
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
        data-ocid={`ca.item.${index + 1}.toggle`}
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground leading-snug">
            {item.title}
          </p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getCategoryColor(item.category)} inline-block`}
            >
              {item.category}
            </span>
            <span className="text-[11px] text-muted-foreground">
              {displayDate(dateStr)}
            </span>
            {isImportantItem && (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full border border-amber-500/30 text-amber-400 bg-amber-500/5">
                ⭐
              </span>
            )}
            {isExamLikelyItem && (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full border border-blue-500/30 text-blue-400 bg-blue-500/5">
                📘
              </span>
            )}
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
              <p className="text-sm text-muted-foreground leading-relaxed mb-0">
                {item.summary}
              </p>
              {item.mcq.explanation && (
                <div className="mt-3 px-3 py-2.5 rounded-lg bg-blue-500/8 border border-blue-500/20">
                  <p className="text-[10px] font-semibold text-blue-400 mb-1">
                    💡 Key Insight
                  </p>
                  <p className="text-xs text-blue-300/80 leading-relaxed">
                    {item.mcq.explanation}
                  </p>
                </div>
              )}
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {isImportantItem && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border border-amber-500/40 text-amber-400 bg-amber-500/10">
                    ⭐ Most Important
                  </span>
                )}
                {isExamLikelyItem && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border border-blue-500/40 text-blue-400 bg-blue-500/10">
                    📘 Exam Likely
                  </span>
                )}
              </div>
              <MCQSection item={item} index={index} />
            </div>
          </motion.div>
        )}
        {isExpanded && quickMode && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3">
              <p className="text-xs text-muted-foreground italic">
                Quick revision mode \u2014 summary hidden
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function getWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  return monday.toISOString().split("T")[0];
}

export function DailyCurrentAffairs() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("All Time");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("All");
  const [importanceFilter, setImportanceFilter] =
    useState<ImportanceFilter>("All");
  const [dateOverride, setDateOverride] = useState("");
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [quickMode, setQuickMode] = useState(false);

  const filteredGroups = useMemo(() => {
    if (dateOverride) {
      const day = ALL_DAYS.find((d) => d.date === dateOverride);
      if (!day) return [];
      let news =
        categoryFilter === "All"
          ? day.news
          : day.news.filter((n) => n.category === categoryFilter);
      if (quickMode)
        news = news.filter((n) => isImportant(n) || isExamLikely(n));
      else if (importanceFilter === "Most Important")
        news = news.filter(isImportant);
      else if (importanceFilter === "Exam Likely")
        news = news.filter(isExamLikely);
      return news.length > 0 ? [{ date: day.date, news }] : [];
    }

    const today = new Date().toISOString().split("T")[0];
    const weekStart = getWeekStart();
    const now = new Date();
    const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;

    let days = ALL_DAYS;
    if (timeFilter === "Today") {
      days = ALL_DAYS.filter((d) => d.date === today);
    } else if (timeFilter === "This Week") {
      days = ALL_DAYS.filter((d) => d.date >= weekStart && d.date <= today);
    } else if (timeFilter === "This Month") {
      days = ALL_DAYS.filter((d) => d.date >= monthStart && d.date <= today);
    }

    const sorted = [...days].sort((a, b) => (a.date > b.date ? -1 : 1));
    return sorted
      .map((day) => {
        let news =
          categoryFilter === "All"
            ? day.news
            : day.news.filter((n) => n.category === categoryFilter);
        if (quickMode)
          news = news.filter((n) => isImportant(n) || isExamLikely(n));
        else if (importanceFilter === "Most Important")
          news = news.filter(isImportant);
        else if (importanceFilter === "Exam Likely")
          news = news.filter(isExamLikely);
        return { date: day.date, news };
      })
      .filter((g) => g.news.length > 0);
  }, [timeFilter, categoryFilter, importanceFilter, dateOverride, quickMode]);

  function toggleItem(dateStr: string, id: string) {
    const key = `${dateStr}-${id}`;
    setExpandedKey((prev) => (prev === key ? null : key));
  }

  let globalIdx = 0;

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
              Daily Current Affairs
            </h1>
            <p className="text-muted-foreground text-xs mt-0.5">
              Stay updated with important news for TS LAWCET
            </p>
          </div>
        </div>
        <Button
          variant={quickMode ? "default" : "outline"}
          size="sm"
          onClick={() => setQuickMode((v) => !v)}
          className="flex items-center gap-1.5 flex-shrink-0 self-start sm:self-auto"
          data-ocid="daily_ca.quick_revision_toggle"
        >
          <Zap className="w-3.5 h-3.5" />
          Quick Revision
        </Button>
      </motion.div>

      {/* Time filter row */}
      <div className="flex items-center gap-1.5 flex-wrap mb-3">
        {TIME_FILTERS.map((tf) => (
          <button
            key={tf}
            type="button"
            onClick={() => {
              setTimeFilter(tf);
              setDateOverride("");
            }}
            className={`text-xs px-3.5 py-1.5 rounded-full border font-medium transition-colors ${
              timeFilter === tf && !dateOverride
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
            }`}
            data-ocid={`daily_ca.time_filter.${tf.toLowerCase().replace(" ", "_")}`}
          >
            {tf}
          </button>
        ))}
        <label className="flex items-center gap-1.5 ml-auto bg-card border border-border rounded-lg px-2.5 py-1 cursor-pointer hover:border-primary/50 transition-colors">
          <Calendar className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
          <input
            type="date"
            value={dateOverride}
            min="2025-01-01"
            max="2025-04-30"
            onChange={(e) => {
              setDateOverride(e.target.value);
              setTimeFilter("All Time");
            }}
            className="bg-transparent text-xs font-medium text-foreground outline-none cursor-pointer"
            style={{ colorScheme: "dark" }}
            data-ocid="daily_ca.date_input"
          />
        </label>
      </div>

      {/* Category filter row */}
      <div className="flex items-center gap-1.5 flex-wrap mb-3">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategoryFilter(cat)}
            className={`text-xs px-3.5 py-1.5 rounded-full border font-medium transition-colors ${
              categoryFilter === cat
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
            }`}
            data-ocid={`daily_ca.cat_filter.${cat.toLowerCase()}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Importance filter pills row */}
      <div className="flex items-center gap-1.5 flex-wrap mb-5">
        {(["All", "Most Important", "Exam Likely"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setImportanceFilter(f)}
            className={`text-xs px-3.5 py-1.5 rounded-full border font-medium transition-colors flex items-center gap-1 ${
              importanceFilter === f
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
            }`}
            data-ocid={`daily_ca.importance_filter.${f.toLowerCase().replace(" ", "_")}`}
          >
            {f === "Most Important"
              ? "⭐ Most Important"
              : f === "Exam Likely"
                ? "📘 Exam Likely"
                : f}
          </button>
        ))}
      </div>

      {/* Quick Revision banner */}
      <AnimatePresence>
        {quickMode && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="mb-4 px-4 py-2.5 rounded-lg border text-xs text-primary flex items-center gap-2 bg-primary/10 border-primary/30"
          >
            <Zap className="w-3.5 h-3.5 flex-shrink-0" />
            Quick Revision Mode \u2014 showing only Most Important & Exam Likely
            news
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      {filteredGroups.length === 0 ? (
        <div
          className="bg-card border border-border rounded-xl px-6 py-12 text-center"
          data-ocid="daily_ca.empty_state"
        >
          <p className="text-muted-foreground text-sm">
            {timeFilter === "Today"
              ? "No content available for today. Content covers Jan 1 \u2013 Apr 30, 2025."
              : "No content matches the selected filters."}
          </p>
          <p className="text-muted-foreground text-xs mt-1">
            Try \u201cAll Time\u201d or select a specific date.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {filteredGroups.map((group) => {
            const groupStartIdx = globalIdx;
            globalIdx += group.news.length;
            return (
              <DateGroup
                key={group.date}
                date={group.date}
                news={group.news}
                expandedKey={expandedKey}
                onToggle={toggleItem}
                quickMode={quickMode}
                startIdx={groupStartIdx}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

type DateGroupProps = {
  date: string;
  news: NewsItem[];
  expandedKey: string | null;
  onToggle: (date: string, id: string) => void;
  quickMode: boolean;
  startIdx: number;
};

function DateGroup({
  date,
  news,
  expandedKey,
  onToggle,
  quickMode,
  startIdx,
}: DateGroupProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="w-1 h-5 rounded-full bg-primary flex-shrink-0" />
        <h2 className="text-sm font-bold text-foreground">
          {displayDate(date)}
        </h2>
        <span className="text-xs text-muted-foreground">
          \u00b7 {news.length} items
        </span>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        {news.map((item, i) => {
          const itemKey = `${date}-${item.id}`;
          return (
            <AccordionRow
              key={item.id}
              item={item}
              dateStr={date}
              index={startIdx + i}
              isExpanded={expandedKey === itemKey}
              onToggle={() => onToggle(date, item.id)}
              quickMode={quickMode}
              isImportantItem={isImportant(item)}
              isExamLikelyItem={isExamLikely(item)}
            />
          );
        })}
      </div>
    </motion.div>
  );
}
