import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";

import {
  BookOpen,
  Brain,
  Calendar,
  ChevronRight,
  ClipboardList,
  Flame,
  Home,
  Loader2,
  Menu,
  Newspaper,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  useMarkDayCompleted,
  useNewsItems,
  usePrepopulate,
  useUserProgress,
} from "./hooks/useQueries";
import { useAuth } from "./lib/auth";
import { formatBigIntDate, getCategoryColor } from "./lib/utils-ca";
import { CAQuiz } from "./pages/CAQuiz";
import { DailyCurrentAffairs } from "./pages/DailyCurrentAffairs";
import { MockTest } from "./pages/MockTest";
import { MonthlyCurrentAffairs } from "./pages/MonthlyCurrentAffairs";
import { Performance } from "./pages/Performance";
import { Profile } from "./pages/Profile";

type Page =
  | "dashboard"
  | "daily-ca"
  | "monthly-ca"
  | "mock-test"
  | "ca-quiz"
  | "performance"
  | "profile";

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const NAV_ITEMS: { label: string; page: Page; id: string }[] = [
  { label: "Dashboard", page: "dashboard", id: "dashboard" },
  { label: "Daily CA", page: "daily-ca", id: "daily_ca" },
  { label: "Monthly CA", page: "monthly-ca", id: "monthly_ca" },
  { label: "Mock Test", page: "mock-test", id: "mock_test" },
  { label: "Performance", page: "performance", id: "performance" },
  { label: "CA Quiz", page: "ca-quiz", id: "ca_quiz" },
  { label: "Profile", page: "profile", id: "profile" },
];

const BOTTOM_NAV_ITEMS: {
  label: string;
  page: Page;
  id: string;
  Icon: React.ElementType;
}[] = [
  { label: "Home", page: "dashboard", id: "dashboard", Icon: Home },
  { label: "Daily CA", page: "daily-ca", id: "daily_ca", Icon: Newspaper },
  { label: "Tests", page: "mock-test", id: "mock_test", Icon: ClipboardList },
  { label: "CA Quiz", page: "ca-quiz", id: "ca_quiz", Icon: Brain },
  { label: "Profile", page: "profile", id: "profile", Icon: User },
];

function MobileBottomNav({
  activePage,
  setActivePage,
}: {
  activePage: Page;
  setActivePage: (p: Page) => void;
}) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 sm:hidden flex items-stretch bg-card border-t border-border shadow-nav"
      style={{ height: "58px" }}
      data-ocid="bottom_nav.panel"
    >
      {BOTTOM_NAV_ITEMS.map((item) => {
        const isActive = activePage === item.page;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => setActivePage(item.page)}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors"
            data-ocid={`bottom_nav.${item.id}.tab`}
          >
            <item.Icon
              className={`w-5 h-5 transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            />
            <span
              className={`text-[10px] font-medium transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {item.label}
            </span>
            {isActive && (
              <span className="absolute bottom-0 w-8 h-0.5 rounded-full bg-primary" />
            )}
          </button>
        );
      })}
    </nav>
  );
}

function AppShell({
  children,
  activePage,
  setActivePage,
}: {
  children: React.ReactNode;
  activePage: Page;
  setActivePage: (p: Page) => void;
}) {
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* HEADER */}
      <header className="sticky top-0 z-30 bg-card border-b border-border shadow-nav">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          {/* Hamburger — mobile only */}
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                className="sm:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                aria-label="Open menu"
                data-ocid="nav.hamburger.button"
              >
                <Menu className="w-5 h-5" />
              </button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-64 p-0 bg-card border-border"
            >
              <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
                <BookOpen className="w-5 h-5 text-primary" />
                <span className="font-display font-bold text-foreground text-base tracking-tight">
                  Current Affairs
                </span>
              </div>
              <nav className="flex flex-col py-2">
                {NAV_ITEMS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActivePage(item.page);
                      setSheetOpen(false);
                    }}
                    className={`flex items-center gap-3 px-5 py-3 text-sm font-medium transition-colors text-left ${
                      activePage === item.page
                        ? "bg-primary/10 text-primary border-l-2 border-primary"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                    data-ocid={`sheet_nav.${item.id}.link`}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <span className="font-display font-bold text-foreground text-base tracking-tight">
              Current Affairs
            </span>
          </div>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActivePage(item.page)}
                className={`relative text-sm px-3 py-1.5 rounded-md cursor-pointer transition-colors bg-transparent border-0 font-medium ${
                  activePage === item.page
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
                data-ocid={`nav.${item.id}.link`}
              >
                {item.label}
                {activePage === item.page && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-primary" />
                )}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* MAIN */}
      <main className="flex-1 pb-16 sm:pb-0">{children}</main>

      {/* FOOTER */}
      <footer className="border-t border-border bg-card mt-auto hidden sm:block">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Current Affairs App. All rights
            reserved.
          </span>
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Built with ❤️ using caffeine.ai
          </a>
        </div>
      </footer>

      <Toaster />
    </div>
  );
}

function Dashboard() {
  const { data: progress, isLoading: progressLoading } = useUserProgress();
  const { data: newsItems, isLoading: newsLoading } = useNewsItems();
  const prepopulate = usePrepopulate();
  const markDay = useMarkDayCompleted();

  // biome-ignore lint/correctness/useExhaustiveDependencies: run once on mount
  useEffect(() => {
    prepopulate.mutate();
  }, []);

  const today = new Date();
  const totalDays = Number(progress?.totalDaysInProgram ?? 30n);
  const completedDays = Number(progress?.totalDaysCompleted ?? 0n);
  const streak = Number(progress?.currentStreak ?? 0n);
  const progressPct =
    totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;

  function handleStartQuiz() {
    markDay.mutate(undefined, {
      onSuccess: () => toast.success("Day marked as completed! Quiz started."),
      onError: () => toast.error("Couldn't start quiz. Try again."),
    });
  }

  return (
    <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-6">
      {/* SUMMARY STRIP */}
      <div className="bg-card rounded-lg border border-border shadow-card mb-6">
        <div className="px-4 sm:px-6 py-3">
          <div className="grid grid-cols-3 divide-x divide-border">
            <div className="px-4 first:pl-0 flex flex-col items-center sm:items-start">
              <span className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium">
                Today
              </span>
              <span className="text-sm font-semibold text-foreground mt-0.5 text-center sm:text-left">
                {formatDate(today)}
              </span>
            </div>
            <div className="px-4 flex flex-col items-center">
              <span className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium">
                Streak
              </span>
              <span className="flex items-center gap-1 text-sm font-bold text-warning mt-0.5">
                <Flame className="w-4 h-4" />
                {progressLoading ? (
                  <Skeleton className="h-4 w-6" />
                ) : (
                  `${streak} days`
                )}
              </span>
            </div>
            <div className="px-4 last:pr-0 flex flex-col items-center sm:items-end">
              <span className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium">
                Completed
              </span>
              {progressLoading ? (
                <Skeleton className="h-4 w-12 mt-0.5" />
              ) : (
                <span className="text-sm font-bold text-foreground mt-0.5">
                  {completedDays} days
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5"
      >
        {/* LEFT COLUMN */}
        <div className="flex flex-col gap-5">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              Dashboard
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Stay updated with today's current affairs.
            </p>
          </div>

          {/* TODAY'S HEADLINES */}
          <div className="bg-card rounded-lg shadow-card border border-border overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center gap-2">
              <Newspaper className="w-4 h-4 text-primary" />
              <h2 className="font-semibold text-foreground text-sm">
                Today's Headlines
              </h2>
              <span className="ml-auto text-xs text-muted-foreground">
                {formatDate(today).split(",")[0]}
              </span>
            </div>

            {newsLoading ? (
              <div
                className="divide-y divide-border"
                data-ocid="news.loading_state"
              >
                {["a", "b", "c", "d"].map((k) => (
                  <div key={k} className="px-5 py-4 flex flex-col gap-2">
                    <div className="flex gap-2">
                      <Skeleton className="h-5 w-16 rounded-full" />
                      <Skeleton className="h-5 w-32" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ))}
              </div>
            ) : !newsItems || newsItems.length === 0 ? (
              <div
                className="px-5 py-10 text-center"
                data-ocid="news.empty_state"
              >
                <p className="text-muted-foreground text-sm">
                  No news items found for today.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-border" data-ocid="news.list">
                {newsItems.map((item, idx) => (
                  <motion.li
                    key={String(item.id)}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.07, duration: 0.3 }}
                    className="px-5 py-4 hover:bg-secondary/60 transition-colors"
                    data-ocid={`news.item.${idx + 1}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${getCategoryColor(item.category)}`}
                      >
                        {item.category}
                      </span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {item.source} · {formatBigIntDate(item.date)}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-foreground leading-snug">
                      {item.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  </motion.li>
                ))}
              </ul>
            )}
          </div>

          {/* QUICK ACTIONS */}
          <div className="bg-card rounded-lg shadow-card border border-border overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="font-semibold text-foreground text-sm">
                Quick Actions
              </h2>
            </div>
            <ul className="divide-y divide-border">
              <li>
                <button
                  type="button"
                  onClick={handleStartQuiz}
                  disabled={markDay.isPending}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-secondary/60 transition-colors group"
                  data-ocid="quiz.primary_button"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary/10">
                      <BookOpen className="w-4 h-4 text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-foreground">
                        Start Daily Quiz
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Test your knowledge of today's news
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-secondary/60 transition-colors group"
                  data-ocid="monthly_ca.secondary_button"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-accent/10">
                      <Calendar className="w-4 h-4 text-accent" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-foreground">
                        View Monthly CA
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Review past month's current affairs
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="flex flex-col gap-5">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="rounded-lg overflow-hidden shadow-card border border-primary/20 bg-card"
            data-ocid="progress.card"
          >
            <div className="px-5 py-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
                  Your Progress
                </span>
                <span className="ml-auto text-xs font-semibold text-primary">
                  {progressPct}%
                </span>
              </div>
              <div className="mb-4">
                {progressLoading ? (
                  <Skeleton className="h-8 w-28" />
                ) : (
                  <span className="text-3xl font-display font-bold text-foreground">
                    {completedDays}
                    <span className="text-lg font-normal text-muted-foreground">
                      {" "}
                      / {totalDays}
                    </span>
                  </span>
                )}
                <p className="text-xs text-muted-foreground mt-0.5">
                  Days Completed
                </p>
              </div>
              <Progress value={progressPct} className="h-2" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.4 }}
            className="bg-card rounded-lg shadow-card border border-border px-5 py-4 flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-warning/10">
              <Flame className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">
                Current Streak
              </p>
              {progressLoading ? (
                <Skeleton className="h-6 w-16 mt-0.5" />
              ) : (
                <p className="text-xl font-display font-bold text-foreground">
                  {streak}{" "}
                  <span className="text-sm font-normal text-muted-foreground">
                    days
                  </span>
                </p>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

// Google SVG icon
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function LoginScreen() {
  const { loginWithEmail, signupWithEmail, loginWithGoogle } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  function getErrorMessage(code: string): string {
    switch (code) {
      case "auth/user-not-found":
      case "auth/wrong-password":
      case "auth/invalid-credential":
        return "Invalid email or password. Please try again.";
      case "auth/email-already-in-use":
        return "An account with this email already exists. Please sign in.";
      case "auth/weak-password":
        return "Password must be at least 6 characters.";
      case "auth/invalid-email":
        return "Please enter a valid email address.";
      case "auth/popup-closed-by-user":
        return "Google sign-in was cancelled.";
      case "auth/network-request-failed":
        return "Network error. Please check your connection.";
      default:
        return "Something went wrong. Please try again.";
    }
  }

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    try {
      if (mode === "signin") {
        await loginWithEmail(email, password);
      } else {
        await signupWithEmail(email, password);
      }
    } catch (err: any) {
      setError(getErrorMessage(err?.code ?? ""));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError("");
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setError(getErrorMessage(err?.code ?? ""));
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-sm"
      >
        <div
          className="rounded-2xl p-8 shadow-xl border border-border bg-card flex flex-col gap-6"
          data-ocid="login.card"
        >
          {/* Logo + title */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-primary/10 border border-primary/20">
              <BookOpen className="w-7 h-7 text-primary" />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">
                Current Affairs
              </h1>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                TS LAWCET Preparation Portal
              </p>
            </div>
          </div>

          {/* Mode toggle */}
          <div
            className="flex rounded-xl overflow-hidden border border-border"
            data-ocid="login.toggle"
          >
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setError("");
              }}
              className={`flex-1 py-2 text-sm font-semibold transition-colors ${
                mode === "signin"
                  ? "bg-primary text-primary-foreground"
                  : "bg-transparent text-muted-foreground hover:text-foreground"
              }`}
              data-ocid="login.tab"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setError("");
              }}
              className={`flex-1 py-2 text-sm font-semibold transition-colors ${
                mode === "signup"
                  ? "bg-primary text-primary-foreground"
                  : "bg-transparent text-muted-foreground hover:text-foreground"
              }`}
              data-ocid="login.tab"
            >
              Sign Up
            </button>
          </div>

          {/* Email/Password form */}
          <form onSubmit={handleEmailAuth} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="auth-email"
                className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
              >
                Email
              </label>
              <input
                id="auth-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full px-3 py-2.5 rounded-lg text-sm bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                data-ocid="login.input"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="auth-password"
                className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
              >
                Password
              </label>
              <input
                id="auth-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete={
                  mode === "signup" ? "new-password" : "current-password"
                }
                className="w-full px-3 py-2.5 rounded-lg text-sm bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                data-ocid="login.input"
              />
            </div>

            {/* Error message */}
            {error && (
              <p
                className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2"
                data-ocid="login.error_state"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-6 rounded-xl text-sm font-semibold text-primary-foreground bg-primary transition-all disabled:opacity-60 hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2 mt-1"
              data-ocid="login.submit_button"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading
                ? mode === "signin"
                  ? "Signing in…"
                  : "Creating account…"
                : mode === "signin"
                  ? "Sign In"
                  : "Create Account"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Google Sign In */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={googleLoading}
            className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold border border-border bg-background text-foreground hover:bg-secondary transition-all disabled:opacity-60 active:scale-[0.98] flex items-center justify-center gap-2.5"
            data-ocid="login.primary_button"
          >
            {googleLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <GoogleIcon className="w-4 h-4" />
            )}
            Continue with Google
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const [activePage, setActivePage] = useState<Page>("dashboard");

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div
          className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"
          data-ocid="app.loading_state"
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  if (activePage === "mock-test") {
    return (
      <div className="relative min-h-screen">
        <MockTest />
        <MobileBottomNav
          activePage={activePage}
          setActivePage={setActivePage}
        />
      </div>
    );
  }

  return (
    <AppShell activePage={activePage} setActivePage={setActivePage}>
      {activePage === "dashboard" && <Dashboard />}
      {activePage === "daily-ca" && <DailyCurrentAffairs />}
      {activePage === "monthly-ca" && <MonthlyCurrentAffairs />}
      {activePage === "performance" && <Performance />}
      {activePage === "ca-quiz" && <CAQuiz />}
      {activePage === "profile" && <Profile />}
      <MobileBottomNav activePage={activePage} setActivePage={setActivePage} />
    </AppShell>
  );
}

export default function App() {
  return <AppContent />;
}
