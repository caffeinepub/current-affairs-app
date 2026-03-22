import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";

import {
  BookOpen,
  Calendar,
  ChevronRight,
  ClipboardList,
  Flame,
  Home,
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
      className="fixed bottom-0 left-0 right-0 z-40 sm:hidden flex items-stretch bg-card border-t border-border shadow-lg"
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
            style={{
              color: isActive ? "oklch(0.55 0.14 185)" : undefined,
            }}
            data-ocid={`bottom_nav.${item.id}.tab`}
          >
            <item.Icon
              className={`w-5 h-5 ${isActive ? "" : "text-muted-foreground"}`}
            />
            <span
              className={`text-[10px] font-medium ${
                isActive ? "" : "text-muted-foreground"
              }`}
            >
              {item.label}
            </span>
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
      {/* NAV */}
      <header
        className="sticky top-0 z-30 shadow-nav"
        style={{
          background:
            "linear-gradient(to right, oklch(0.22 0.04 245), oklch(0.28 0.07 195))",
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          {/* Hamburger — mobile only */}
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                className="sm:hidden p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Open menu"
                data-ocid="nav.hamburger.button"
              >
                <Menu className="w-5 h-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div
                className="flex items-center gap-2 px-5 py-4 border-b border-border"
                style={{
                  background:
                    "linear-gradient(to right, oklch(0.22 0.04 245), oklch(0.28 0.07 195))",
                }}
              >
                <BookOpen className="w-5 h-5 text-white" />
                <span className="font-bold text-white text-base tracking-tight">
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
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
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
            <BookOpen className="w-5 h-5 text-teal" />
            <span className="font-bold text-white text-base tracking-tight">
              Current Affairs
            </span>
          </div>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-6">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActivePage(item.page)}
                className={`text-sm cursor-pointer transition-colors bg-transparent border-0 ${
                  activePage === item.page
                    ? "text-white font-semibold border-b-2 border-teal pb-0.5"
                    : "text-white/70 hover:text-white"
                }`}
                data-ocid={`nav.${item.id}.link`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* MAIN */}
      <main className="flex-1 pb-16 sm:pb-0">{children}</main>

      {/* FOOTER — hide on mobile so it doesn't overlap bottom nav */}
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
      <div className="bg-card rounded-lg border border-border shadow-xs mb-6">
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
              <span className="flex items-center gap-1 text-sm font-bold text-orange-500 mt-0.5">
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
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Stay updated with today's current affairs.
            </p>
          </div>

          {/* TODAY'S HEADLINES */}
          <div className="bg-card rounded-lg shadow-card border border-border overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center gap-2">
              <Newspaper className="w-4 h-4 text-teal" />
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
                    className="px-5 py-4 hover:bg-muted/40 transition-colors"
                    data-ocid={`news.item.${idx + 1}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${getCategoryColor(item.category)}`}
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
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/40 transition-colors group"
                  data-ocid="quiz.primary_button"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: "oklch(0.72 0.14 185 / 0.15)" }}
                    >
                      <BookOpen className="w-4 h-4 text-teal" />
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
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/40 transition-colors group"
                  data-ocid="monthly_ca.secondary_button"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: "oklch(0.72 0.14 185 / 0.15)" }}
                    >
                      <Calendar className="w-4 h-4 text-teal" />
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
            className="rounded-lg overflow-hidden shadow-card border border-border"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.22 0.04 245), oklch(0.28 0.07 195))",
            }}
            data-ocid="progress.card"
          >
            <div className="px-5 py-5">
              <p className="text-xs uppercase tracking-widest text-white/60 font-medium mb-4">
                Your Progress
              </p>
              <div className="mb-5">
                {progressLoading ? (
                  <Skeleton className="h-8 w-28 bg-white/10" />
                ) : (
                  <span className="text-3xl font-bold text-white">
                    {completedDays}
                    <span className="text-lg font-normal text-white/60">
                      {" "}
                      / {totalDays}
                    </span>
                  </span>
                )}
                <p className="text-xs text-white/60 mt-0.5">Days Completed</p>
              </div>
              <div className="mb-2">
                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPct}%` }}
                    transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ background: "oklch(0.72 0.14 185)" }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[11px] text-white/50">0 days</span>
                  <span
                    className="text-[11px] font-semibold"
                    style={{ color: "oklch(0.72 0.14 185)" }}
                  >
                    {progressPct}%
                  </span>
                  <span className="text-[11px] text-white/50">
                    {totalDays} days
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.4 }}
            className="bg-card rounded-lg shadow-card border border-border px-5 py-4 flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-orange-50">
              <Flame className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">
                Current Streak
              </p>
              {progressLoading ? (
                <Skeleton className="h-6 w-16 mt-0.5" />
              ) : (
                <p className="text-xl font-bold text-foreground">
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

function LoginScreen() {
  const { login, isLoading: authLoading } = useAuth();
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div
          className="rounded-2xl p-8 shadow-xl border border-border bg-card flex flex-col items-center gap-6"
          data-ocid="login.card"
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.22 0.04 245), oklch(0.28 0.07 195))",
            }}
          >
            <BookOpen className="w-7 h-7 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              Current Affairs
            </h1>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              Track current affairs, take mock tests, and improve your score.
            </p>
          </div>
          <button
            type="button"
            onClick={login}
            disabled={authLoading}
            className="w-full py-3 px-6 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60 hover:opacity-90 active:scale-[0.98]"
            style={{
              background:
                "linear-gradient(to right, oklch(0.22 0.04 245), oklch(0.28 0.07 195))",
            }}
            data-ocid="login.primary_button"
          >
            {authLoading ? "Signing in…" : "Sign In with Internet Identity"}
          </button>
          <p className="text-xs text-muted-foreground text-center">
            Your identity is stored securely. No passwords needed.
          </p>
        </div>
      </div>
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
          className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{
            borderColor: "oklch(0.72 0.14 185)",
            borderTopColor: "transparent",
          }}
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
        {/* Bottom nav still visible on mock test page per user requirement */}
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
      {activePage === "profile" && <Profile />}
      <MobileBottomNav activePage={activePage} setActivePage={setActivePage} />
    </AppShell>
  );
}

export default function App() {
  return <AppContent />;
}
