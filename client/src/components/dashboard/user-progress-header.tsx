import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";

export default function UserProgressHeader() {
  const { user } = useAuth();

  const { data: levelDetails, isLoading: isLoadingLevelDetails } = useQuery({
    queryKey: ["/api/user/level-details"],
    enabled: !!user,
  });

  if (!user) return null;

  return (
    <div className="bg-white rounded-lg shadow mb-6 p-4 sm:p-6">
      <h1 className="text-xl font-bold text-neutral-800 mb-4">
        Willkommen zurück, {user.username}!
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
          <div className="flex items-center">
            <span className="material-icons text-accent mr-2">local_fire_department</span>
            <span className="text-neutral-700 font-medium">Tägliche Serie</span>
            <span className="ml-auto text-2xl font-bold text-neutral-800">{user.streak}</span>
            <span className="text-neutral-500 ml-1">Tage</span>
          </div>
          <p className="text-sm text-neutral-500 mt-1">
            Mach weiter so! Bleib konsequent beim Lernen.
          </p>
        </div>

        <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
          <div className="flex items-center">
            <span className="material-icons text-primary mr-2">stars</span>
            <span className="text-neutral-700 font-medium">Gesammelte Punkte</span>
            <span className="ml-auto text-2xl font-bold text-neutral-800">
              {user.points.toLocaleString('de-DE')}
            </span>
          </div>
          <p className="text-sm text-neutral-500 mt-1">
            {/* Ranking would come from an API call in a real app */}
            Du bist auf dem Weg nach oben!
          </p>
        </div>

        <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
          <div className="flex flex-col">
            <div className="flex items-center mb-2">
              <span className="material-icons text-secondary mr-2">trending_up</span>
              <span className="text-neutral-700 font-medium">Level Fortschritt</span>
              {isLoadingLevelDetails ? (
                <Skeleton className="h-4 ml-auto w-16" />
              ) : (
                <span className="ml-auto text-sm">
                  <span className="font-bold">{levelDetails?.levelProgress}</span>/
                  <span>{levelDetails?.levelCap}</span>
                </span>
              )}
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-2 mb-1">
              {isLoadingLevelDetails ? (
                <Skeleton className="h-2 w-full rounded-full" />
              ) : (
                <div
                  className="bg-secondary h-2 rounded-full transition-all duration-500 ease-in-out"
                  style={{
                    width: `${(levelDetails?.levelProgress / levelDetails?.levelCap) * 100}%`,
                  }}
                ></div>
              )}
            </div>
            <div className="flex items-center text-xs text-neutral-500">
              <span>
                Level <span>{user.level}</span>
              </span>
              {isLoadingLevelDetails ? (
                <Skeleton className="h-4 ml-auto w-40" />
              ) : (
                <span className="ml-auto">
                  Bis Level <span>{levelDetails?.nextLevel}</span>:{" "}
                  <span>{levelDetails?.pointsToNextLevel}</span> Punkte
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
