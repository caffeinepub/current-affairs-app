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
import { useEffect, useMemo, useRef, useState } from "react";

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
  Economy: {
    bg: "bg-green-500/10",
    text: "text-green-400",
    border: "border-green-500/30",
    dot: "bg-green-400",
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
    bg: "bg-teal-500/10",
    text: "text-teal-400",
    border: "border-teal-500/30",
    dot: "bg-teal-400",
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
  Economy: {
    count: "text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/20",
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
    count: "text-teal-400",
    bg: "bg-teal-500/10",
    border: "border-teal-500/20",
  },
};

const CATEGORY_LIST = [
  "National",
  "International",
  "Economy",
  "Legal",
  "Awards",
  "Sports",
];

// Canvas colors per category
const CAT_CANVAS_COLORS: Record<string, string> = {
  National: "#60a5fa",
  International: "#c084fc",
  Economy: "#4ade80",
  Legal: "#fbbf24",
  Awards: "#f472b6",
  Sports: "#2dd4bf",
};

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

// --- Canvas image generation ---

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  _x: number,
  maxWidth: number,
  _lineHeight: number,
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function measureWrappedHeight(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  lineHeight: number,
): number {
  const lines = wrapText(ctx, text, 0, maxWidth, lineHeight);
  return lines.length * lineHeight;
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function generateNewsImage(
  items: { item: NewsItem; date: string }[],
  monthLabel: string,
  mode: "all" | "filtered",
): void {
  const CANVAS_W = 800;
  const PAD = 32;
  const INNER_W = CANVAS_W - PAD * 2;
  const CARD_PAD = 20;
  const CARD_INNER = INNER_W - CARD_PAD * 2;

  // First pass: measure total height needed
  const measureCanvas = document.createElement("canvas");
  measureCanvas.width = CANVAS_W;
  const mCtx = measureCanvas.getContext("2d")!;

  function measureCardHeight(entry: { item: NewsItem; date: string }): number {
    let h = CARD_PAD; // top pad

    // category badge row ~20px
    h += 24;
    h += 8;

    // Title
    mCtx.font = "bold 15px system-ui, sans-serif";
    h += measureWrappedHeight(mCtx, entry.item.title, CARD_INNER - 10, 22);
    h += 10;

    // Summary
    mCtx.font = "13px system-ui, sans-serif";
    h += measureWrappedHeight(mCtx, entry.item.summary, CARD_INNER, 19);
    h += 10;

    // Key insight
    if (entry.item.mcq?.explanation) {
      h += 8; // label
      h += 16;
      mCtx.font = "12px system-ui, sans-serif";
      h += measureWrappedHeight(
        mCtx,
        entry.item.mcq.explanation,
        CARD_INNER - 24,
        18,
      );
      h += 12;
    }

    // Tags row
    const imp = isImportant(entry.item);
    const exam = isExamLikely(entry.item);
    if (imp || exam) h += 28;

    h += CARD_PAD; // bottom pad
    return h;
  }

  // Calculate total canvas height
  let totalH = 0;
  totalH += 90; // header
  totalH += 16; // gap
  totalH += 28; // mode subtitle
  totalH += 16; // gap

  // Group by date for header labels
  const dateGroups: Map<string, { item: NewsItem; date: string }[]> = new Map();
  for (const entry of items) {
    const group = dateGroups.get(entry.date) ?? [];
    group.push(entry);
    dateGroups.set(entry.date, group);
  }

  for (const [, groupItems] of dateGroups) {
    totalH += 36; // date group header
    totalH += 8;
    for (const entry of groupItems) {
      totalH += measureCardHeight(entry) + 10;
    }
    totalH += 8;
  }

  totalH += 60; // footer

  // Now draw on real canvas
  const canvas = document.createElement("canvas");
  canvas.width = CANVAS_W;
  canvas.height = totalH;
  const ctx = canvas.getContext("2d")!;

  // Background
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(0, 0, CANVAS_W, totalH);

  // Subtle grid pattern
  ctx.strokeStyle = "rgba(255,255,255,0.02)";
  ctx.lineWidth = 1;
  for (let x = 0; x < CANVAS_W; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, totalH);
    ctx.stroke();
  }

  let y = 0;

  // --- HEADER ---
  // Top accent bar
  const grad = ctx.createLinearGradient(0, 0, CANVAS_W, 0);
  grad.addColorStop(0, "#3b82f6");
  grad.addColorStop(1, "#8b5cf6");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CANVAS_W, 4);

  y = 18;
  // App name
  ctx.fillStyle = "#60a5fa";
  ctx.font = "bold 13px system-ui, sans-serif";
  ctx.fillText("TS LAWCET Current Affairs", PAD, y + 13);

  y += 24;
  ctx.fillStyle = "#f8fafc";
  ctx.font = "bold 26px system-ui, sans-serif";
  ctx.fillText(monthLabel, PAD, y + 26);

  y += 44;
  // Divider
  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(PAD, y);
  ctx.lineTo(CANVAS_W - PAD, y);
  ctx.stroke();
  y += 16;

  // Mode subtitle
  ctx.fillStyle = "#94a3b8";
  ctx.font = "13px system-ui, sans-serif";
  const modeLabel =
    mode === "all"
      ? `All news · ${items.length} items`
      : `Quick Revision / Filtered · ${items.length} items`;
  ctx.fillText(modeLabel, PAD, y + 13);
  y += 28 + 16;

  // --- DATE GROUPS ---
  for (const [date, groupItems] of dateGroups) {
    // Date header
    ctx.fillStyle = "rgba(59,130,246,0.1)";
    drawRoundedRect(ctx, PAD, y, INNER_W, 30, 8);
    ctx.fill();

    // Left accent
    ctx.fillStyle = "#3b82f6";
    drawRoundedRect(ctx, PAD, y, 4, 30, 2);
    ctx.fill();

    ctx.fillStyle = "#e2e8f0";
    ctx.font = "bold 13px system-ui, sans-serif";
    ctx.fillText(displayDate(date), PAD + 14, y + 20);
    y += 36 + 8;

    for (const entry of groupItems) {
      const cardH = measureCardHeight(entry);
      const { item } = entry;
      const imp = isImportant(item);
      const exam = isExamLikely(item);
      const catColor = CAT_CANVAS_COLORS[item.category] ?? "#94a3b8";

      // Card background
      ctx.fillStyle = "rgba(30,41,59,0.9)";
      drawRoundedRect(ctx, PAD, y, INNER_W, cardH, 10);
      ctx.fill();

      // Card left border accent
      ctx.fillStyle = catColor;
      drawRoundedRect(ctx, PAD, y, 3, cardH, 2);
      ctx.fill();

      let cy = y + CARD_PAD;

      // Category badge
      ctx.font = "bold 11px system-ui, sans-serif";
      const badgeText = item.category;
      const badgeW = ctx.measureText(badgeText).width + 16;
      ctx.fillStyle = `${catColor}22`;
      drawRoundedRect(ctx, PAD + CARD_PAD, cy, badgeW, 20, 10);
      ctx.fill();
      ctx.strokeStyle = `${catColor}55`;
      ctx.lineWidth = 1;
      drawRoundedRect(ctx, PAD + CARD_PAD, cy, badgeW, 20, 10);
      ctx.stroke();
      ctx.fillStyle = catColor;
      ctx.fillText(badgeText, PAD + CARD_PAD + 8, cy + 14);
      cy += 24 + 8;

      // Title
      ctx.font = "bold 15px system-ui, sans-serif";
      ctx.fillStyle = "#f1f5f9";
      const titleLines = wrapText(ctx, item.title, 0, CARD_INNER - 10, 22);
      for (const line of titleLines) {
        ctx.fillText(line, PAD + CARD_PAD, cy + 15);
        cy += 22;
      }
      cy += 10;

      // Summary
      ctx.font = "13px system-ui, sans-serif";
      ctx.fillStyle = "#94a3b8";
      const summaryLines = wrapText(ctx, item.summary, 0, CARD_INNER, 19);
      for (const line of summaryLines) {
        ctx.fillText(line, PAD + CARD_PAD, cy + 13);
        cy += 19;
      }
      cy += 10;

      // Key insight
      if (item.mcq?.explanation) {
        const insightInner = CARD_INNER - 24;
        ctx.font = "12px system-ui, sans-serif";
        const insightLines = wrapText(
          ctx,
          item.mcq.explanation,
          0,
          insightInner,
          18,
        );
        const insightBlockH = insightLines.length * 18 + 32;
        ctx.fillStyle = "rgba(59,130,246,0.08)";
        drawRoundedRect(ctx, PAD + CARD_PAD, cy, CARD_INNER, insightBlockH, 8);
        ctx.fill();
        ctx.strokeStyle = "rgba(59,130,246,0.3)";
        ctx.lineWidth = 1;
        drawRoundedRect(ctx, PAD + CARD_PAD, cy, CARD_INNER, insightBlockH, 8);
        ctx.stroke();

        ctx.fillStyle = "#60a5fa";
        ctx.font = "bold 11px system-ui, sans-serif";
        ctx.fillText("💡 Key Insight", PAD + CARD_PAD + 10, cy + 16);

        ctx.fillStyle = "#93c5fd";
        ctx.font = "12px system-ui, sans-serif";
        let iy = cy + 30;
        for (const line of insightLines) {
          ctx.fillText(line, PAD + CARD_PAD + 10, iy);
          iy += 18;
        }
        cy += insightBlockH + 12;
      }

      // Tags
      if (imp || exam) {
        let tx = PAD + CARD_PAD;
        const tagY = cy + 4;
        if (imp) {
          ctx.font = "bold 11px system-ui, sans-serif";
          const tw = ctx.measureText("⭐ Most Important").width + 14;
          ctx.fillStyle = "rgba(251,191,36,0.1)";
          drawRoundedRect(ctx, tx, tagY, tw, 20, 10);
          ctx.fill();
          ctx.strokeStyle = "rgba(251,191,36,0.4)";
          ctx.lineWidth = 1;
          drawRoundedRect(ctx, tx, tagY, tw, 20, 10);
          ctx.stroke();
          ctx.fillStyle = "#fbbf24";
          ctx.fillText("⭐ Most Important", tx + 7, tagY + 14);
          tx += tw + 8;
        }
        if (exam) {
          ctx.font = "bold 11px system-ui, sans-serif";
          const tw = ctx.measureText("📘 Exam Likely").width + 14;
          ctx.fillStyle = "rgba(96,165,250,0.1)";
          drawRoundedRect(ctx, tx, tagY, tw, 20, 10);
          ctx.fill();
          ctx.strokeStyle = "rgba(96,165,250,0.4)";
          ctx.lineWidth = 1;
          drawRoundedRect(ctx, tx, tagY, tw, 20, 10);
          ctx.stroke();
          ctx.fillStyle = "#60a5fa";
          ctx.fillText("📘 Exam Likely", tx + 7, tagY + 14);
        }
        cy += 28;
      }

      y += cardH + 10;
    }
    y += 8;
  }

  // --- FOOTER ---
  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(PAD, y);
  ctx.lineTo(CANVAS_W - PAD, y);
  ctx.stroke();
  y += 14;

  ctx.fillStyle = "#475569";
  ctx.font = "12px system-ui, sans-serif";
  const footerText = `TS LAWCET Current Affairs  |  ${monthLabel}`;
  const ftW = ctx.measureText(footerText).width;
  ctx.fillText(footerText, (CANVAS_W - ftW) / 2, y + 12);

  // Save
  const link = document.createElement("a");
  const safeLabel = monthLabel.replace(/\s+/g, "-");
  link.download = `TSLAWCET-${safeLabel}-CurrentAffairs${mode === "filtered" ? "-Filtered" : ""}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

// --- Download Dropdown ---

type DownloadDropdownProps = {
  onDownloadAll: () => void;
  onDownloadFiltered: () => void;
};

function DownloadDropdown({
  onDownloadAll,
  onDownloadFiltered,
}: DownloadDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
        data-ocid="monthly_ca.download_button"
      >
        <Download className="w-3.5 h-3.5" />
        Download
        <ChevronDown
          className={`w-3 h-3 transition-transform duration-150 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-1.5 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-50 min-w-[180px]"
          >
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onDownloadAll();
              }}
              className="w-full text-left px-4 py-2.5 text-xs text-foreground hover:bg-muted/20 transition-colors flex items-center gap-2"
              data-ocid="monthly_ca.download_all_button"
            >
              <Download className="w-3.5 h-3.5 text-muted-foreground" />
              Download All
              <span className="text-[10px] text-muted-foreground ml-auto">
                .png
              </span>
            </button>
            <div className="border-t border-border" />
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onDownloadFiltered();
              }}
              className="w-full text-left px-4 py-2.5 text-xs text-foreground hover:bg-muted/20 transition-colors flex items-center gap-2"
              data-ocid="monthly_ca.download_filtered_button"
            >
              <Download className="w-3.5 h-3.5 text-muted-foreground" />
              Download Filtered
              <span className="text-[10px] text-muted-foreground ml-auto">
                .png
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
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
  const imp = isImportant(item);
  const exam = isExamLikely(item);
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
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getCategoryColor(item.category)} inline-block`}
            >
              {item.category}
            </span>
            {imp && (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full border border-amber-500/30 text-amber-400 bg-amber-500/5">
                ⭐
              </span>
            )}
            {exam && (
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
              <p className="text-xs text-muted-foreground leading-relaxed">
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
                {imp && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border border-amber-500/40 text-amber-400 bg-amber-500/10">
                    ⭐ Most Important
                  </span>
                )}
                {exam && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border border-blue-500/40 text-blue-400 bg-blue-500/10">
                    📘 Exam Likely
                  </span>
                )}
              </div>
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
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
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

  // All news for current month (unfiltered) as {item, date}[]
  const allMonthNewsWithDates = useMemo(() => {
    if (!currentMonth) return [];
    const { year, month } = currentMonth;
    const prefix = `${year}-${String(month).padStart(2, "0")}-`;
    const withDates: { item: NewsItem; date: string }[] = [];
    for (const day of ALL_DAYS) {
      if (day.date.startsWith(prefix)) {
        for (const item of day.news) {
          withDates.push({ item, date: day.date });
        }
      }
    }
    withDates.sort((a, b) => (a.date < b.date ? -1 : 1));
    return withDates;
  }, [currentMonth]);

  // Quick revision filtered news
  const quickRevisionNews = useMemo(() => {
    return sortedFilteredNews.filter(
      ({ item }) => isImportant(item) || isExamLikely(item),
    );
  }, [sortedFilteredNews]);

  const groupedNews = useMemo(() => {
    const groups: {
      date: string;
      items: { item: NewsItem; date: string }[];
    }[] = [];
    let currentGroup: {
      date: string;
      items: { item: NewsItem; date: string }[];
    } | null = null;
    for (const entry of sortedFilteredNews) {
      if (!currentGroup || currentGroup.date !== entry.date) {
        currentGroup = { date: entry.date, items: [] };
        groups.push(currentGroup);
      }
      currentGroup.items.push(entry);
    }
    return groups;
  }, [sortedFilteredNews]);

  useEffect(() => {
    setExpandedDays(
      new Set(groupedNews.length > 0 ? [groupedNews[0].date] : []),
    );
    setExpandedKey(null);
  }, [groupedNews]);

  function toggleItem(id: string) {
    setExpandedKey((prev) => (prev === id ? null : id));
  }

  const canPrev = monthIdx > 0;
  const canNext = monthIdx < AVAILABLE_MONTHS.length - 1;

  const handleDownloadAll = () => {
    generateNewsImage(allMonthNewsWithDates, currentMonth?.label ?? "", "all");
  };

  const handleDownloadFiltered = () => {
    const items = quickMode ? quickRevisionNews : sortedFilteredNews;
    generateNewsImage(items, currentMonth?.label ?? "", "filtered");
  };

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
          <DownloadDropdown
            onDownloadAll={handleDownloadAll}
            onDownloadFiltered={handleDownloadFiltered}
          />
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
            {monthDaysWithNews} days · {monthNews.length} news items
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
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-5">
        {CATEGORY_LIST.map((cat) => {
          const colors = STAT_CARD_COLORS[cat];
          return (
            <div
              key={cat}
              className={`${colors.bg} border ${colors.border} rounded-xl p-3 text-center`}
            >
              <p className={`text-3xl font-bold ${colors.count} leading-none`}>
                {categoryCounts[cat] ?? 0}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1 leading-tight">
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
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">
                        {item.summary}
                      </p>
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

      {/* Quick revision banner */}
      {quickMode && (
        <div className="mb-4 px-4 py-2.5 rounded-lg bg-primary/10 border border-primary/20 flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs text-primary font-medium">
            Quick Revision Mode — showing {quickRevisionNews.length} most
            important &amp; exam-likely news
          </span>
        </div>
      )}

      {/* Day-grouped accordion list */}
      {groupedNews.length === 0 ? (
        <div
          className="bg-card border border-border rounded-xl px-6 py-10 text-center"
          data-ocid="monthly_ca.empty_state"
        >
          <p className="text-muted-foreground text-sm">
            No content for this selection.
          </p>
        </div>
      ) : (
        <div>
          {groupedNews.map((dayGroup) => {
            const isDayOpen = expandedDays.has(dayGroup.date);
            // In quick mode, only show days that have matching items
            const displayItems = quickMode
              ? dayGroup.items.filter(
                  ({ item }) => isImportant(item) || isExamLikely(item),
                )
              : dayGroup.items;

            if (quickMode && displayItems.length === 0) return null;

            return (
              <div
                key={dayGroup.date}
                className="bg-card border border-border rounded-xl overflow-hidden mb-3"
              >
                <button
                  type="button"
                  onClick={() =>
                    setExpandedDays((prev) => {
                      const next = new Set(prev);
                      if (next.has(dayGroup.date)) next.delete(dayGroup.date);
                      else next.add(dayGroup.date);
                      return next;
                    })
                  }
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/10 transition-colors"
                  data-ocid="monthly_ca.row"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-4 rounded-full bg-primary flex-shrink-0" />
                    <span className="text-sm font-semibold text-foreground">
                      {displayDate(dayGroup.date)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-medium">
                      {displayItems.length} news
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
                        isDayOpen ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </button>
                <AnimatePresence>
                  {isDayOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="overflow-hidden border-t border-border"
                    >
                      {displayItems.map(({ item }, idx) => (
                        <AccordionRow
                          key={item.id}
                          item={item}
                          index={idx}
                          isExpanded={
                            expandedKey === `${dayGroup.date}-${item.id}`
                          }
                          onToggle={() =>
                            toggleItem(`${dayGroup.date}-${item.id}`)
                          }
                          quickMode={quickMode}
                        />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
