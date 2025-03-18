import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

export default function CourseProgressWidget() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  const { data: userCourses, isLoading } = useQuery({
    queryKey: ["/api/user/courses"],
    enabled: !!user,
  });

  // Get in-progress courses (not completed)
  const inProgressCourses = userCourses?.filter(
    uc => uc.lessonsCompleted < uc.course.totalLessons
  );

  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-neutral-800">Kurse in Bearbeitung</h2>
        <button 
          className="text-sm text-primary font-medium"
          onClick={() => navigate("/courses")}
        >
          Alle Kurse
        </button>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          // Loading skeleton
          Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="border border-neutral-200 rounded-lg p-3">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <div className="mt-2 flex items-center">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-3 w-8 ml-auto" />
              </div>
              <Skeleton className="mt-1 h-1.5 w-full rounded-full" />
            </div>
          ))
        ) : inProgressCourses && inProgressCourses.length > 0 ? (
          // Course progress items
          inProgressCourses.map(userCourse => {
            const { course, lessonsCompleted } = userCourse;
            const progressPercent = (lessonsCompleted / course.totalLessons) * 100;
            
            return (
              <div 
                key={course.id} 
                className="border border-neutral-200 rounded-lg p-3 hover:border-primary cursor-pointer"
                onClick={() => navigate(`/courses/${course.id}`)}
              >
                <h3 className="text-sm font-medium text-neutral-800">{course.title}</h3>
                <div className="mt-2 flex items-center text-xs text-neutral-500">
                  <span>{lessonsCompleted}/{course.totalLessons} Lektionen abgeschlossen</span>
                  <span className="ml-auto">{progressPercent.toFixed(0)}%</span>
                </div>
                <div className="mt-1 w-full bg-neutral-200 rounded-full h-1.5">
                  <div 
                    className="bg-primary h-1.5 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
              </div>
            );
          })
        ) : (
          // No courses in progress
          <div className="text-center py-6 text-neutral-500">
            Du hast noch keine Kurse begonnen.
            <div className="mt-2">
              <button 
                className="text-primary font-medium"
                onClick={() => navigate("/courses")}
              >
                Kurse entdecken
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
