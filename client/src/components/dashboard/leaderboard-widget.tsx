import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";

export default function LeaderboardWidget() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  const { data: topUsers, isLoading: isLoadingTopUsers } = useQuery({
    queryKey: ["/api/users/top"],
  });

  const { data: userRank, isLoading: isLoadingUserRank } = useQuery({
    queryKey: ["/api/users/rank"],
    enabled: !!user,
  });

  // Get medal color based on rank
  const getMedalColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-primary text-white";
      case 2:
        return "bg-neutral-500 text-white";
      case 3:
        return "bg-accent text-white";
      default:
        return "bg-neutral-200 text-neutral-700";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-neutral-800">Rangliste</h2>
        <button 
          className="text-sm text-primary font-medium"
          onClick={() => navigate("/leaderboard")}
        >
          Vollständige Rangliste
        </button>
      </div>

      <div className="space-y-2">
        {isLoadingTopUsers ? (
          // Loading skeletons for top users
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center p-2 rounded-md">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="ml-3 h-8 w-8 rounded-full" />
              <div className="ml-3 flex-1">
                <div className="flex items-center">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="ml-2 h-4 w-12" />
                </div>
                <Skeleton className="h-3 w-16 mt-1" />
              </div>
            </div>
          ))
        ) : (
          // Top users list
          topUsers?.slice(0, 3).map((topUser, index) => (
            <div key={topUser.id} className="flex items-center p-2 rounded-md hover:bg-neutral-50">
              <div className={cn("flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold", getMedalColor(index + 1))}>
                {index + 1}
              </div>
              <div className="ml-3 h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center">
                {topUser.username.charAt(0).toUpperCase()}
              </div>
              <div className="ml-3 flex-1">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-neutral-800">{topUser.username}</span>
                  <span className="ml-2 px-1.5 py-0.5 rounded text-xs font-medium bg-neutral-100 text-neutral-800">
                    Lvl {topUser.level}
                  </span>
                </div>
                <div className="text-xs text-neutral-500">{topUser.points.toLocaleString('de-DE')} Punkte</div>
              </div>
            </div>
          ))
        )}

        {user && (
          <div className="mt-3 pt-3 border-t border-neutral-200">
            {isLoadingUserRank ? (
              <div className="flex items-center p-2 rounded-md">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="ml-3 h-8 w-8 rounded-full" />
                <div className="ml-3 flex-1">
                  <div className="flex items-center">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="ml-2 h-4 w-12" />
                  </div>
                  <Skeleton className="h-3 w-16 mt-1" />
                </div>
              </div>
            ) : (
              <div className="flex items-center p-2 rounded-md bg-neutral-50">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-neutral-200 text-neutral-700 text-xs font-bold">
                  {userRank?.rank || "?"}
                </div>
                <div className="ml-3 h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div className="ml-3 flex-1">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-neutral-800">{user.username}</span>
                    <span className="ml-2 px-1.5 py-0.5 rounded text-xs font-medium bg-primary bg-opacity-10 text-primary">
                      Lvl {user.level}
                    </span>
                  </div>
                  <div className="text-xs text-neutral-500">{user.points.toLocaleString('de-DE')} Punkte</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
