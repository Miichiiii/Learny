import { useAuth } from "@/hooks/use-auth";
import Navbar from "@/components/layout/navbar";
import Sidebar from "@/components/layout/sidebar";
import MobileNavigation from "@/components/layout/mobile-navigation";
import UserProgressHeader from "@/components/dashboard/user-progress-header";
import DailyChallenges from "@/components/dashboard/daily-challenges";
import RecentActivity from "@/components/dashboard/recent-activity";
import CommunityQuestions from "@/components/dashboard/community-questions";
import LeaderboardWidget from "@/components/dashboard/leaderboard-widget";
import AchievementWidget from "@/components/dashboard/achievement-widget";
import CourseProgressWidget from "@/components/dashboard/course-progress-widget";

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) {
    return null; // Protected route will handle redirection
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-grow grid main-grid">
        <Sidebar />

        <main className="p-4 sm:p-6 lg:p-8 bg-neutral-100 overflow-y-auto pb-20 md:pb-8">
          <UserProgressHeader />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <DailyChallenges />
              <RecentActivity />
              <CommunityQuestions />
            </div>

            <div className="space-y-6">
              <LeaderboardWidget />
              <AchievementWidget />
              <CourseProgressWidget />
            </div>
          </div>
        </main>
      </div>

      <MobileNavigation />
    </div>
  );
}
