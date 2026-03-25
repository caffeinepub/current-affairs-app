import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth";
import { BookOpen, LogOut, Save, Target, TrendingUp, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  useMyProfile,
  useMyStats,
  useSaveProfile,
  useUserProgress,
} from "../hooks/useQueries";

export function Profile() {
  const { logout, user } = useAuth();
  const { data: profile, isLoading: profileLoading } = useMyProfile();
  const { data: stats, isLoading: statsLoading } = useMyStats();
  const { data: progress, isLoading: progressLoading } = useUserProgress();
  const saveProfile = useSaveProfile();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [editing, setEditing] = useState(false);

  // Populate form when profile loads
  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setEmail(profile.email);
      setEditing(false);
    } else if (!profileLoading) {
      // No profile yet — open edit mode
      setEditing(true);
    }
  }, [profile, profileLoading]);

  function handleSave() {
    if (!name.trim()) {
      toast.error("Please enter your name.");
      return;
    }
    saveProfile.mutate(
      { name: name.trim(), email: email.trim() },
      {
        onSuccess: () => {
          toast.success("Profile saved!");
          setEditing(false);
        },
        onError: () => toast.error("Failed to save profile."),
      },
    );
  }

  const testsAttempted = Number(stats?.testsAttempted ?? 0n);
  const totalScore = Number(stats?.totalScore ?? 0n);
  const accuracy = stats?.accuracy ?? 0;
  const totalDays = Number(progress?.totalDaysInProgram ?? 30n);
  const completedDays = Number(progress?.totalDaysCompleted ?? 0n);
  const progressPct =
    totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;

  const displayName = profile?.name || user?.displayName || "";
  const initials = displayName
    ? displayName
        .split(" ")
        .map((w: string) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col gap-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16 border-2 border-border shadow-sm">
              <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
                {profileLoading ? "\u2026" : initials}
              </AvatarFallback>
            </Avatar>
            <div>
              {profileLoading ? (
                <>
                  <Skeleton className="h-6 w-32 mb-1" />
                  <Skeleton className="h-4 w-48" />
                </>
              ) : (
                <>
                  <h1 className="text-xl font-display font-bold text-foreground">
                    {profile?.name || user?.displayName || "New User"}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {user?.email || profile?.email || "No email set"}
                  </p>
                </>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              logout();
              toast.success("Signed out.");
            }}
            className="flex items-center gap-1.5 text-destructive border-destructive/40 hover:bg-destructive/10"
            data-ocid="profile.delete_button"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>

        {/* Profile Form */}
        <Card
          className="bg-card border border-border"
          data-ocid="profile.personal_card"
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {profileLoading ? (
              <>
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </>
            ) : editing ? (
              <>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="profile-name">Name</Label>
                  <Input
                    id="profile-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    data-ocid="profile.input"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="profile-email">Email (optional)</Label>
                  <Input
                    id="profile-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    data-ocid="profile.input"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleSave}
                    disabled={saveProfile.isPending}
                    className="flex items-center gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
                    data-ocid="profile.save_button"
                  >
                    <Save className="w-4 h-4" />
                    {saveProfile.isPending ? "Saving\u2026" : "Save Profile"}
                  </Button>
                  {profile && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setName(profile.name);
                        setEmail(profile.email);
                        setEditing(false);
                      }}
                      className="border-border hover:border-primary/50"
                      data-ocid="profile.cancel_button"
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
                      Name
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {profile?.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
                      Email
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {profile?.email || "\u2014"}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditing(true)}
                  className="w-fit border-border hover:border-primary/50"
                  data-ocid="profile.edit_button"
                >
                  Edit Profile
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        <Card
          className="bg-card border border-border"
          data-ocid="profile.stats_card"
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Performance Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center p-3 rounded-xl bg-background">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-2 bg-primary/10">
                  <BookOpen className="w-4 h-4 text-primary" />
                </div>
                {statsLoading ? (
                  <Skeleton className="h-6 w-10 mb-1" />
                ) : (
                  <p
                    className="text-2xl font-display font-bold text-primary"
                    data-ocid="profile.panel"
                  >
                    {testsAttempted}
                  </p>
                )}
                <p className="text-[11px] text-muted-foreground text-center leading-tight">
                  Tests Attempted
                </p>
              </div>

              <div className="flex flex-col items-center p-3 rounded-xl bg-background">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-2 bg-success/10">
                  <Target className="w-4 h-4 text-success" />
                </div>
                {statsLoading ? (
                  <Skeleton className="h-6 w-12 mb-1" />
                ) : (
                  <p
                    className="text-2xl font-display font-bold text-success"
                    data-ocid="profile.panel"
                  >
                    {accuracy.toFixed(1)}%
                  </p>
                )}
                <p className="text-[11px] text-muted-foreground text-center leading-tight">
                  Accuracy
                </p>
              </div>

              <div className="flex flex-col items-center p-3 rounded-xl bg-background">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-2 bg-warning/10">
                  <Zap className="w-4 h-4 text-warning" />
                </div>
                {statsLoading ? (
                  <Skeleton className="h-6 w-10 mb-1" />
                ) : (
                  <p
                    className="text-2xl font-display font-bold text-warning"
                    data-ocid="profile.panel"
                  >
                    {totalScore}
                  </p>
                )}
                <p className="text-[11px] text-muted-foreground text-center leading-tight">
                  Total Score
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress */}
        <Card
          className="bg-card border border-border"
          data-ocid="profile.progress_card"
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Program Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            {progressLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-3xl font-display font-bold text-foreground">
                    {completedDays}
                    <span className="text-lg font-normal text-muted-foreground">
                      {" "}
                      / {totalDays}
                    </span>
                  </span>
                  <span className="text-sm font-semibold text-primary">
                    {progressPct}%
                  </span>
                </div>
                <Progress
                  value={progressPct}
                  className="h-2 [&>div]:bg-primary"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Days completed in program
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
