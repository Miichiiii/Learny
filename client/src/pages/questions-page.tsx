import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import Navbar from "@/components/layout/navbar";
import Sidebar from "@/components/layout/sidebar";
import MobileNavigation from "@/components/layout/mobile-navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function QuestionsPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: questions, isLoading } = useQuery({
    queryKey: ["/api/questions"],
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

  // Filter questions by search query
  const filteredQuestions = questions?.filter(question => 
    searchQuery === "" || 
    question.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (question.tags && question.tags.some(tag => 
      tag.toLowerCase().includes(searchQuery.toLowerCase())
    ))
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-grow grid main-grid">
        <Sidebar />

        <main className="p-4 sm:p-6 lg:p-8 bg-neutral-100 overflow-y-auto pb-20 md:pb-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-neutral-800">Community Fragen</h1>
                  <p className="text-neutral-600 mt-1">
                    Durchsuche Fragen oder stelle deine eigene, um von der Community zu lernen.
                  </p>
                </div>
                <Button 
                  size="sm"
                  className="bg-primary text-white flex items-center"
                  onClick={() => navigate("/ask-question")}
                >
                  <span className="material-icons text-sm mr-1">add</span>
                  Frage stellen
                </Button>
              </div>

              <div className="relative mb-6">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-500">
                  <span className="material-icons">search</span>
                </span>
                <Input 
                  type="text"
                  placeholder="Suche nach Fragen oder Tags..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="space-y-4">
                {isLoading ? (
                  // Loading skeleton
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="border border-neutral-200 rounded-lg p-4">
                      <div className="flex items-start">
                        <div className="mr-3 mt-1 flex flex-col items-center">
                          <Skeleton className="h-4 w-4 mb-1" />
                          <Skeleton className="h-4 w-6 mb-1" />
                          <Skeleton className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <Skeleton className="h-5 w-3/4 mb-2" />
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
                ) : filteredQuestions && filteredQuestions.length > 0 ? (
                  // Actual questions
                  filteredQuestions.map((question) => (
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
                              {question.userId === user?.id ? "Du" : question.userId}
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
                  // No questions or no matches
                  <div className="text-center py-8 text-neutral-500">
                    {searchQuery ? (
                      <>
                        Keine Fragen gefunden für "{searchQuery}".
                        <div className="mt-2">
                          <Button variant="link" onClick={() => setSearchQuery("")}>
                            Suche zurücksetzen
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        Noch keine Fragen vorhanden. Stelle die erste Frage!
                        <div className="mt-2">
                          <Button 
                            variant="outline"
                            onClick={() => navigate("/ask-question")}
                          >
                            Frage stellen
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      <MobileNavigation />
    </div>
  );
}
