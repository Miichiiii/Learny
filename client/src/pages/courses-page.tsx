import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import Navbar from "@/components/layout/navbar";
import Sidebar from "@/components/layout/sidebar";
import MobileNavigation from "@/components/layout/mobile-navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

export default function CoursesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [lessonProgress, setLessonProgress] = useState<number>(0);
  const [isLoadingLesson, setIsLoadingLesson] = useState<boolean>(false);

  const { data: courses, isLoading: isLoadingCourses } = useQuery({
    queryKey: ["/api/courses"],
  });

  const { data: userCourses, isLoading: isLoadingUserCourses } = useQuery({
    queryKey: ["/api/user/courses"],
    enabled: !!user,
  });

  const startCourseMutation = useMutation({
    mutationFn: async (courseId: number) => {
      const res = await apiRequest("POST", `/api/courses/${courseId}/start`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/courses"] });
      toast({
        title: "Kurs gestartet",
        description: "Du hast erfolgreich einen neuen Kurs begonnen.",
      });
    },
  });

  const updateProgressMutation = useMutation({
    mutationFn: async ({ courseId, lessonsCompleted }: { courseId: number, lessonsCompleted: number }) => {
      const res = await apiRequest("PUT", `/api/courses/${courseId}/progress`, { lessonsCompleted });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/courses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/level-details"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/activities"] });
      
      setSelectedCourse(null);
      toast({
        title: "Fortschritt aktualisiert",
        description: "Dein Kursfortschritt wurde erfolgreich aktualisiert.",
      });
    },
  });

  // Get user course for a course id
  const getUserCourse = (courseId: number) => {
    return userCourses?.find(uc => uc.courseId === courseId);
  };

  // Start course handler
  const handleStartCourse = (course: any) => {
    startCourseMutation.mutate(course.id);
  };

  // useEffect to simulate loading a lesson
  useEffect(() => {
    if (selectedCourse && lessonProgress < 100) {
      setIsLoadingLesson(true);
      
      // Simulate the lesson loading
      const timer = setInterval(() => {
        setLessonProgress(prev => {
          const newProgress = prev + 20;
          if (newProgress >= 100) {
            clearInterval(timer);
            setIsLoadingLesson(false);
          }
          return Math.min(newProgress, 100);
        });
      }, 800); // Update every 800ms
      
      return () => clearInterval(timer);
    }
  }, [selectedCourse, lessonProgress]);

  // Complete lesson handler in dialog
  const handleCompleteLesson = () => {
    if (!selectedCourse) return;
    
    const userCourse = getUserCourse(selectedCourse.id);
    if (!userCourse) return;
    
    const newProgress = userCourse.lessonsCompleted + 1;
    updateProgressMutation.mutate({ 
      courseId: selectedCourse.id, 
      lessonsCompleted: newProgress
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-grow grid main-grid">
        <Sidebar />

        <main className="p-4 sm:p-6 lg:p-8 bg-neutral-100 overflow-y-auto pb-20 md:pb-8">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6">
              <h1 className="text-2xl font-bold text-neutral-800 mb-4">Finanzkurse</h1>
              <p className="text-neutral-600 mb-6">
                Erweitere dein Finanzwissen mit unseren interaktiven Kursen. Jeder abgeschlossene Kurs bringt dich näher zu deinem Ziel, finanziell gebildet zu sein.
              </p>

              {isLoadingCourses || isLoadingUserCourses ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-64 rounded-lg" />
                  ))}
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {courses?.map(course => {
                    const userCourse = getUserCourse(course.id);
                    const isStarted = !!userCourse;
                    const isCompleted = userCourse && userCourse.lessonsCompleted >= course.totalLessons;
                    const progress = isStarted ? Math.floor((userCourse.lessonsCompleted / course.totalLessons) * 100) : 0;

                    return (
                      <Card key={course.id} className="overflow-hidden">
                        <CardHeader className="bg-primary bg-opacity-10 pb-2">
                          <CardTitle className="flex items-start">
                            <span className="material-icons text-primary mr-2">school</span>
                            {course.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                          <p className="text-neutral-600 text-sm mb-4">
                            {course.description}
                          </p>
                          <div className="flex items-center justify-between text-sm text-neutral-500 mb-2">
                            <span>{course.totalLessons} Lektionen</span>
                            {isStarted && (
                              <span>{userCourse.lessonsCompleted}/{course.totalLessons} abgeschlossen</span>
                            )}
                          </div>
                          {isStarted && (
                            <Progress value={progress} className="h-2" />
                          )}
                        </CardContent>
                        <CardFooter>
                          {!isStarted ? (
                            <Button 
                              className="w-full"
                              onClick={() => handleStartCourse(course)}
                              disabled={startCourseMutation.isPending}
                            >
                              {startCourseMutation.isPending ? (
                                <span className="material-icons animate-spin mr-2">refresh</span>
                              ) : null}
                              Kurs starten
                            </Button>
                          ) : isCompleted ? (
                            <Button variant="outline" className="w-full" disabled>
                              <span className="material-icons text-success mr-2">check_circle</span>
                              Abgeschlossen
                            </Button>
                          ) : (
                            <Button 
                              className="w-full"
                              onClick={() => {
                                setSelectedCourse(course);
                                setLessonProgress(0);
                                setIsLoadingLesson(false);
                              }}
                            >
                              Fortsetzen
                            </Button>
                          )}
                        </CardFooter>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <Dialog open={!!selectedCourse} onOpenChange={(open) => !open && setSelectedCourse(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Lektion abschließen</DialogTitle>
            <DialogDescription>
              {selectedCourse && (
                <>
                  Kurs: {selectedCourse.title}
                  <div className="mt-2">
                    {lessonProgress < 100 ? (
                      <div className="space-y-2">
                        <div className="text-sm">Lektion wird geladen...</div>
                        <Progress 
                          value={lessonProgress} 
                          className="h-2"
                        />
                      </div>
                    ) : (
                      <div className="text-sm text-success flex items-center">
                        <span className="material-icons mr-1">check_circle</span>
                        Lektion erfolgreich abgeschlossen!
                      </div>
                    )}
                  </div>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setSelectedCourse(null)}
            >
              Abbrechen
            </Button>
            <Button 
              type="button"
              disabled={lessonProgress < 100 || updateProgressMutation.isPending}
              onClick={handleCompleteLesson}
            >
              {updateProgressMutation.isPending ? (
                <span className="material-icons animate-spin mr-2">refresh</span>
              ) : null}
              Als abgeschlossen markieren
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <MobileNavigation />
    </div>
  );
}
