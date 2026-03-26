import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { april2025Part1 } from "@/data/april2025Part1";
import { april2025Part2 } from "@/data/april2025Part2";
import { february2025Part1 } from "@/data/february2025Part1";
import { february2025Part2 } from "@/data/february2025Part2";
import { january2025Part1 } from "@/data/january2025Part1";
import type { NewsItem as StaticNewsItem } from "@/data/january2025Part1";
import { january2025Part2 } from "@/data/january2025Part2";
import { march2025Part1 } from "@/data/march2025Part1";
import { march2025Part2 } from "@/data/march2025Part2";
import { getCategoryColor } from "@/lib/utils-ca";
import { BookMarked, Calendar, CheckCircle2, Eye, XCircle } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";

type MCQCardProps = { item: StaticNewsItem; index: number };

function MCQCard({ item, index }: MCQCardProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [showMCQ, setShowMCQ] = useState(false);
  const [markedRead, setMarkedRead] = useState(false);
  const [markedRevise, setMarkedRevise] = useState(false);

  function optionClass(i: number) {
    const base =
      "w-full text-left px-4 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200 ";
    if (selected === null) {
      return `${base}border-border hover:border-primary hover:bg-primary/10 text-foreground`;
    }
    if (i === item.mcq.correctIndex) {
      return `${base}border-success bg-success/10 text-success`;
    }
    if (i === selected) {
      return `${base}border-destructive bg-destructive/10 text-destructive`;
    }
    return `${base}border-border text-muted-foreground opacity-50`;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.3 }}
      className={`bg-card border rounded-xl p-5 shadow-card transition-colors ${
        markedRead
          ? "border-success/40"
          : markedRevise
            ? "border-warning/40"
            : "border-border"
      }`}
      data-ocid={`ca.card.${index + 1}`}
    >
      {/* Category and actions */}
      <div className="flex items-center gap-2 mb-2.5 flex-wrap">
        <span
          className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${getCategoryColor(item.category)} inline-block`}
        >
          {item.category}
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              setMarkedRead(!markedRead);
              setMarkedRevise(false);
            }}
            className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md border transition-colors ${
              markedRead
                ? "border-success/60 bg-success/10 text-success"
                : "border-border text-muted-foreground hover:border-success/40 hover:text-success"
            }`}
            data-ocid={`ca.card.${index + 1}.mark_read`}
          >
            <CheckCircle2 className="w-3 h-3" />
            {markedRead ? "Read" : "Mark Read"}
          </button>
          <button
            type="button"
            onClick={() => {
              setMarkedRevise(!markedRevise);
              setMarkedRead(false);
            }}
            className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md border transition-colors ${
              markedRevise
                ? "border-warning/60 bg-warning/10 text-warning"
                : "border-border text-muted-foreground hover:border-warning/40 hover:text-warning"
            }`}
            data-ocid={`ca.card.${index + 1}.mark_revise`}
          >
            <BookMarked className="w-3 h-3" />
            {markedRevise ? "Revise" : "Mark Revise"}
          </button>
        </div>
      </div>

      {/* News content */}
      <h3 className="text-sm font-bold text-foreground leading-snug mb-1.5">
        {item.title}
      </h3>
      <p className="text-xs text-muted-foreground leading-relaxed mb-3">
        {item.summary}
      </p>

      {/* Practice MCQ toggle */}
      <button
        type="button"
        onClick={() => setShowMCQ(!showMCQ)}
        className="flex items-center gap-1.5 text-xs font-medium text-primary border border-primary/30 bg-primary/5 hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors"
        data-ocid={`ca.card.${index + 1}.practice_mcq`}
      >
        <Eye className="w-3.5 h-3.5" />
        {showMCQ ? "Hide MCQ" : "Practice MCQ"}
      </button>

      {/* MCQ section */}
      <AnimatePresence>
        {showMCQ && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-sm font-semibold text-foreground mb-3 leading-snug">
                {item.mcq.question}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {item.mcq.options.map((opt, i) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => selected === null && setSelected(i)}
                    disabled={selected !== null}
                    className={optionClass(i)}
                    data-ocid={`ca.card.${index + 1}.option.${i + 1}`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full border border-current flex-shrink-0 flex items-center justify-center text-[10px] font-bold">
                        {["A", "B", "C", "D"][i]}
                      </span>
                      {opt}
                      {selected !== null && i === item.mcq.correctIndex && (
                        <CheckCircle2 className="w-4 h-4 ml-auto flex-shrink-0" />
                      )}
                      {selected === i && i !== item.mcq.correctIndex && (
                        <XCircle className="w-4 h-4 ml-auto flex-shrink-0" />
                      )}
                    </span>
                  </button>
                ))}
              </div>
              {selected !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-3 p-3 rounded-lg text-xs leading-relaxed ${
                    selected === item.mcq.correctIndex
                      ? "bg-success/10 text-success border border-success/20"
                      : "bg-destructive/10 text-destructive border border-destructive/20"
                  }`}
                >
                  <span className="font-semibold">
                    {selected === item.mcq.correctIndex
                      ? "Correct! "
                      : "Incorrect. "}
                  </span>
                  {item.mcq.explanation}
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
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

type CategoryFilter =
  | "All"
  | "Legal"
  | "National"
  | "International"
  | "Awards"
  | "Sports";
const CATEGORIES: CategoryFilter[] = [
  "All",
  "Legal",
  "National",
  "International",
  "Awards",
  "Sports",
];

export function DailyCurrentAffairs() {
  const [selectedDate, setSelectedDate] = useState("2025-01-15");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("All");

  const dayData = useMemo(() => {
    const allDays = [
      ...january2025Part1,
      ...january2025Part2,
      ...february2025Part1,
      ...february2025Part2,
      ...march2025Part1,
      ...march2025Part2,
      ...april2025Part1,
      ...april2025Part2,
    ];
    return allDays.find((d) => d.date === selectedDate) ?? null;
  }, [selectedDate]);

  const filteredNews = useMemo(() => {
    if (!dayData) return [];
    if (categoryFilter === "All") return dayData.news;
    return dayData.news.filter((n) => n.category === categoryFilter);
  }, [dayData, categoryFilter]);

  const hasData = dayData !== null;

  return (
    <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5"
      >
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Daily Current Affairs
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {displayDate(selectedDate)}
          </p>
        </div>
        <label className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2 shadow-xs cursor-pointer hover:border-primary transition-colors">
          <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
          <input
            type="date"
            value={selectedDate}
            min="2025-01-01"
            max="2025-04-30"
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-transparent text-sm font-medium text-foreground outline-none cursor-pointer"
            style={{ colorScheme: "dark" }}
            data-ocid="daily_ca.date_input"
          />
        </label>
      </motion.div>

      {/* Category Filter */}
      <div className="flex items-center gap-1.5 flex-wrap mb-5">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategoryFilter(cat)}
            className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
              categoryFilter === cat
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
            }`}
            data-ocid={`daily_ca.filter.${cat.toLowerCase()}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Content */}
      {!hasData ? (
        <div
          className="bg-card border border-border rounded-xl px-6 py-12 text-center"
          data-ocid="ca.no_data_state"
        >
          <p className="text-muted-foreground text-sm">
            Content available for January 1 – March 15, 2025. Select a date in
            that range.
          </p>
          <p className="text-muted-foreground text-xs mt-1">
            More dates coming soon.
          </p>
        </div>
      ) : filteredNews.length === 0 ? (
        <div className="bg-card border border-border rounded-xl px-6 py-10 text-center">
          <p className="text-muted-foreground text-sm">
            No {categoryFilter} news for this date.
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Top Stories
            </h2>
            <Badge variant="secondary" className="text-[10px]">
              {filteredNews.length} items
            </Badge>
          </div>
          <div className="flex flex-col gap-4">
            <AnimatePresence mode="wait">
              {filteredNews.map((item, idx) => (
                <MCQCard key={item.id} item={item} index={idx} />
              ))}
            </AnimatePresence>
          </div>
        </>
      )}
    </div>
  );
}
