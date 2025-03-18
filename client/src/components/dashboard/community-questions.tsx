import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function CommunityQuestions() {
  const [, navigate] = useLocation();

  const { data: questions, isLoading } = useQuery({
    queryKey: ["/api/questions"],
    queryFn: async ({ queryKey }) => {
      const res = await fetch(`${queryKey[0]}?limit=2`);
      if (!res.ok) throw new Error("Failed to fetch questions");
      return await res.json();
    },
  });

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.round((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "vor weniger als einer Stunde";
    if (diffInHours === 1) return "vor 1 Stunde";
    if (diffInHours < 24) return `vor ${diffInHours} Stunden`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "vor 1 Tag";
    return `vor ${diffInDays} Tagen`;
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-neutral-800">Community Fragen</h2>
        <Button 
          size="sm"
          className="bg-primary text-white flex items-center"
          onClick={() => navigate("/ask-question")}
        >
          <span className="material-icons text-sm mr-1">add</span>
          Frage stellen
        </Button>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          // Loading skeleton
          Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="border border-neutral-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="mr-3 mt-1 flex flex-col items-center">
                  <Skeleton className="h-4 w-4 mb-1" />
                  <Skeleton className="h-4 w-6 mb-1" />
                  <Skeleton className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-full mb-2" />
                  <div className="mt-2 flex flex-wrap gap-1">
                    <Skeleton className="h-4 w-16 rounded" />
                    <Skeleton className="h-4 w-20 rounded" />
                    <Skeleton className="h-4 w-14 rounded" />
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : questions && questions.length > 0 ? (
          // Actual questions
          questions.map((question) => (
            <div 
              key={question.id} 
              className="border border-neutral-200 rounded-lg p-4 cursor-pointer hover:border-primary"
              onClick={() => navigate(`/questions/${question.id}`)}
            >
              <div className="flex items-start">
                <div className="mr-3 mt-1 flex flex-col items-center">
                  <button className="text-neutral-400 hover:text-primary">
                    <span className="material-icons text-sm">arrow_drop_up</span>
                  </button>
                  <span className="text-sm font-medium text-neutral-700">{question.votes}</span>
                  <button className="text-neutral-400 hover:text-neutral-700">
                    <span className="material-icons text-sm">arrow_drop_down</span>
                  </button>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-neutral-800">{question.title}</h3>
                  <div className="mt-1 flex items-center text-xs text-neutral-500">
                    <div className="h-4 w-4 rounded-full bg-primary text-white flex items-center justify-center overflow-hidden text-[10px]">
                      {question.userId}
                    </div>
                    <span className="mx-1">•</span>
                    <span>{formatDate(question.createdAt)}</span>
                    {/* In a real app, we'd show the number of answers */}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {question.tags && Array.isArray(question.tags) && question.tags.map((tag, i) => (
                      <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          // No questions
          <div className="text-center py-6 text-neutral-500">
            Noch keine Fragen vorhanden. Stelle die erste Frage!
          </div>
        )}
      </div>

      <div className="mt-4 text-center">
        <button 
          className="text-sm text-primary font-medium"
          onClick={() => navigate("/questions")}
        >
          Alle Fragen anzeigen
        </button>
      </div>
    </div>
  );
}
