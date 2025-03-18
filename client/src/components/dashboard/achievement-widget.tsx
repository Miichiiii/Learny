import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";

export default function AchievementWidget() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  const { data: userBadges, isLoading: isLoadingUserBadges } = useQuery({
    queryKey: ["/api/user/badges"],
    enabled: !!user,
  });

  const { data: allBadges, isLoading: isLoadingAllBadges } = useQuery({
    queryKey: ["/api/badges"],
  });

  // Find next badge to earn (simplified logic - would be more complex in a real app)
  const getNextBadgeProgress = () => {
    if (!userBadges || !allBadges || !user) return null;
    
    // Example: 7-day streak badge progress
    const streakBadge = allBadges.find(badge => badge.requirement === "streak" && badge.requiredAmount > user.streak);
    if (streakBadge) {
      return {
        title: streakBadge.title,
        current: user.streak,
        required: streakBadge.requiredAmount,
        progress: (user.streak / streakBadge.requiredAmount) * 100
      };
    }
    
    return null;
  };

  const nextBadge = getNextBadgeProgress();

  // Get which badges the user has earned
  const userHasBadge = (badgeId: number) => {
    return userBadges?.some(ub => ub.badgeId === badgeId);
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-neutral-800">Deine Abzeichen</h2>
        <button 
          className="text-sm text-primary font-medium"
          onClick={() => navigate("/badges")}
        >
          Alle Abzeichen
        </button>
      </div>

      {isLoadingAllBadges || isLoadingUserBadges ? (
        // Loading skeleton
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center">
              <Skeleton className="w-12 h-12 rounded-full" />
              <Skeleton className="mt-2 h-3 w-16" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {allBadges?.slice(0, 6).map(badge => {
            const earned = userHasBadge(badge.id);
            return (
              <div key={badge.id} className="badge flex flex-col items-center">
                <div 
                  className={cn(
                    "w-12 h-12 flex items-center justify-center rounded-full",
                    earned ? `bg-${badge.iconBgColor} bg-opacity-20` : "bg-neutral-200"
                  )}
                >
                  <span 
                    className={cn(
                      "material-icons",
                      earned ? `text-${badge.iconBgColor}` : "text-neutral-400"
                    )}
                  >
                    {badge.icon}
                  </span>
                </div>
                <span 
                  className={cn(
                    "mt-2 text-xs font-medium text-center",
                    earned ? "text-neutral-800" : "text-neutral-400"
                  )}
                >
                  {badge.title}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {nextBadge && (
        <div className="mt-4 pt-3 border-t border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-neutral-800">Nächstes Abzeichen:</span>
              <span className="ml-2 text-sm text-neutral-600">{nextBadge.title}</span>
            </div>
            <div className="text-xs text-neutral-500">
              <span>{nextBadge.current}/{nextBadge.required}</span>
            </div>
          </div>
          <div className="mt-2 w-full bg-neutral-200 rounded-full h-2">
            <div 
              className="bg-accent h-2 rounded-full transition-all duration-500 ease-in-out"
              style={{ width: `${nextBadge.progress}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
}
