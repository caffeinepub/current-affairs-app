import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Home,
  Maximize2,
  XCircle,
} from "lucide-react";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { useIncrementTestsAttempted } from "../hooks/useQueries";

// Memoized palette button to prevent re-renders on timer tick
const QuestionPaletteButton = memo(function QuestionPaletteButton({
  index,
  statusClass,
  onClick,
}: {
  index: number;
  statusClass: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-8 h-8 rounded text-xs font-bold border transition-all ${statusClass}`}
      data-ocid={`mock_test.row.${index + 1}`}
    >
      {index + 1}
    </button>
  );
});

// Memoized palette button (mobile version - larger)
const QuestionPaletteButtonLg = memo(function QuestionPaletteButtonLg({
  index,
  statusClass,
  onClick,
}: {
  index: number;
  statusClass: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-10 h-10 rounded text-xs font-bold border transition-all ${statusClass}`}
      data-ocid={`mock_test.row.${index + 1}`}
    >
      {index + 1}
    </button>
  );
});

import type { DayData } from "../data/january2025Part1";

type Question = {
  id: number;
  question: string;
  options: [string, string, string, string];
  correct: number;
  topic: string;
};

async function loadAllData(): Promise<DayData[]> {
  const modules = await Promise.all([
    import("../data/january2025Part1"),
    import("../data/january2025Part2"),
    import("../data/february2025Part1"),
    import("../data/february2025Part2"),
    import("../data/march2025Part1"),
    import("../data/march2025Part2"),
    import("../data/april2025Part1"),
    import("../data/april2025Part2"),
    import("../data/may2025Part1"),
    import("../data/may2025Part2"),
    import("../data/june2025Part1"),
    import("../data/june2025Part2"),
    import("../data/july2025Part1"),
    import("../data/july2025Part2"),
    import("../data/august2025Part1"),
  ]);
  return [
    ...modules[0].january2025Part1,
    ...modules[1].january2025Part2,
    ...modules[2].february2025Part1,
    ...modules[3].february2025Part2,
    ...modules[4].march2025Part1,
    ...modules[5].march2025Part2,
    ...modules[6].april2025Part1,
    ...modules[7].april2025Part2,
    ...modules[8].may2025Part1,
    ...modules[9].may2025Part2,
    ...modules[10].june2025Part1,
    ...modules[11].june2025Part2,
    ...modules[12].july2025Part1,
    ...modules[13].july2025Part2,
    ...modules[14].august2025Part1,
  ];
}

function buildMockQuestions(days: DayData[]): Question[] {
  const all: Question[] = [];
  let id = 1;
  for (const day of days) {
    for (const news of day.news) {
      all.push({
        id: id++,
        question: news.mcq.question,
        options: news.mcq.options,
        correct: news.mcq.correctIndex,
        topic: news.category,
      });
    }
  }
  // Shuffle using Fisher-Yates
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }
  // Return up to 50 questions
  return all.slice(0, 50);
}

type Status = "not-visited" | "not-attempted" | "answered" | "marked";

const TOPIC_COLORS: Record<string, string> = {
  Economy: "text-emerald-400 bg-emerald-400/10",
  International: "text-orange-400 bg-orange-400/10",
  Technology: "text-cyan-400 bg-cyan-400/10",
  Science: "text-violet-400 bg-violet-400/10",
  Environment: "text-green-400 bg-green-400/10",
  Politics: "text-blue-400 bg-blue-400/10",
  Sports: "text-yellow-400 bg-yellow-400/10",
};

export function MockTest({ onNavigateHome }: { onNavigateHome?: () => void }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(
    Array(50).fill(null),
  );
  const [statuses, setStatuses] = useState<Status[]>(
    Array(50).fill("not-visited") as Status[],
  );
  const [timeLeft, setTimeLeft] = useState(60 * 60); // 60 minutes in seconds
  const [submitted, setSubmitted] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  const [startTime] = useState(Date.now());
  const incrementTestsAttempted = useIncrementTestsAttempted();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load questions from real CA data
  useEffect(() => {
    loadAllData().then((days) => {
      setQuestions(buildMockQuestions(days));
      setQuestionsLoading(false);
    });
  }, []);

  // Mark current as visited on mount / change
  useEffect(() => {
    setStatuses((prev) => {
      const next = [...prev];
      if (next[current] === "not-visited") next[current] = "not-attempted";
      return next;
    });
  }, [current]);

  // Timer countdown
  useEffect(() => {
    if (submitted) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          setSubmitted(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [submitted]);

  // Fullscreen detection
  useEffect(() => {
    function onFsChange() {
      setIsFullScreen(!!document.fullscreenElement);
    }
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const handleEnterFullscreen = useCallback(() => {
    document.documentElement.requestFullscreen().catch(() => {});
  }, []);

  function formatTime(s: number) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  }

  function selectOption(optIdx: number) {
    setAnswers((prev) => {
      const next = [...prev];
      next[current] = optIdx;
      return next;
    });
    setStatuses((prev) => {
      const next = [...prev];
      next[current] = "answered";
      return next;
    });
  }

  const saveAndNext = useCallback(() => {
    setCurrent((c) => Math.min(49, c + 1));
  }, []);

  const markAndNext = useCallback(() => {
    setCurrent((c) => {
      setStatuses((prev) => {
        const next = [...prev];
        next[c] = "marked";
        return next;
      });
      return Math.min(49, c + 1);
    });
  }, []);

  function handleSubmitConfirm() {
    clearInterval(timerRef.current!);
    const finalScore = answers.filter(
      (a, i) => a === questions[i].correct,
    ).length;
    setSubmitted(true);
    setShowSubmitDialog(false);
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    incrementTestsAttempted.mutate(BigInt(finalScore));
  }

  const unanswered = answers.filter((a) => a === null).length;
  const score = answers.filter((a, i) => a === questions[i].correct).length;
  const timeTaken = Math.floor((Date.now() - startTime) / 1000);

  function statusColor(s: Status, isCurrent: boolean): string {
    if (isCurrent) return "bg-primary text-white border-2 border-white/30";
    if (s === "answered") return "bg-success/80 text-white border-success";
    if (s === "marked") return "bg-warning/80 text-white border-warning";
    if (s === "not-attempted")
      return "bg-destructive/70 text-white border-destructive";
    return "bg-border text-muted-foreground border-border";
  }

  // ─── LOADING SCREEN ──────────────────────────────────────────────────────────
  if (questionsLoading || questions.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Loading questions…</p>
        </div>
      </div>
    );
  }

  // ─── RESULTS SCREEN ───────────────────────────────────────────────────────
  if (submitted) {
    const pct = Math.round((score / 50) * 100);
    const mm = Math.floor(timeTaken / 60);
    const ss = timeTaken % 60;
    const scoreColor =
      pct >= 70
        ? "text-success"
        : pct >= 50
          ? "text-warning"
          : "text-destructive";
    return (
      <div className="min-h-screen bg-background" data-ocid="mock_test.panel">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-4 bg-primary/10 text-primary border border-primary/30">
              <BookOpen className="w-4 h-4" />
              Test Completed
            </div>
            <h1 className="text-3xl font-display font-bold text-foreground mb-1">
              Your Results
            </h1>
            <p className="text-muted-foreground">
              {mm}m {ss}s · 50 Questions
            </p>
          </div>

          {/* Score card */}
          <div className="bg-card rounded-2xl p-6 mb-8 text-center border border-primary/30">
            <p className={`text-5xl font-display font-bold mb-1 ${scoreColor}`}>
              {score}
              <span className="text-2xl font-normal text-muted-foreground">
                /50
              </span>
            </p>
            <p className={`text-lg font-semibold ${scoreColor}`}>{pct}%</p>
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="bg-background rounded-xl py-3">
                <p className="text-xl font-bold text-success">{score}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Correct</p>
              </div>
              <div className="bg-background rounded-xl py-3">
                <p className="text-xl font-bold text-destructive">
                  {50 - score}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Wrong/Skipped
                </p>
              </div>
              <div className="bg-background rounded-xl py-3">
                <p className="text-xl font-bold text-foreground">
                  {mm}m {ss}s
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Time Taken
                </p>
              </div>
            </div>
          </div>

          {/* All questions review */}
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4">
            Review All Questions
          </h2>
          <div className="flex flex-col gap-3">
            {questions.map((q, i) => {
              const userAns = answers[i];
              const isCorrect = userAns === q.correct;
              const isSkipped = userAns === null;
              return (
                <div
                  key={q.id}
                  className="bg-card border border-border rounded-xl p-4 shadow-card"
                  data-ocid={`mock_test.review.item.${i + 1}`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`flex-shrink-0 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center mt-0.5 ${
                        isSkipped
                          ? "bg-border text-muted-foreground"
                          : isCorrect
                            ? "bg-success/20 text-success"
                            : "bg-destructive/20 text-destructive"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block mb-1.5 ${TOPIC_COLORS[q.topic] ?? "bg-border/20 text-muted-foreground"}`}
                      >
                        {q.topic}
                      </span>
                      <p className="text-sm font-semibold text-foreground mb-2 leading-snug">
                        {q.question}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {q.options.map((opt, oi) => {
                          let cls = "text-xs px-3 py-1.5 rounded-lg border ";
                          if (oi === q.correct)
                            cls +=
                              "border-success bg-success/10 text-success font-semibold";
                          else if (oi === userAns && !isCorrect)
                            cls +=
                              "border-destructive bg-destructive/10 text-destructive";
                          else cls += "border-border text-muted-foreground";
                          return (
                            <div
                              key={opt}
                              className={`${cls} flex items-center gap-1.5`}
                            >
                              <span className="font-bold flex-shrink-0">
                                {["A", "B", "C", "D"][oi]}.
                              </span>
                              {opt}
                              {oi === q.correct && (
                                <CheckCircle2 className="w-3.5 h-3.5 ml-auto flex-shrink-0 text-success" />
                              )}
                              {oi === userAns && !isCorrect && (
                                <XCircle className="w-3.5 h-3.5 ml-auto flex-shrink-0 text-destructive" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {onNavigateHome && (
            <div className="flex justify-center mt-8">
              <button
                type="button"
                onClick={onNavigateHome}
                data-ocid="mock_test.primary_button"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98] transition-all"
              >
                <Home className="w-4 h-4" />
                Return to Home
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  const q = questions[current];
  const userAnswer = answers[current];
  const isLastQuestion = current === 49;
  const isFirstQuestion = current === 0;
  const timerCritical = timeLeft <= 300;

  // ─── EXAM SCREEN ──────────────────────────────────────────────────────────
  return (
    <div
      className="h-screen flex flex-col bg-background overflow-hidden select-none"
      data-ocid="mock_test.panel"
    >
      {/* Fullscreen banner */}
      {!isFullScreen && (
        <div className="bg-warning/10 border-b border-warning/30 px-4 py-2 flex items-center justify-between text-sm">
          <span className="text-warning">
            For the best exam experience, use full-screen mode.
          </span>
          <button
            type="button"
            onClick={handleEnterFullscreen}
            className="flex items-center gap-1.5 text-warning font-semibold hover:text-warning/80"
            data-ocid="mock_test.toggle"
          >
            <Maximize2 className="w-4 h-4" /> Enter Full Screen
          </button>
        </div>
      )}

      {/* TOP BAR */}
      <header className="flex-shrink-0 bg-card border-b border-border shadow-xs">
        <div className="flex items-center h-12 px-4 gap-4">
          <div className="flex items-center gap-2 flex-shrink-0">
            <BookOpen className="w-4 h-4 text-teal" />
            <span className="font-display font-bold text-foreground text-sm hidden sm:block">
              Current Affairs Mock Test
            </span>
            <span className="font-display font-bold text-foreground text-sm sm:hidden">
              Mock Test
            </span>
          </div>

          <div className="flex-1 flex justify-center">
            <div
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full font-mono text-sm font-bold transition-colors ${
                timerCritical
                  ? "bg-destructive/10 text-destructive animate-pulse"
                  : "bg-background text-warning"
              }`}
              data-ocid="mock_test.panel"
            >
              ⏱ {formatTime(timeLeft)}
            </div>
          </div>

          <Button
            size="sm"
            className="flex-shrink-0 bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => setShowSubmitDialog(true)}
            data-ocid="mock_test.submit_button"
          >
            Submit Test
          </Button>
        </div>
      </header>

      {/* BODY */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT PALETTE — desktop */}
        <aside className="hidden lg:flex flex-col w-56 bg-card border-r border-border flex-shrink-0">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Question Palette
            </p>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-3">
              {/* Legend */}
              <div className="grid grid-cols-2 gap-1 mb-3">
                {(
                  [
                    ["bg-border", "Not Visited"],
                    ["bg-destructive/70", "Not Attempted"],
                    ["bg-success/80", "Answered"],
                    ["bg-warning/80", "Marked"],
                  ] as [string, string][]
                ).map(([cls, label]) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <span
                      className={`w-3 h-3 rounded-sm flex-shrink-0 ${cls}`}
                    />
                    <span className="text-[9px] text-muted-foreground leading-tight">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {questions.map((qItem, i) => (
                  <QuestionPaletteButton
                    key={qItem.id}
                    index={i}
                    statusClass={statusColor(statuses[i], i === current)}
                    onClick={() => setCurrent(i)}
                  />
                ))}
              </div>
            </div>
          </ScrollArea>
        </aside>

        {/* CENTER — question */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <ScrollArea className="flex-1">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
              {/* Question header */}
              <div className="flex items-center gap-3 mb-4">
                <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-primary/10 text-primary border border-primary/30">
                  Q {current + 1} / 50
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${TOPIC_COLORS[q.topic] ?? "bg-border/20 text-muted-foreground"}`}
                >
                  {q.topic}
                </span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {statuses[current] === "answered"
                    ? "✓ Answered"
                    : statuses[current] === "marked"
                      ? "⊙ Marked"
                      : "○ Not Attempted"}
                </span>
              </div>

              {/* Question text */}
              <div className="bg-card rounded-xl border border-border shadow-card p-5 mb-5">
                <p className="text-base font-semibold text-foreground leading-relaxed">
                  {q.question}
                </p>
              </div>

              {/* Options */}
              <div className="flex flex-col gap-3">
                {q.options.map((opt, i) => {
                  const isSelected = userAnswer === i;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => selectOption(i)}
                      className={`w-full text-left px-4 py-3.5 rounded-xl border-2 text-sm font-medium transition-all duration-150 flex items-center gap-3 ${
                        isSelected
                          ? "border-primary bg-primary/15 text-foreground"
                          : "border-border bg-card text-foreground hover:border-primary/50 hover:bg-primary/5"
                      }`}
                      data-ocid={`mock_test.row.${current + 1}`}
                    >
                      <span
                        className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                          isSelected
                            ? "border-primary bg-primary text-white"
                            : "border-border text-muted-foreground"
                        }`}
                      >
                        {["A", "B", "C", "D"][i]}
                      </span>
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          </ScrollArea>

          {/* BOTTOM NAV */}
          <div className="flex-shrink-0 bg-card border-t border-border px-4 py-3">
            <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrent((c) => Math.max(0, c - 1))}
                disabled={isFirstQuestion}
                className="flex items-center gap-1.5 border-border hover:border-primary/50"
                data-ocid="mock_test.pagination_prev"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </Button>

              {/* Mobile palette toggle */}
              <button
                type="button"
                className="lg:hidden text-xs font-semibold px-3 py-1.5 rounded-full border border-border text-muted-foreground hover:border-primary/50"
                onClick={() => setShowPalette((v) => !v)}
                data-ocid="mock_test.toggle"
              >
                Q Palette
              </button>

              <div className="hidden sm:flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={markAndNext}
                  className="flex items-center gap-1 text-warning border-warning/50 hover:bg-warning/10"
                  data-ocid="mock_test.secondary_button"
                >
                  Mark & Next
                </Button>
                <Button
                  size="sm"
                  onClick={saveAndNext}
                  disabled={isLastQuestion}
                  className="flex items-center gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
                  data-ocid="mock_test.primary_button"
                >
                  Save & Next <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={markAndNext}
                className="sm:hidden text-warning border-warning/50"
                data-ocid="mock_test.secondary_button"
              >
                Mark
              </Button>
              <Button
                size="sm"
                onClick={saveAndNext}
                disabled={isLastQuestion}
                className="sm:hidden bg-primary text-primary-foreground hover:bg-primary/90"
                data-ocid="mock_test.pagination_next"
              >
                Next <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </main>
      </div>

      {/* Mobile palette overlay */}
      {showPalette && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          data-ocid="mock_test.panel"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            onClick={() => setShowPalette(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-64 bg-card border-l border-border shadow-xl flex flex-col">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <p className="text-sm font-bold text-foreground">
                Question Palette
              </p>
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => setShowPalette(false)}
                data-ocid="mock_test.close_button"
              >
                ✕
              </button>
            </div>
            <div className="p-4 grid grid-cols-5 gap-2 overflow-y-auto">
              {questions.map((qItem2, i) => (
                <QuestionPaletteButtonLg
                  key={qItem2.id}
                  index={i}
                  statusClass={statusColor(statuses[i], i === current)}
                  onClick={() => {
                    setCurrent(i);
                    setShowPalette(false);
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Submit Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent data-ocid="mock_test.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Test?</AlertDialogTitle>
            <AlertDialogDescription>
              You have <strong>{unanswered}</strong> unanswered question
              {unanswered !== 1 ? "s" : ""}.
              {unanswered > 0 &&
                " Unanswered questions will be marked incorrect."}{" "}
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="mock_test.cancel_button">
              Continue Exam
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSubmitConfirm}
              data-ocid="mock_test.confirm_button"
            >
              Submit Test
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
