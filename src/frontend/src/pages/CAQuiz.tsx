import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Brain,
  CheckCircle,
  ChevronRight,
  Home,
  Trophy,
  X,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import type { DayData } from "../data/january2025Part1";
type QuizExtra = {
  newsId: string;
  mcq: {
    question: string;
    options: [string, string, string, string];
    correctIndex: number;
    explanation: string;
  };
};

async function loadAllQuizData(): Promise<{
  days: DayData[];
  extras: QuizExtra[];
}> {
  const [
    m1,
    m2,
    m3,
    m4,
    m5,
    m6,
    m7,
    m8,
    m9,
    m10,
    m11,
    m12,
    m13,
    m14,
    q1,
    q2,
    q3,
    q4,
    q5,
    q6,
    q7,
    q8,
    q9,
    q10,
    q11,
    q12,
    q13,
    q14,
  ] = await Promise.all([
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
    import("../data/january2025QuizExtra"),
    import("../data/january2025QuizExtraPart2"),
    import("../data/february2025QuizExtra"),
    import("../data/february2025QuizPart2"),
    import("../data/march2025QuizPart1"),
    import("../data/march2025QuizPart2"),
    import("../data/april2025QuizPart1"),
    import("../data/april2025QuizPart2"),
    import("../data/may2025QuizPart1"),
    import("../data/may2025QuizPart2"),
    import("../data/june2025QuizPart1"),
    import("../data/june2025QuizPart2"),
    import("../data/july2025QuizPart1"),
    import("../data/july2025QuizPart2"),
  ]);
  const days: DayData[] = [
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
  const extras: QuizExtra[] = [
    ...q1.january2025QuizExtra,
    ...q2.january2025QuizExtraPart2,
    ...q3.february2025QuizExtra,
    ...q4.february2025QuizPart2,
    ...q5.march2025QuizPart1,
    ...q6.march2025QuizPart2,
    ...q7.april2025QuizPart1,
    ...q8.april2025QuizPart2,
    ...q9.may2025QuizPart1,
    ...q10.may2025QuizPart2,
    ...q11.june2025QuizPart1,
    ...q12.june2025QuizPart2,
    ...q13.july2025QuizPart1,
    ...q14.july2025QuizPart2,
  ];
  return { days, extras };
}

type QuizQuestion = {
  newsTitle: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanation: string;
};

type Screen = "day-selector" | "quiz" | "results";

function buildQuestions(day: DayData, extras: QuizExtra[]): QuizQuestion[] {
  const questions: QuizQuestion[] = [];
  for (const news of day.news) {
    questions.push({
      newsTitle: news.title,
      question: news.mcq.question,
      options: news.mcq.options,
      correctIndex: news.mcq.correctIndex,
      explanation: news.mcq.explanation,
    });
    const extra = extras.find((e) => e.newsId === news.id);
    if (extra) {
      questions.push({
        newsTitle: news.title,
        question: extra.mcq.question,
        options: extra.mcq.options,
        correctIndex: extra.mcq.correctIndex,
        explanation: extra.mcq.explanation,
      });
    }
  }
  return questions;
}

function getDayLabel(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getStoredScore(dateStr: string): number | null {
  const val = localStorage.getItem(`ca_quiz_score_${dateStr}`);
  if (val === null) return null;
  return Number(val);
}

function storeScore(dateStr: string, score: number) {
  localStorage.setItem(`ca_quiz_score_${dateStr}`, String(score));
}

export function CAQuiz({ onNavigateHome }: { onNavigateHome?: () => void }) {
  const [allDays, setAllDays] = useState<DayData[] | null>(null);
  const [allExtras, setAllExtras] = useState<QuizExtra[]>([]);
  const [screen, setScreen] = useState<Screen>("day-selector");
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [scores, setScores] = useState<Record<string, number | null>>({});

  useEffect(() => {
    loadAllQuizData().then(({ days, extras }) => {
      setAllDays(days);
      setAllExtras(extras);
      const loaded: Record<string, number | null> = {};
      for (const day of days) {
        loaded[day.date] = getStoredScore(day.date);
      }
      setScores(loaded);
    });
  }, []);

  function startQuiz(day: DayData) {
    const qs = buildQuestions(day, allExtras);
    setSelectedDay(day);
    setQuestions(qs);
    setCurrentQ(0);
    setSelectedOption(null);
    setAnswers(new Array(qs.length).fill(null));
    setScreen("quiz");
  }

  function handleNext() {
    const newAnswers = [...answers];
    newAnswers[currentQ] = selectedOption;
    setAnswers(newAnswers);

    if (currentQ < questions.length - 1) {
      setCurrentQ((prev) => prev + 1);
      setSelectedOption(null);
    } else {
      const score = newAnswers.filter(
        (a, i) => a === questions[i].correctIndex,
      ).length;
      if (selectedDay) {
        storeScore(selectedDay.date, score);
        setScores((prev) => ({ ...prev, [selectedDay.date]: score }));
      }
      setScreen("results");
    }
  }

  function handleExit() {
    setScreen("day-selector");
    setSelectedDay(null);
  }

  function handleTryAgain() {
    if (selectedDay) startQuiz(selectedDay);
  }

  if (screen === "day-selector") {
    return (
      <div className="min-h-screen bg-background pb-20 sm:pb-8">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Brain className="w-7 h-7 text-primary" />
              CA Quiz — Current Affairs
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              10 questions per day · 2 MCQs per news item
            </p>
          </div>

          {(() => {
            if (!allDays) {
              return (
                <div className="flex items-center justify-center py-16">
                  <div className="text-center">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-muted-foreground text-sm">
                      Loading quiz data…
                    </p>
                  </div>
                </div>
              );
            }
            const GROUPS = [
              {
                label: "January 2025 (1–15)",
                days: allDays.filter(
                  (d) => d.date >= "2025-01-01" && d.date <= "2025-01-15",
                ),
              },
              {
                label: "January 2025 (16–31)",
                days: allDays.filter(
                  (d) => d.date >= "2025-01-16" && d.date <= "2025-01-31",
                ),
              },
              {
                label: "February 2025 (1–15)",
                days: allDays.filter(
                  (d) => d.date >= "2025-02-01" && d.date <= "2025-02-15",
                ),
              },
              {
                label: "February 2025 (16–28)",
                days: allDays.filter(
                  (d) => d.date >= "2025-02-16" && d.date <= "2025-02-28",
                ),
              },
              {
                label: "March 2025 (1–15)",
                days: allDays.filter(
                  (d) => d.date >= "2025-03-01" && d.date <= "2025-03-15",
                ),
              },
              {
                label: "March 2025 (16–31)",
                days: allDays.filter(
                  (d) => d.date >= "2025-03-16" && d.date <= "2025-03-31",
                ),
              },
              {
                label: "April 2025 (1–15)",
                days: allDays.filter(
                  (d) => d.date >= "2025-04-01" && d.date <= "2025-04-15",
                ),
              },
              {
                label: "April 2025 (16–30)",
                days: allDays.filter(
                  (d) => d.date >= "2025-04-16" && d.date <= "2025-04-30",
                ),
              },
              {
                label: "May 2025 (1–15)",
                days: allDays.filter(
                  (d) => d.date >= "2025-05-01" && d.date <= "2025-05-15",
                ),
              },
              {
                label: "May 2025 (16–31)",
                days: allDays.filter(
                  (d) => d.date >= "2025-05-16" && d.date <= "2025-05-31",
                ),
              },
              {
                label: "June 2025 (1–15)",
                days: allDays.filter(
                  (d) => d.date >= "2025-06-01" && d.date <= "2025-06-15",
                ),
              },
              {
                label: "June 2025 (16–30)",
                days: allDays.filter(
                  (d) => d.date >= "2025-06-16" && d.date <= "2025-06-30",
                ),
              },
              {
                label: "July 2025 (1–15)",
                days: allDays.filter(
                  (d) => d.date >= "2025-07-01" && d.date <= "2025-07-15",
                ),
              },
            ].filter((g) => g.days.length > 0);
            return GROUPS.map(({ label, days }) => (
              <div key={label} className="mb-6">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  {label}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {days.map((day) => {
                    const score = scores[day.date];
                    const completed = score !== null && score !== undefined;
                    return (
                      <motion.button
                        key={day.date}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => startQuiz(day)}
                        data-ocid="ca_quiz.day_selector.button"
                        className={`relative flex flex-col items-center justify-center gap-1.5 p-4 rounded-xl border transition-all text-left ${
                          completed
                            ? "bg-slate-800 border-blue-600/50"
                            : "bg-card border-border hover:border-primary/50"
                        }`}
                      >
                        {completed && (
                          <span className="absolute top-2 right-2">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground font-medium">
                          Jan 2025
                        </span>
                        <span className="text-xl font-bold text-foreground">
                          {new Date(`${day.date}T00:00:00`).getDate()}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          10 Qs
                        </span>
                        {completed && (
                          <Badge className="text-[10px] px-1.5 py-0 bg-blue-700 text-white border-0">
                            {score}/10
                          </Badge>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            ));
          })()}
        </div>
      </div>
    );
  }

  if (screen === "quiz" && selectedDay && questions.length > 0) {
    const q = questions[currentQ];
    const progress = (currentQ / questions.length) * 100;

    return (
      <div className="min-h-screen bg-background pb-20 sm:pb-8">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-muted-foreground">
                {getDayLabel(selectedDay.date)}
              </p>
              <p className="text-sm font-semibold text-foreground">
                Question {currentQ + 1} / {questions.length}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExit}
              data-ocid="ca_quiz.close_button"
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4 mr-1" /> Exit
            </Button>
          </div>

          <Progress value={progress} className="h-1.5 mb-6 bg-slate-700" />

          <AnimatePresence mode="wait">
            <motion.div
              key={currentQ}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.2 }}
            >
              <p className="text-xs text-blue-400 mb-3 font-medium uppercase tracking-wide truncate">
                {q.newsTitle}
              </p>

              <div className="bg-card rounded-xl border border-border p-5 mb-5">
                <p className="text-foreground text-base font-medium leading-relaxed">
                  {q.question}
                </p>
              </div>

              <div className="flex flex-col gap-3 mb-6">
                {q.options.map((opt, idx) => (
                  <button
                    key={opt.slice(0, 20)}
                    type="button"
                    onClick={() => setSelectedOption(idx)}
                    data-ocid="ca_quiz.option.button"
                    className={`w-full text-left px-4 py-3.5 rounded-xl border transition-all text-sm ${
                      selectedOption === idx
                        ? "border-blue-500 bg-blue-900/40 text-foreground font-medium"
                        : "border-border bg-card text-muted-foreground hover:border-blue-500/40 hover:text-foreground"
                    }`}
                  >
                    <span className="font-semibold mr-2 text-blue-400">
                      {String.fromCharCode(65 + idx)}.
                    </span>
                    {opt}
                  </button>
                ))}
              </div>

              <Button
                onClick={handleNext}
                disabled={selectedOption === null}
                data-ocid="ca_quiz.next_button"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-5 rounded-xl disabled:opacity-40"
              >
                {currentQ < questions.length - 1 ? (
                  <>
                    <ChevronRight className="w-4 h-4 mr-1" /> Next Question
                  </>
                ) : (
                  <>
                    <Trophy className="w-4 h-4 mr-1" /> Submit &amp; See Results
                  </>
                )}
              </Button>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    );
  }

  if (screen === "results" && selectedDay && questions.length > 0) {
    const score = answers.filter(
      (a, i) => a === questions[i].correctIndex,
    ).length;
    const total = questions.length;
    const accuracy = Math.round((score / total) * 100);

    return (
      <div className="min-h-screen bg-background pb-20 sm:pb-8">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-2xl p-6 mb-6 text-center"
            data-ocid="ca_quiz.success_state"
          >
            <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
            <p className="text-4xl font-bold text-foreground mb-1">
              {score}
              <span className="text-xl text-muted-foreground">/{total}</span>
            </p>
            <p className="text-muted-foreground text-sm mb-4">
              {getDayLabel(selectedDay.date)}
            </p>
            <div className="flex justify-center gap-6">
              <div>
                <p className="text-2xl font-bold text-green-400">{accuracy}%</p>
                <p className="text-xs text-muted-foreground">Accuracy</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-400">{score}</p>
                <p className="text-xs text-muted-foreground">Correct</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-400">
                  {total - score}
                </p>
                <p className="text-xs text-muted-foreground">Wrong</p>
              </div>
            </div>
          </motion.div>

          <div className="flex gap-3 mb-6">
            <Button
              variant="outline"
              onClick={handleExit}
              data-ocid="ca_quiz.cancel_button"
              className="flex-1 border-border"
            >
              Back to Days
            </Button>
            <Button
              onClick={handleTryAgain}
              data-ocid="ca_quiz.primary_button"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Try Again
            </Button>
          </div>

          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Answer Review
          </h2>
          <div className="flex flex-col gap-3">
            {questions.map((q, idx) => {
              const userAnswer = answers[idx];
              const isCorrect = userAnswer === q.correctIndex;
              return (
                <motion.div
                  key={q.question.slice(0, 30)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className={`bg-card rounded-xl border p-4 ${
                    isCorrect ? "border-green-600/40" : "border-red-600/40"
                  }`}
                  data-ocid={`ca_quiz.item.${idx + 1}`}
                >
                  <div className="flex items-start gap-2 mb-2">
                    {isCorrect ? (
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                    )}
                    <p className="text-sm text-foreground font-medium">
                      {q.question}
                    </p>
                  </div>
                  <div className="ml-6 space-y-1">
                    {q.options.map((opt, oi) => (
                      <p
                        key={opt.slice(0, 20)}
                        className={`text-xs px-2 py-1 rounded ${
                          oi === q.correctIndex
                            ? "bg-green-900/40 text-green-300 font-medium"
                            : oi === userAnswer && !isCorrect
                              ? "bg-red-900/40 text-red-300"
                              : "text-muted-foreground"
                        }`}
                      >
                        <span className="font-semibold mr-1">
                          {String.fromCharCode(65 + oi)}.
                        </span>
                        {opt}
                      </p>
                    ))}
                  </div>
                  <p className="ml-6 mt-2 text-xs text-blue-300 italic">
                    {q.explanation}
                  </p>
                </motion.div>
              );
            })}
          </div>
          {onNavigateHome && (
            <div className="flex justify-center mt-8">
              <button
                type="button"
                onClick={onNavigateHome}
                data-ocid="ca_quiz.primary_button"
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

  return null;
}
