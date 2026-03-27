import type { NewsItem } from "@/data/january2025Part1";
import { getCategoryColor } from "@/lib/utils-ca";
import jsPDF from "jspdf";
import {
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  FileImage,
  FileText,
  Star,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";

type DayData = { date: string; news: NewsItem[] };

async function loadAllDays(): Promise<DayData[]> {
  const [m1, m2, m3, m4, m5, m6, m7, m8, m9, m10, m11, m12, m13, m14] =
    await Promise.all([
      import("@/data/january2025Part1"),
      import("@/data/january2025Part2"),
      import("@/data/february2025Part1"),
      import("@/data/february2025Part2"),
      import("@/data/march2025Part1"),
      import("@/data/march2025Part2"),
      import("@/data/april2025Part1"),
      import("@/data/april2025Part2"),
      import("@/data/may2025Part1"),
      import("@/data/may2025Part2"),
      import("@/data/june2025Part1"),
      import("@/data/june2025Part2"),
      import("@/data/july2025Part1"),
      import("@/data/july2025Part2"),
    ]);
  return [
    ...m1.january2025Part1,
    ...m2.january2025Part2,
    ...m3.february2025Part1,
    ...m4.february2025Part2,
    ...m5.march2025Part1,
    ...m6.march2025Part2,
    ...m7.april2025Part1,
    ...m8.april2025Part2,
    ...m9.may2025Part1,
    ...m10.may2025Part2,
    ...m11.june2025Part1,
    ...m12.june2025Part2,
    ...m13.july2025Part1,
    ...m14.july2025Part2,
  ];
}

const AVAILABLE_MONTHS = [
  { year: 2025, month: 1, label: "January 2025" },
  { year: 2025, month: 2, label: "February 2025" },
  { year: 2025, month: 3, label: "March 2025" },
  { year: 2025, month: 4, label: "April 2025" },
  { year: 2025, month: 5, label: "May 2025" },
  { year: 2025, month: 6, label: "June 2025" },
  { year: 2025, month: 7, label: "July 2025" },
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
  "Awards/Sports": {
    bg: "bg-pink-500/10",
    text: "text-pink-400",
    border: "border-pink-500/30",
    dot: "bg-pink-400",
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
  "Awards/Sports": {
    count: "text-pink-400",
    bg: "bg-pink-500/10",
    border: "border-pink-500/20",
  },
};

const CATEGORY_LIST = [
  "National",
  "International",
  "Economy",
  "Legal",
  "Awards/Sports",
];

// Canvas colors per category
const CAT_CANVAS_COLORS: Record<string, string> = {
  National: "#60a5fa",
  International: "#c084fc",
  Economy: "#4ade80",
  Legal: "#fbbf24",
  Awards: "#f472b6",
  "Awards/Sports": "#f472b6",
};

// PDF RGB colors per category
const CAT_PDF_COLORS: Record<string, [number, number, number]> = {
  National: [96, 165, 250],
  International: [192, 132, 252],
  Economy: [74, 222, 128],
  Legal: [251, 191, 36],
  Awards: [244, 114, 182],
  "Awards/Sports": [244, 114, 182],
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

// --- PDF generation ---

function generateNewsPDF(
  items: { item: NewsItem; date: string }[],
  monthLabel: string,
  mode: "all" | "filtered",
): void {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = 210;
  const pageH = 297;
  const margin = 15;
  const contentW = pageW - margin * 2;

  let y = margin;
  let pageNum = 1;

  function addFooter() {
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 130);
    doc.setFont("helvetica", "normal");
    doc.text(`TS LAWCET Current Affairs  |  ${monthLabel}`, margin, pageH - 8);
    doc.text(`Page ${pageNum}`, pageW - margin - 12, pageH - 8);
  }

  function checkNewPage(needed: number) {
    if (y + needed > pageH - 20) {
      addFooter();
      doc.addPage();
      pageNum++;
      y = margin;
    }
  }

  // --- Title page ---
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageW, pageH, "F");

  // Top accent bar gradient-like (blue)
  doc.setFillColor(59, 130, 246);
  doc.rect(0, 0, pageW, 3, "F");
  doc.setFillColor(139, 92, 246);
  doc.rect(pageW / 2, 0, pageW / 2, 3, "F");

  // Decorative circle
  doc.setFillColor(30, 58, 138);
  doc.circle(pageW - 30, 60, 40, "F");
  doc.setFillColor(20, 42, 100);
  doc.circle(pageW - 30, 60, 30, "F");

  // App label
  doc.setTextColor(96, 165, 250);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("TS LAWCET", margin, 50);

  doc.setTextColor(148, 163, 184);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Current Affairs", margin, 57);

  // Month title
  doc.setTextColor(241, 245, 249);
  doc.setFontSize(30);
  doc.setFont("helvetica", "bold");
  doc.text(monthLabel, margin, 78);

  // Divider line
  doc.setDrawColor(59, 130, 246);
  doc.setLineWidth(0.5);
  doc.line(margin, 84, margin + 60, 84);

  // Subtitle
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const modeLabel =
    mode === "all" ? "Complete Edition" : "Quick Revision — Filtered";
  doc.text(`${items.length} news items  ·  ${modeLabel}`, margin, 92);

  // Date generated
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Generated: ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`,
    margin,
    100,
  );

  // Category legend
  let lx = margin;
  const ly = 116;
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(100, 116, 139);
  doc.text("CATEGORIES:", margin, ly - 5);
  for (const cat of CATEGORY_LIST) {
    const rgb = CAT_PDF_COLORS[cat] ?? [148, 163, 184];
    doc.setFillColor(...rgb);
    doc.circle(lx + 2, ly + 1, 2, "F");
    doc.setTextColor(...rgb);
    doc.text(cat, lx + 6, ly + 3);
    lx += doc.getTextWidth(cat) + 14;
    if (lx > pageW - margin - 20) {
      lx = margin;
    }
  }

  addFooter();
  doc.addPage();
  pageNum++;
  y = margin;

  // --- Content pages ---
  // Group by date
  const dateGroups = new Map<string, { item: NewsItem; date: string }[]>();
  for (const entry of items) {
    const g = dateGroups.get(entry.date) ?? [];
    g.push(entry);
    dateGroups.set(entry.date, g);
  }

  for (const [date, groupItems] of dateGroups) {
    checkNewPage(22);

    // Date header bar
    doc.setFillColor(30, 58, 138);
    doc.roundedRect(margin, y, contentW, 10, 2, 2, "F");
    doc.setFillColor(59, 130, 246);
    doc.rect(margin, y, 3, 10, "F");
    doc.setTextColor(219, 234, 254);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    const [yr, mo, dy] = date.split("-").map(Number);
    const dateLabel = new Date(yr, mo - 1, dy).toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    doc.text(dateLabel, margin + 6, y + 7);
    y += 14;

    for (const { item } of groupItems) {
      const catRgb = CAT_PDF_COLORS[item.category] ?? [148, 163, 184];
      const titleLines = doc.splitTextToSize(item.title, contentW - 8);
      const summaryLines = doc.splitTextToSize(item.summary, contentW - 6);
      const insightText = item.mcq?.explanation ?? "";
      const insightLines = insightText
        ? doc.splitTextToSize(insightText, contentW - 10)
        : [];

      const cardH =
        6 +
        5 +
        (titleLines.length as number) * 5.5 +
        3 +
        (summaryLines.length as number) * 4.5 +
        (insightLines.length > 0
          ? (insightLines.length as number) * 4.5 + 3
          : 0) +
        5;

      checkNewPage(cardH + 5);

      // Card background
      doc.setFillColor(22, 32, 50);
      doc.roundedRect(margin, y, contentW, cardH, 2, 2, "F");

      // Left color accent
      doc.setFillColor(...catRgb);
      doc.rect(margin, y, 2.5, cardH, "F");

      // Subtle border
      doc.setDrawColor(40, 55, 80);
      doc.setLineWidth(0.2);
      doc.roundedRect(margin, y, contentW, cardH, 2, 2, "S");

      let cy = y + 5;

      // Category label
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...catRgb);
      doc.text(item.category.toUpperCase(), margin + 6, cy);
      cy += 5;

      // Title
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(241, 245, 249);
      doc.text(titleLines, margin + 5, cy);
      cy += (titleLines.length as number) * 5.5 + 3;

      // Summary
      doc.setFontSize(8.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(148, 163, 184);
      doc.text(summaryLines, margin + 5, cy);
      cy += (summaryLines.length as number) * 4.5 + 2;

      // Key Insight
      if (insightLines.length > 0) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(147, 197, 253);
        doc.text(insightLines, margin + 5, cy);
      }

      y += cardH + 4;
    }

    y += 4;
  }

  addFooter();

  const safeLabel = monthLabel.replace(/\s+/g, "-");
  doc.save(
    `TSLAWCET-${safeLabel}-CurrentAffairs${
      mode === "filtered" ? "-Filtered" : ""
    }.pdf`,
  );
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
  const PAGE_W = 720;
  const PAGE_H = 1080;
  const PAD = 28;
  const INNER_W = PAGE_W - PAD * 2;
  const CARD_PAD = 18;
  const CARD_INNER = INNER_W - CARD_PAD * 2;

  const measureCanvas = document.createElement("canvas");
  measureCanvas.width = PAGE_W;
  const mCtx = measureCanvas.getContext("2d")!;

  function measureCardHeight(entry: { item: NewsItem; date: string }): number {
    let h = CARD_PAD;
    h += 24;
    h += 8;
    mCtx.font = "bold 14px system-ui, sans-serif";
    h += measureWrappedHeight(mCtx, entry.item.title, CARD_INNER - 10, 21);
    h += 10;
    mCtx.font = "12px system-ui, sans-serif";
    h += measureWrappedHeight(mCtx, entry.item.summary, CARD_INNER, 18);
    h += 10;
    if (entry.item.mcq?.explanation) {
      h += 8;
      h += 16;
      mCtx.font = "11px system-ui, sans-serif";
      h += measureWrappedHeight(
        mCtx,
        entry.item.mcq.explanation,
        CARD_INNER - 20,
        17,
      );
      h += 12;
    }
    if (isImportant(entry.item) || isExamLikely(entry.item)) h += 28;
    h += CARD_PAD;
    return h;
  }

  // Group by date
  const dateGroups: Map<string, { item: NewsItem; date: string }[]> = new Map();
  for (const entry of items) {
    const group = dateGroups.get(entry.date) ?? [];
    group.push(entry);
    dateGroups.set(entry.date, group);
  }

  // Build pages: split content into PAGE_H-tall chunks
  type PageEntry =
    | { type: "header"; monthLabel: string; mode: string; count: number }
    | { type: "dateGroup"; date: string }
    | {
        type: "newsCard";
        entry: { item: NewsItem; date: string };
        cardH: number;
      };

  const allEntries: PageEntry[] = [
    { type: "header", monthLabel, mode, count: items.length },
  ];
  for (const [date, groupItems] of dateGroups) {
    allEntries.push({ type: "dateGroup", date });
    for (const entry of groupItems) {
      const cardH = measureCardHeight(entry);
      allEntries.push({ type: "newsCard", entry, cardH });
    }
  }

  // Assign entries to pages
  const pages: PageEntry[][] = [];
  let currentPage: PageEntry[] = [];
  let currentY = 0;

  for (const entry of allEntries) {
    let entryH = 0;
    if (entry.type === "header") entryH = 120;
    else if (entry.type === "dateGroup") entryH = 44;
    else entryH = entry.cardH + 10;

    if (currentY + entryH > PAGE_H - 30 && currentPage.length > 0) {
      pages.push(currentPage);
      currentPage = [];
      currentY = 0;
    }
    currentPage.push(entry);
    currentY += entryH;
  }
  if (currentPage.length > 0) pages.push(currentPage);

  // Draw each page and trigger download
  pages.forEach((pageEntries, pageIndex) => {
    const canvas = document.createElement("canvas");
    canvas.width = PAGE_W;
    canvas.height = PAGE_H;
    const ctx = canvas.getContext("2d")!;

    // Background
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, PAGE_W, PAGE_H);

    // Subtle grid
    ctx.strokeStyle = "rgba(255,255,255,0.02)";
    ctx.lineWidth = 1;
    for (let x = 0; x < PAGE_W; x += 36) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, PAGE_H);
      ctx.stroke();
    }

    // Top accent bar
    const grad = ctx.createLinearGradient(0, 0, PAGE_W, 0);
    grad.addColorStop(0, "#3b82f6");
    grad.addColorStop(1, "#8b5cf6");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, PAGE_W, 3);

    let y = 12;

    for (const entry of pageEntries) {
      if (entry.type === "header") {
        ctx.fillStyle = "#60a5fa";
        ctx.font = "bold 12px system-ui, sans-serif";
        ctx.fillText("TS LAWCET Current Affairs", PAD, y + 12);
        y += 22;

        ctx.fillStyle = "#f8fafc";
        ctx.font = "bold 24px system-ui, sans-serif";
        ctx.fillText(monthLabel, PAD, y + 24);
        y += 36;

        ctx.strokeStyle = "rgba(255,255,255,0.08)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(PAD, y);
        ctx.lineTo(PAGE_W - PAD, y);
        ctx.stroke();
        y += 12;

        ctx.fillStyle = "#94a3b8";
        ctx.font = "12px system-ui, sans-serif";
        const mLabel =
          mode === "all"
            ? `All news · ${entry.count} items`
            : `Quick Revision · ${entry.count} items`;
        ctx.fillText(mLabel, PAD, y + 12);
        y += 22;
      } else if (entry.type === "dateGroup") {
        ctx.fillStyle = "rgba(59,130,246,0.1)";
        drawRoundedRect(ctx, PAD, y, INNER_W, 28, 6);
        ctx.fill();
        ctx.fillStyle = "#3b82f6";
        drawRoundedRect(ctx, PAD, y, 3, 28, 2);
        ctx.fill();
        ctx.fillStyle = "#e2e8f0";
        ctx.font = "bold 12px system-ui, sans-serif";
        ctx.fillText(displayDate(entry.date), PAD + 12, y + 18);
        y += 36;
      } else {
        const { entry: e, cardH } = entry;
        const { item } = e;
        const imp = isImportant(item);
        const exam = isExamLikely(item);
        const catColor = CAT_CANVAS_COLORS[item.category] ?? "#94a3b8";

        ctx.fillStyle = "rgba(30,41,59,0.9)";
        drawRoundedRect(ctx, PAD, y, INNER_W, cardH, 8);
        ctx.fill();

        ctx.fillStyle = catColor;
        drawRoundedRect(ctx, PAD, y, 3, cardH, 2);
        ctx.fill();

        let cy = y + CARD_PAD;

        // Category badge
        ctx.font = "bold 10px system-ui, sans-serif";
        const badgeText = item.category;
        const badgeW = ctx.measureText(badgeText).width + 14;
        ctx.fillStyle = `${catColor}22`;
        drawRoundedRect(ctx, PAD + CARD_PAD, cy, badgeW, 18, 9);
        ctx.fill();
        ctx.strokeStyle = `${catColor}55`;
        ctx.lineWidth = 1;
        drawRoundedRect(ctx, PAD + CARD_PAD, cy, badgeW, 18, 9);
        ctx.stroke();
        ctx.fillStyle = catColor;
        ctx.fillText(badgeText, PAD + CARD_PAD + 7, cy + 12);
        cy += 24 + 8;

        ctx.font = "bold 14px system-ui, sans-serif";
        ctx.fillStyle = "#f1f5f9";
        const titleLines = wrapText(ctx, item.title, 0, CARD_INNER - 10, 21);
        for (const line of titleLines) {
          ctx.fillText(line, PAD + CARD_PAD, cy + 14);
          cy += 21;
        }
        cy += 10;

        ctx.font = "12px system-ui, sans-serif";
        ctx.fillStyle = "#94a3b8";
        const summaryLines = wrapText(ctx, item.summary, 0, CARD_INNER, 18);
        for (const line of summaryLines) {
          ctx.fillText(line, PAD + CARD_PAD, cy + 12);
          cy += 18;
        }
        cy += 10;

        if (item.mcq?.explanation) {
          const insightInner = CARD_INNER - 20;
          ctx.font = "11px system-ui, sans-serif";
          const insightLines = wrapText(
            ctx,
            item.mcq.explanation,
            0,
            insightInner,
            17,
          );
          const ibH = insightLines.length * 17 + 28;
          ctx.fillStyle = "rgba(59,130,246,0.08)";
          drawRoundedRect(ctx, PAD + CARD_PAD, cy, CARD_INNER, ibH, 6);
          ctx.fill();
          ctx.strokeStyle = "rgba(59,130,246,0.3)";
          ctx.lineWidth = 1;
          drawRoundedRect(ctx, PAD + CARD_PAD, cy, CARD_INNER, ibH, 6);
          ctx.stroke();
          ctx.fillStyle = "#60a5fa";
          ctx.font = "bold 10px system-ui, sans-serif";
          ctx.fillText("💡 Key Insight", PAD + CARD_PAD + 8, cy + 14);
          ctx.fillStyle = "#93c5fd";
          ctx.font = "11px system-ui, sans-serif";
          let iy = cy + 26;
          for (const line of insightLines) {
            ctx.fillText(line, PAD + CARD_PAD + 8, iy);
            iy += 17;
          }
          cy += ibH + 10;
        }

        if (imp || exam) {
          let tx = PAD + CARD_PAD;
          const tagY = cy + 4;
          if (imp) {
            ctx.font = "bold 10px system-ui, sans-serif";
            const tw = ctx.measureText("⭐ Most Important").width + 12;
            ctx.fillStyle = "rgba(251,191,36,0.1)";
            drawRoundedRect(ctx, tx, tagY, tw, 18, 9);
            ctx.fill();
            ctx.strokeStyle = "rgba(251,191,36,0.4)";
            ctx.lineWidth = 1;
            drawRoundedRect(ctx, tx, tagY, tw, 18, 9);
            ctx.stroke();
            ctx.fillStyle = "#fbbf24";
            ctx.fillText("⭐ Most Important", tx + 6, tagY + 12);
            tx += tw + 8;
          }
          if (exam) {
            ctx.font = "bold 10px system-ui, sans-serif";
            const tw = ctx.measureText("📘 Exam Likely").width + 12;
            ctx.fillStyle = "rgba(96,165,250,0.1)";
            drawRoundedRect(ctx, tx, tagY, tw, 18, 9);
            ctx.fill();
            ctx.strokeStyle = "rgba(96,165,250,0.4)";
            ctx.lineWidth = 1;
            drawRoundedRect(ctx, tx, tagY, tw, 18, 9);
            ctx.stroke();
            ctx.fillStyle = "#60a5fa";
            ctx.fillText("📘 Exam Likely", tx + 6, tagY + 12);
          }
        }

        y += cardH + 10;
      }
    }

    // Footer
    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(PAD, PAGE_H - 22);
    ctx.lineTo(PAGE_W - PAD, PAGE_H - 22);
    ctx.stroke();
    ctx.fillStyle = "#475569";
    ctx.font = "10px system-ui, sans-serif";
    ctx.fillText(`TS LAWCET  |  ${monthLabel}`, PAD, PAGE_H - 10);
    ctx.fillText(
      `Page ${pageIndex + 1} of ${pages.length}`,
      PAGE_W - PAD - 80,
      PAGE_H - 10,
    );

    const link = document.createElement("a");
    const safeLabel = monthLabel.replace(/\s+/g, "-");
    const suffix = mode === "filtered" ? "-Filtered" : "";
    link.download = `TSLAWCET-${safeLabel}${suffix}-Page${pageIndex + 1}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  });
}

// --- Download Dropdown ---

type DownloadDropdownProps = {
  onDownloadAllPDF: () => void;
  onDownloadFilteredPDF: () => void;
  onDownloadAllImage: () => void;
  onDownloadFilteredImage: () => void;
};

function DownloadDropdown({
  onDownloadAllPDF,
  onDownloadFilteredPDF,
  onDownloadAllImage,
  onDownloadFilteredImage,
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
            className="absolute right-0 top-full mt-1.5 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-50 min-w-[210px]"
          >
            {/* PDF Section */}
            <div className="px-3 pt-2.5 pb-1">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                <FileText className="w-3 h-3" />
                PDF
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onDownloadAllPDF();
              }}
              className="w-full text-left px-4 py-2 text-xs text-foreground hover:bg-muted/20 transition-colors flex items-center gap-2"
              data-ocid="monthly_ca.download_all_pdf_button"
            >
              <Download className="w-3.5 h-3.5 text-muted-foreground" />
              Download All
              <span className="text-[10px] text-muted-foreground ml-auto">
                .pdf
              </span>
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onDownloadFilteredPDF();
              }}
              className="w-full text-left px-4 py-2 text-xs text-foreground hover:bg-muted/20 transition-colors flex items-center gap-2"
              data-ocid="monthly_ca.download_filtered_pdf_button"
            >
              <Download className="w-3.5 h-3.5 text-muted-foreground" />
              Download Filtered
              <span className="text-[10px] text-muted-foreground ml-auto">
                .pdf
              </span>
            </button>

            <div className="border-t border-border my-1" />

            {/* Image Section */}
            <div className="px-3 pt-1 pb-1">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                <FileImage className="w-3 h-3" />
                Image
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onDownloadAllImage();
              }}
              className="w-full text-left px-4 py-2 text-xs text-foreground hover:bg-muted/20 transition-colors flex items-center gap-2"
              data-ocid="monthly_ca.download_all_image_button"
            >
              <Download className="w-3.5 h-3.5 text-muted-foreground" />
              Download All
              <span className="text-[10px] text-muted-foreground ml-auto">
                .png
              </span>
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onDownloadFilteredImage();
              }}
              className="w-full text-left px-4 py-2 pb-2.5 text-xs text-foreground hover:bg-muted/20 transition-colors flex items-center gap-2"
              data-ocid="monthly_ca.download_filtered_image_button"
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
  const [allDays, setAllDays] = useState<DayData[] | null>(null);
  const [monthIdx, setMonthIdx] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  const [highlightsExpanded, setHighlightsExpanded] = useState(true);
  const [quickMode, setQuickMode] = useState(false);

  useEffect(() => {
    loadAllDays().then(setAllDays);
  }, []);

  const currentMonth = AVAILABLE_MONTHS[monthIdx];

  const monthNews = useMemo(() => {
    if (!currentMonth || !allDays) return [];
    const { year, month } = currentMonth;
    const prefix = `${year}-${String(month).padStart(2, "0")}-`;
    const items: NewsItem[] = [];
    for (const day of allDays) {
      if (day.date.startsWith(prefix)) {
        items.push(...day.news);
      }
    }
    return items;
  }, [currentMonth, allDays]);

  const monthDaysWithNews = useMemo(() => {
    if (!currentMonth) return 0;
    const { year, month } = currentMonth;
    const prefix = `${year}-${String(month).padStart(2, "0")}-`;
    return (allDays ?? []).filter((d) => d.date.startsWith(prefix)).length;
  }, [currentMonth, allDays]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const cat of CATEGORY_LIST) counts[cat] = 0;
    for (const item of monthNews) {
      const key =
        item.category === "Awards" || item.category === "Sports"
          ? "Awards/Sports"
          : item.category;
      if (counts[key] !== undefined) counts[key]++;
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
    for (const day of allDays ?? []) {
      if (day.date.startsWith(prefix)) {
        for (const item of day.news) {
          if (
            categoryFilter === "All" ||
            item.category === categoryFilter ||
            (categoryFilter === "Awards/Sports" &&
              (item.category === "Awards" || item.category === "Sports"))
          ) {
            withDates.push({ item, date: day.date });
          }
        }
      }
    }
    withDates.sort((a, b) => (a.date < b.date ? -1 : 1));
    return withDates;
  }, [currentMonth, categoryFilter, allDays]);

  const allMonthNewsWithDates = useMemo(() => {
    if (!currentMonth) return [];
    const { year, month } = currentMonth;
    const prefix = `${year}-${String(month).padStart(2, "0")}-`;
    const withDates: { item: NewsItem; date: string }[] = [];
    for (const day of allDays ?? []) {
      if (day.date.startsWith(prefix)) {
        for (const item of day.news) {
          withDates.push({ item, date: day.date });
        }
      }
    }
    withDates.sort((a, b) => (a.date < b.date ? -1 : 1));
    return withDates;
  }, [currentMonth, allDays]);

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

  const label = currentMonth?.label ?? "";

  const handleDownloadAllPDF = () =>
    generateNewsPDF(allMonthNewsWithDates, label, "all");
  const handleDownloadFilteredPDF = () => {
    const items = quickMode ? quickRevisionNews : sortedFilteredNews;
    generateNewsPDF(items, label, "filtered");
  };
  const handleDownloadAllImage = () =>
    generateNewsImage(allMonthNewsWithDates, label, "all");
  const handleDownloadFilteredImage = () => {
    const items = quickMode ? quickRevisionNews : sortedFilteredNews;
    generateNewsImage(items, label, "filtered");
  };

  if (!allDays) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground text-sm">
            Loading current affairs…
          </p>
        </div>
      </div>
    );
  }

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
            onDownloadAllPDF={handleDownloadAllPDF}
            onDownloadFilteredPDF={handleDownloadFilteredPDF}
            onDownloadAllImage={handleDownloadAllImage}
            onDownloadFilteredImage={handleDownloadFilteredImage}
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
