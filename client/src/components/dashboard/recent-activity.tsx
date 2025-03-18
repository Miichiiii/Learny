import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";

export default function RecentActivity() {
  const { user } = useAuth();

  const { data: activities, isLoading } = useQuery({
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

  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6">
      <h2 className="text-lg font-bold text-neutral-800 mb-4">Kürzliche Aktivitäten</h2>

      <div className="space-y-4">
        {isLoading ? (
          // Loading skeleton
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-start">
              <Skeleton className="h-6 w-6 rounded-full" />
              <div className="ml-3 flex-1">
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))
        ) : activities && activities.length > 0 ? (
          // Actual activities
          activities.slice(0, 4).map((activity) => {
            const { icon, color } = getIconForActivityType(activity.type);
            return (
              <div key={activity.id} className="flex items-start">
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
          // No activities
          <div className="text-center py-6 text-neutral-500">
            Noch keine Aktivitäten vorhanden.
          </div>
        )}
      </div>

      {activities && activities.length > 4 && (
        <div className="mt-4 text-center">
          <button className="text-sm text-primary font-medium">
            Alle Aktivitäten anzeigen
          </button>
        </div>
      )}
    </div>
  );
}
