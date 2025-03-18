import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import Navbar from "@/components/layout/navbar";
import Sidebar from "@/components/layout/sidebar";
import MobileNavigation from "@/components/layout/mobile-navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function BadgesPage() {
  const { user } = useAuth();

  const { data: userBadges, isLoading: isLoadingUserBadges } = useQuery({
    queryKey: ["/api/user/badges"],
    enabled: !!user,
  });

  const { data: allBadges, isLoading: isLoadingAllBadges } = useQuery({
    queryKey: ["/api/badges"],
  });

  // Check if user has a badge
  const userHasBadge = (badgeId: number) => {
    return userBadges?.some(ub => ub.badgeId === badgeId);
  };

  // Calculate progress for a badge
  const getBadgeProgress = (badge: any) => {
    if (!user) return 0;

    switch (badge.requirement) {
      case "streak":
        return Math.min(1, user.streak / badge.requiredAmount);
      case "level":
        return Math.min(1, user.level / badge.requiredAmount);
      // Other cases would be handled with more data
      default:
        return 0;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-grow grid main-grid">
        <Sidebar />

        <main className="p-4 sm:p-6 lg:p-8 bg-neutral-100 overflow-y-auto pb-20 md:pb-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6">
              <h1 className="text-2xl font-bold text-neutral-800 mb-4">Abzeichen</h1>
              <p className="text-neutral-600 mb-6">
                Sammle einzigartige Abzeichen für deine Erfolge. Jedes Abzeichen repräsentiert einen wichtigen Meilenstein in deiner Lernreise.
              </p>

              {isLoadingAllBadges || isLoadingUserBadges ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="flex flex-col items-center p-4 border border-neutral-200 rounded-lg">
                      <Skeleton className="w-16 h-16 rounded-full mb-3" />
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {allBadges?.map(badge => {
                    const earned = userHasBadge(badge.id);
                    const progress = getBadgeProgress(badge);
                    
                    return (
                      <div key={badge.id} className={cn(
                        "badge flex flex-col items-center p-4 border rounded-lg transition-all",
                        earned ? "border-primary" : "border-neutral-200"
                      )}>
                        <div 
                          className={cn(
                            "w-16 h-16 flex items-center justify-center rounded-full mb-3",
                            earned ? `bg-${badge.iconBgColor} bg-opacity-20` : "bg-neutral-200"
                          )}
                        >
                          <span 
                            className={cn(
                              "material-icons text-2xl",
                              earned ? `text-${badge.iconBgColor}` : "text-neutral-400"
                            )}
                          >
                            {badge.icon}
                          </span>
                        </div>
                        <h3 className={cn(
                          "text-sm font-medium text-center mb-1",
                          earned ? "text-neutral-800" : "text-neutral-500"
                        )}>
                          {badge.title}
                        </h3>
                        <p className="text-xs text-neutral-500 text-center mb-2">
                          {badge.description}
                        </p>
                        
                        {earned ? (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                            <span className="material-icons text-xs mr-1">check_circle</span>
                            Erreicht
                          </span>
                        ) : (
                          <div className="w-full mt-2">
                            <div className="text-xs text-neutral-500 flex justify-between mb-1">
                              <span>Fortschritt</span>
                              <span>{Math.round(progress * 100)}%</span>
                            </div>
                            <div className="w-full bg-neutral-200 rounded-full h-1.5">
                              <div 
                                className="bg-neutral-400 h-1.5 rounded-full"
                                style={{width: `${progress * 100}%`}}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <MobileNavigation />
    </div>
  );
}
