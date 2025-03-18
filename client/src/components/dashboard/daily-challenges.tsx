import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function DailyChallenges() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: userChallenges, isLoading: isLoadingChallenges } = useQuery({
    queryKey: ["/api/user/challenges"],
    enabled: !!user,
  });

  const completeChallengesMutation = useMutation({
    mutationFn: async (challengeId: number) => {
      const res = await apiRequest("POST", `/api/challenges/${challengeId}/complete`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/challenges"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/level-details"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/activities"] });
      
      toast({
        title: "Herausforderung abgeschlossen!",
        description: "Du hast Punkte für diese Herausforderung erhalten.",
      });
    }
  });

  // Calculate completed challenges
  const totalChallenges = userChallenges?.length || 0;
  const completedChallenges = userChallenges?.filter(uc => uc.completed)?.length || 0;

  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-neutral-800">Heutige Herausforderungen</h2>
        <span className="text-sm font-medium text-neutral-500">
          {isLoadingChallenges ? (
            <Skeleton className="h-4 w-12" />
          ) : (
            <>
              <span>{completedChallenges}</span>/<span>{totalChallenges}</span> erledigt
            </>
          )}
        </span>
      </div>

      <div className="space-y-4">
        {isLoadingChallenges ? (
          // Loading skeleton
          <>
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 border border-neutral-200 rounded-lg bg-neutral-50">
                <div className="flex items-start">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="ml-4 flex-1">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-full mb-2" />
                    <div className="mt-2 flex items-center">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-3 w-16 ml-auto" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </>
        ) : (
          // Actual challenges
          userChallenges?.map((userChallenge) => {
            const { challenge, completed } = userChallenge;
            return (
              <div
                key={challenge.id}
                className={cn(
                  "challenge-card p-4 border border-neutral-200 rounded-lg bg-neutral-50 cursor-pointer",
                  { "hover:border-primary": !completed }
                )}
                onClick={() => {
                  if (!completed) {
                    completeChallengesMutation.mutate(challenge.id);
                  }
                }}
              >
                <div className="flex items-start">
                  <div className={`flex-shrink-0 bg-${challenge.iconBgColor} bg-opacity-10 p-2 rounded-full`}>
                    <span className={`material-icons text-${challenge.iconBgColor}`}>{challenge.icon}</span>
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-sm font-medium text-neutral-800">{challenge.title}</h3>
                    <p className="text-xs text-neutral-500 mt-1">{challenge.description}</p>
                    <div className="mt-2 flex items-center">
                      <span className={`text-xs font-medium ${completed ? 'text-success' : 'text-neutral-500'}`}>
                        {completed ? 'Erledigt' : 'Offen'}
                      </span>
                      <span className="ml-auto text-xs font-medium text-primary">
                        +{challenge.pointsReward} Punkte
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
