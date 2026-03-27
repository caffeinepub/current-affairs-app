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
  LogOut,
  Menu,
  Newspaper,
  User,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  useMarkDayCompleted,
  useMyProfile,
  useNewsItems,
  usePrepopulate,
  useSaveProfile,
  useUserProgress,
} from "./hooks/useQueries";
import { getFirebaseErrorMessage, useAuth } from "./lib/auth";
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

const BOTTOM_NAV_ITEMS: {
  label: string;
  page: Page;
  id: string;
  Icon: React.ElementType;
}[] = [
  { label: "Home", page: "dashboard", id: "dashboard", Icon: Home },
  { label: "Daily CA", page: "daily-ca", id: "daily_ca", Icon: Newspaper },
  { label: "Monthly CA", page: "monthly-ca", id: "monthly_ca", Icon: Calendar },
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

const CA_PAGES: Page[] = ["daily-ca", "monthly-ca", "ca-quiz"];

function SidebarNav({
  activePage,
  setActivePage,
  onNav,
}: {
  activePage: Page;
  setActivePage: (p: Page) => void;
  onNav?: () => void;
}) {
  const isCaActive = CA_PAGES.includes(activePage);

  function nav(page: Page) {
    setActivePage(page);
    onNav?.();
  }

  const caSubItems: { label: string; page: Page; id: string }[] = [
    { label: "Daily CA", page: "daily-ca", id: "daily_ca" },
    { label: "Monthly CA", page: "monthly-ca", id: "monthly_ca" },
    { label: "CA MCQs", page: "ca-quiz", id: "ca_quiz" },
  ];

  const comingSoon = ["Syllabus", "Flashcards"];

  return (
    <div className="flex flex-col h-full py-3 gap-0.5">
      <button
        type="button"
        onClick={() => nav("dashboard")}
        className={`flex items-center gap-2.5 px-4 py-2.5 mx-2 rounded-lg text-sm font-medium transition-colors text-left ${
          activePage === "dashboard"
            ? "bg-primary/10 text-primary border-l-2 border-primary"
            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
        }`}
        data-ocid="sidebar.dashboard.link"
      >
        <Home className="w-4 h-4 flex-shrink-0" />
        Dashboard
      </button>

      <div
        className={`mx-2 mt-1 rounded-lg overflow-hidden ${isCaActive ? "border border-primary/20 bg-primary/5" : ""}`}
      >
        <div
          className={`flex items-center gap-2.5 px-4 py-2 text-xs font-semibold uppercase tracking-wider ${isCaActive ? "text-primary" : "text-muted-foreground"}`}
        >
          <Newspaper className="w-3.5 h-3.5 flex-shrink-0" />
          Current Affairs
        </div>
        <div className="flex flex-col gap-0.5 pb-1.5">
          {caSubItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => nav(item.page)}
              className={`flex items-center gap-2 pl-8 pr-4 py-2 text-sm font-medium transition-colors text-left rounded-lg mx-1 ${
                activePage === item.page
                  ? "bg-primary/15 text-primary border-l-2 border-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
              data-ocid={`sidebar.${item.id}.link`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => nav("mock-test")}
        className={`flex items-center gap-2.5 px-4 py-2.5 mx-2 rounded-lg text-sm font-medium transition-colors text-left ${
          activePage === "mock-test"
            ? "bg-primary/10 text-primary border-l-2 border-primary"
            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
        }`}
        data-ocid="sidebar.mock_test.link"
      >
        <ClipboardList className="w-4 h-4 flex-shrink-0" />
        Mock Tests
      </button>

      <button
        type="button"
        onClick={() => nav("performance")}
        className={`flex items-center gap-2.5 px-4 py-2.5 mx-2 rounded-lg text-sm font-medium transition-colors text-left ${
          activePage === "performance"
            ? "bg-primary/10 text-primary border-l-2 border-primary"
            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
        }`}
        data-ocid="sidebar.performance.link"
      >
        <Brain className="w-4 h-4 flex-shrink-0" />
        Performance
      </button>

      <div className="mx-4 my-2 border-t border-border" />

      {comingSoon.map((label) => (
        <div
          key={label}
          className="flex items-center gap-2.5 px-4 py-2.5 mx-2 rounded-lg text-sm font-medium text-muted-foreground/40 cursor-not-allowed select-none"
        >
          <span className="w-4 h-4 flex-shrink-0" />
          {label}
          <span className="ml-auto text-[9px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded font-semibold uppercase tracking-wide">
            Soon
          </span>
        </div>
      ))}

      <div className="mx-4 my-2 border-t border-border" />

      <button
        type="button"
        onClick={() => nav("profile")}
        className={`flex items-center gap-2.5 px-4 py-2.5 mx-2 rounded-lg text-sm font-medium transition-colors text-left ${
          activePage === "profile"
            ? "bg-primary/10 text-primary border-l-2 border-primary"
            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
        }`}
        data-ocid="sidebar.profile.link"
      >
        <User className="w-4 h-4 flex-shrink-0" />
        Profile
      </button>
    </div>
  );
}

function getInitials(
  displayName?: string | null,
  email?: string | null,
): string {
  if (displayName) {
    const parts = displayName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  }
  if (email) {
    return email[0].toUpperCase();
  }
  return "U";
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
  const { user, logout } = useAuth();

  const initials = getInitials(user?.displayName, user?.email);
  const displayName = user?.displayName || user?.email?.split("@")[0] || "";
  const email = user?.email || "";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-30 bg-card border-b border-border shadow-nav">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
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
              <SidebarNav
                activePage={activePage}
                setActivePage={setActivePage}
                onNav={() => setSheetOpen(false)}
              />
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <span className="font-display font-bold text-foreground text-base tracking-tight">
              Current Affairs
            </span>
          </div>

          {/* Header right: user info + logout */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Avatar circle */}
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
              style={{ background: "oklch(0.55 0.16 185)" }}
              aria-label={displayName}
            >
              {initials}
            </div>

            {/* Name + email — desktop only */}
            <div className="hidden md:flex flex-col leading-tight max-w-[180px]">
              <span className="text-sm font-semibold text-foreground truncate">
                {displayName}
              </span>
              <span className="text-xs text-muted-foreground truncate">
                {email}
              </span>
            </div>

            {/* Logout button */}
            <button
              type="button"
              onClick={() => logout()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors border border-border"
              data-ocid="nav.logout.button"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="hidden md:flex flex-col w-56 border-r border-border bg-card fixed top-14 bottom-0 overflow-y-auto z-20">
          <SidebarNav activePage={activePage} setActivePage={setActivePage} />
        </aside>
        <main className="flex-1 md:pl-56 pb-16 md:pb-0">{children}</main>
      </div>

      <footer className="border-t border-border bg-card hidden md:block">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Current Affairs App. All rights
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

// Profile setup modal — shown after first login until name is saved
function ProfileSetupModal({ onDone }: { onDone: () => void }) {
  const { user } = useAuth();
  const saveProfile = useSaveProfile();
  const [name, setName] = useState(user?.displayName ?? "");
  const [examGoal, setExamGoal] = useState(
    () => localStorage.getItem("examGoal") ?? "TS LAWCET 2026",
  );
  const [error, setError] = useState("");

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    localStorage.setItem("examGoal", examGoal.trim());
    saveProfile.mutate(
      { name: name.trim(), email: user?.email ?? "" },
      {
        onSuccess: () => {
          localStorage.setItem("userName", name.trim());
          toast.success(`Welcome, ${name.trim()}! Profile saved.`);
          onDone();
        },
        onError: () => setError("Failed to save profile. Please try again."),
      },
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm p-4"
      data-ocid="profile_setup.modal"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="w-full max-w-sm"
      >
        <div className="bg-card rounded-2xl border border-border shadow-xl p-8 flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-primary/10 border border-primary/20">
              <BookOpen className="w-7 h-7 text-primary" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-display font-bold text-foreground">
                Complete Your Profile
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Set up your profile to personalize your experience
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="setup-name"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Your Name <span className="text-destructive">*</span>
              </label>
              <input
                id="setup-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full px-3 py-2.5 rounded-lg text-sm bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                data-ocid="profile_setup.input"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="setup-goal"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Exam Goal
              </label>
              <input
                id="setup-goal"
                type="text"
                value={examGoal}
                onChange={(e) => setExamGoal(e.target.value)}
                placeholder="e.g. TS LAWCET 2026"
                className="w-full px-3 py-2.5 rounded-lg text-sm bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                data-ocid="profile_setup.input"
              />
            </div>

            {error && (
              <p
                className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2"
                data-ocid="profile_setup.error_state"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={saveProfile.isPending}
              className="w-full py-2.5 px-6 rounded-xl text-sm font-semibold text-primary-foreground bg-primary hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2 mt-1"
              data-ocid="profile_setup.submit_button"
            >
              {saveProfile.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving…
                </>
              ) : (
                "Save & Continue"
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

function ExamCountdown() {
  const examDate = new Date("2026-05-18");
  const now = new Date();
  const daysLeft = Math.max(
    0,
    Math.ceil((examDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
  );

  return (
    <div
      className="flex flex-col items-center justify-center rounded-xl px-5 py-4 min-w-[120px] bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30"
      data-ocid="dashboard.countdown_card"
    >
      <span className="text-4xl font-display font-bold text-primary leading-none">
        {daysLeft}
      </span>
      <span className="text-[11px] text-muted-foreground uppercase tracking-widest mt-1 text-center">
        Days to TS LAWCET
      </span>
      <span className="text-[10px] text-muted-foreground/70 mt-0.5">
        18 May 2026
      </span>
    </div>
  );
}

function Dashboard() {
  const { data: progress, isLoading: progressLoading } = useUserProgress();
  const { data: newsItems, isLoading: newsLoading } = useNewsItems();
  const { data: profile } = useMyProfile();
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

  const displayName = profile?.name || localStorage.getItem("userName") || "";

  function handleStartQuiz() {
    markDay.mutate(undefined, {
      onSuccess: () => toast.success("Day marked as completed! Quiz started."),
      onError: () => toast.error("Couldn't start quiz. Try again."),
    });
  }

  return (
    <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-6">
      {/* WELCOME + COUNTDOWN BANNER */}
      <div
        className="bg-card rounded-lg border border-border shadow-card mb-6 px-5 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4"
        data-ocid="dashboard.welcome_card"
      >
        <div className="flex-1">
          <h2 className="text-2xl font-display font-bold text-foreground leading-tight">
            {displayName ? `Welcome back, ${displayName}! 👋` : "Welcome! 👋"}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            TS LAWCET Preparation
          </p>
        </div>
        <ExamCountdown />
      </div>

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
  const {
    loginWithEmail,
    loginWithGoogle,
    signupWithEmailAndName,
    googleRedirectError,
    clearGoogleRedirectError,
  } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Show any error that came back from the Google redirect
  const displayError = error || googleRedirectError || "";

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    clearGoogleRedirectError();
    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }
    if (mode === "signup" && !name.trim()) {
      setError("Please enter your name.");
      return;
    }
    setLoading(true);
    try {
      if (mode === "signin") {
        await loginWithEmail(email, password);
      } else {
        await signupWithEmailAndName(email, password, name.trim());
        localStorage.setItem("userName", name.trim());
      }
    } catch (err: any) {
      setError(getFirebaseErrorMessage(err?.code ?? ""));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError("");
    clearGoogleRedirectError();
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      // Page will redirect to Google — no further handling needed here
    } catch (err: any) {
      setError(getFirebaseErrorMessage(err?.code ?? ""));
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
            {mode === "signup" && (
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="auth-name"
                  className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
                >
                  Your Name
                </label>
                <input
                  id="auth-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  autoComplete="name"
                  className="w-full px-3 py-2.5 rounded-lg text-sm bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                  data-ocid="login.name_input"
                />
              </div>
            )}
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
            {displayError && (
              <p
                className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2"
                data-ocid="login.error_state"
              >
                {displayError}
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
  const { isAuthenticated, isLoading, user } = useAuth();
  const [activePage, setActivePage] = useState<Page>("dashboard");
  const { data: profile, isLoading: profileLoading } = useMyProfile();
  const saveProfile = useSaveProfile();

  // Auto-save profile from Firebase displayName if backend profile is missing
  useEffect(() => {
    if (
      isAuthenticated &&
      !profileLoading &&
      user &&
      user.displayName &&
      (!profile || !profile.name || profile.name.trim() === "")
    ) {
      const name = user.displayName.trim();
      if (name) {
        localStorage.setItem("userName", name);
        saveProfile.mutate({ name, email: user.email ?? "" });
      }
    }
  }, [isAuthenticated, profileLoading, user, profile, saveProfile.mutate]);

  // Name is collected at signup, no post-login popup needed
  const showProfileSetup = false;

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
        <MockTest onNavigateHome={() => setActivePage("dashboard")} />
        <MobileBottomNav
          activePage={activePage}
          setActivePage={setActivePage}
        />
        <AnimatePresence>
          {showProfileSetup && <ProfileSetupModal onDone={() => {}} />}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <AppShell activePage={activePage} setActivePage={setActivePage}>
      {activePage === "dashboard" && <Dashboard />}
      {activePage === "daily-ca" && <DailyCurrentAffairs />}
      {activePage === "monthly-ca" && <MonthlyCurrentAffairs />}
      {activePage === "performance" && <Performance />}
      {activePage === "ca-quiz" && (
        <CAQuiz onNavigateHome={() => setActivePage("dashboard")} />
      )}
      {activePage === "profile" && <Profile />}
      <MobileBottomNav activePage={activePage} setActivePage={setActivePage} />
      <AnimatePresence>
        {showProfileSetup && <ProfileSetupModal onDone={() => {}} />}
      </AnimatePresence>
    </AppShell>
  );
}

export default function App() {
  return <AppContent />;
}
