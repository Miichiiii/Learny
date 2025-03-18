import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import Navbar from "@/components/layout/navbar";
import Sidebar from "@/components/layout/sidebar";
import MobileNavigation from "@/components/layout/mobile-navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [expandedUser, setExpandedUser] = useState<number | null>(null);

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
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-grow grid main-grid">
        <Sidebar />

        <main className="p-4 sm:p-6 lg:p-8 bg-neutral-100 overflow-y-auto pb-20 md:pb-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6">
              <h1 className="text-2xl font-bold text-neutral-800 mb-4">Rangliste</h1>
              <p className="text-neutral-600 mb-6">
                Vergleiche deine Leistung mit anderen Lernenden. Steige in der Rangliste auf, indem du Kurse abschließt, Fragen beantwortest und Herausforderungen meisterst.
              </p>

              {isLoadingTopUsers ? (
                <div className="space-y-4">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="border border-neutral-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="ml-3 h-8 w-32" />
                        <Skeleton className="ml-auto h-6 w-16" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {topUsers?.map((topUser, index) => (
                    <div 
                      key={topUser.id} 
                      className="border border-neutral-200 rounded-lg p-4 hover:border-primary transition-colors cursor-pointer"
                      onClick={() => setExpandedUser(expandedUser === topUser.id ? null : topUser.id)}
                    >
                      <div className="flex items-center">
                        <div className={cn("flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold", getMedalColor(index + 1))}>
                          {index + 1}
                        </div>
                        <div className="ml-3 h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center text-lg font-medium">
                          {topUser.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3">
                          <div className="text-lg font-medium text-neutral-800">{topUser.username}</div>
                          <div className="flex items-center text-sm text-neutral-500">
                            <span>Level {topUser.level}</span>
                            <span className="mx-1.5">•</span>
                            <span>{topUser.points.toLocaleString('de-DE')} Punkte</span>
                          </div>
                        </div>
                        {user?.id === topUser.id && (
                          <div className="ml-3 px-2 py-1 bg-primary bg-opacity-10 text-primary text-xs font-medium rounded">
                            Du
                          </div>
                        )}
                        <div className="ml-auto">
                          <span className="material-icons">
                            {expandedUser === topUser.id ? "expand_less" : "expand_more"}
                          </span>
                        </div>
                      </div>

                      {expandedUser === topUser.id && (
                        <div className="mt-4 pt-4 border-t border-neutral-200">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-neutral-50 p-3 rounded-lg">
                              <div className="flex items-center text-sm font-medium text-neutral-700">
                                <span className="material-icons text-primary mr-2 text-base">stars</span>
                                Punkte
                              </div>
                              <div className="mt-1 text-2xl font-bold text-neutral-800">
                                {topUser.points.toLocaleString('de-DE')}
                              </div>
                            </div>
                            <div className="bg-neutral-50 p-3 rounded-lg">
                              <div className="flex items-center text-sm font-medium text-neutral-700">
                                <span className="material-icons text-secondary mr-2 text-base">trending_up</span>
                                Level
                              </div>
                              <div className="mt-1 text-2xl font-bold text-neutral-800">
                                {topUser.level}
                              </div>
                            </div>
                            <div className="bg-neutral-50 p-3 rounded-lg">
                              <div className="flex items-center text-sm font-medium text-neutral-700">
                                <span className="material-icons text-accent mr-2 text-base">local_fire_department</span>
                                Serie
                              </div>
                              <div className="mt-1 text-2xl font-bold text-neutral-800">
                                {topUser.streak} Tage
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {user && !topUsers?.some(u => u.id === user.id) && !isLoadingUserRank && (
                    <div className="mt-6 pt-6 border-t-2 border-dashed border-neutral-200">
                      <div className="text-center text-sm text-neutral-500 mb-4">
                        Deine Position
                      </div>
                      <div className="border border-neutral-200 rounded-lg p-4 bg-neutral-50">
                        <div className="flex items-center">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-neutral-200 text-neutral-700 text-sm font-bold">
                            {userRank?.rank || "?"}
                          </div>
                          <div className="ml-3 h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center text-lg font-medium">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-3">
                            <div className="text-lg font-medium text-neutral-800">{user.username}</div>
                            <div className="flex items-center text-sm text-neutral-500">
                              <span>Level {user.level}</span>
                              <span className="mx-1.5">•</span>
                              <span>{user.points.toLocaleString('de-DE')} Punkte</span>
                            </div>
                          </div>
                          <div className="ml-3 px-2 py-1 bg-primary bg-opacity-10 text-primary text-xs font-medium rounded">
                            Du
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
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
