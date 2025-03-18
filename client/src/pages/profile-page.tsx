import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import Navbar from "@/components/layout/navbar";
import Sidebar from "@/components/layout/sidebar";
import MobileNavigation from "@/components/layout/mobile-navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";

export default function ProfilePage() {
  const { user } = useAuth();

  const { data: levelDetails, isLoading: isLoadingLevelDetails } = useQuery({
    queryKey: ["/api/user/level-details"],
    enabled: !!user,
  });

  const { data: userRank } = useQuery({
    queryKey: ["/api/users/rank"],
    enabled: !!user,
  });

  const { data: userBadges, isLoading: isLoadingUserBadges } = useQuery({
    queryKey: ["/api/user/badges"],
    enabled: !!user,
  });

  const { data: activities, isLoading: isLoadingActivities } = useQuery({
    queryKey: ["/api/user/activities"],
    enabled: !!user,
  });

  // Map activity type to icon
  const getIconForActivityType = (type: string) => {
    switch (type) {
      case "badge_earned":
        return { icon: "emoji_events", color: "text-accent" };
      case "challenge_completed":
        return { icon: "star", color: "text-primary" };
      case "level_up":
        return { icon: "timeline", color: "text-secondary" };
      case "course_completed":
        return { icon: "school", color: "text-primary" };
      case "quiz_completed":
        return { icon: "quiz", color: "text-primary" };
      default:
        return { icon: "notifications", color: "text-neutral-500" };
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true, locale: de });
  };

  if (!user) {
    return null; // Protected route will handle redirection
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-grow grid main-grid">
        <Sidebar />

        <main className="p-4 sm:p-6 lg:p-8 bg-neutral-100 overflow-y-auto pb-20 md:pb-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6">
              <div className="flex flex-col md:flex-row items-center md:items-start mb-6">
                <div className="h-20 w-20 rounded-full bg-primary text-white flex items-center justify-center text-3xl font-medium mb-4 md:mb-0 md:mr-6">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div className="text-center md:text-left">
                  <h1 className="text-2xl font-bold text-neutral-800 mb-1">{user.username}</h1>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-sm text-neutral-500 mb-2">
                    <div className="flex items-center">
                      <span className="material-icons text-secondary mr-1 text-base">trending_up</span>
                      Level {user.level}
                    </div>
                    <div className="hidden md:block text-neutral-300">•</div>
                    <div className="flex items-center">
                      <span className="material-icons text-primary mr-1 text-base">stars</span>
                      {user.points.toLocaleString('de-DE')} Punkte
                    </div>
                    <div className="hidden md:block text-neutral-300">•</div>
                    <div className="flex items-center">
                      <span className="material-icons text-accent mr-1 text-base">local_fire_department</span>
                      {user.streak} Tage Serie
                    </div>
                    {userRank && (
                      <>
                        <div className="hidden md:block text-neutral-300">•</div>
                        <div className="flex items-center">
                          <span className="material-icons text-neutral-500 mr-1 text-base">leaderboard</span>
                          Rang {userRank.rank}
                        </div>
                      </>
                    )}
                  </div>
                  <div className="text-sm text-neutral-600">
                    Mitglied seit {formatDate(user.lastLoginDate)}
                  </div>
                </div>
              </div>

              {isLoadingLevelDetails ? (
                <div className="mb-6">
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-2 w-full" />
                </div>
              ) : (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-1 text-sm">
                    <span className="font-medium text-neutral-700">Level Fortschritt</span>
                    <span className="text-neutral-500">
                      Level {levelDetails?.level} → {levelDetails?.nextLevel}
                    </span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2.5 mb-1">
                    <div 
                      className="bg-secondary h-2.5 rounded-full transition-all duration-500 ease-in-out"
                      style={{width: `${(levelDetails?.levelProgress / levelDetails?.levelCap) * 100}%`}}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-neutral-500">
                    <span>{levelDetails?.levelProgress} / {levelDetails?.levelCap} Punkte</span>
                    <span>Noch {levelDetails?.pointsToNextLevel} Punkte bis Level {levelDetails?.nextLevel}</span>
                  </div>
                </div>
              )}

              <Tabs defaultValue="activity">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="activity">Aktivitäten</TabsTrigger>
                  <TabsTrigger value="badges">Abzeichen</TabsTrigger>
                </TabsList>
                
                <TabsContent value="activity">
                  <div className="space-y-4">
                    {isLoadingActivities ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-start">
                          <Skeleton className="h-6 w-6 rounded-full" />
                          <div className="ml-3 flex-1">
                            <Skeleton className="h-4 w-full mb-1" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                        </div>
                      ))
                    ) : activities && activities.length > 0 ? (
                      activities.map((activity) => {
                        const { icon, color } = getIconForActivityType(activity.type);
                        return (
                          <div key={activity.id} className="flex items-start p-3 rounded-lg hover:bg-neutral-50">
                            <div className="flex-shrink-0">
                              <span className={`material-icons ${color}`}>{icon}</span>
                            </div>
                            <div className="ml-3">
                              <p className="text-sm text-neutral-800">
                                {activity.description}
                                {activity.pointsAwarded > 0 && (
                                  <span className="font-medium"> (+{activity.pointsAwarded} Punkte)</span>
                                )}
                              </p>
                              <p className="text-xs text-neutral-500 mt-1">
                                {formatDate(activity.createdAt)}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-8 text-neutral-500">
                        Noch keine Aktivitäten vorhanden.
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="badges">
                  {isLoadingUserBadges ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <Skeleton key={i} className="h-32 rounded-lg" />
                      ))}
                    </div>
                  ) : userBadges && userBadges.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {userBadges.map(userBadge => (
                        <Card key={userBadge.id} className="border-primary">
                          <CardContent className="p-4 flex flex-col items-center">
                            <div className={`w-12 h-12 flex items-center justify-center rounded-full mb-3 bg-${userBadge.badge.iconBgColor} bg-opacity-20`}>
                              <span className={`material-icons text-${userBadge.badge.iconBgColor}`}>
                                {userBadge.badge.icon}
                              </span>
                            </div>
                            <h3 className="text-sm font-medium text-center mb-1">
                              {userBadge.badge.title}
                            </h3>
                            <p className="text-xs text-neutral-500 text-center">
                              Erhalten {formatDate(userBadge.earnedAt)}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-neutral-500">
                      Du hast noch keine Abzeichen erhalten. Schließe Herausforderungen ab, um Abzeichen zu verdienen!
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>

      <MobileNavigation />
    </div>
  );
}
