import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import Navbar from "@/components/layout/navbar";
import Sidebar from "@/components/layout/sidebar";
import MobileNavigation from "@/components/layout/mobile-navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertAnswerSchema } from "@shared/schema";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";

// Extend answer schema with client-side validation
const answerFormSchema = insertAnswerSchema.pick({
  content: true,
}).extend({
  content: z.string().min(10, "Antwort muss mindestens 10 Zeichen lang sein"),
});

type AnswerFormValues = z.infer<typeof answerFormSchema>;

export default function QuestionDetailPage({ params }: { params: { id: string } }) {
  const questionId = parseInt(params.id, 10);
  const { user } = useAuth();
  const { toast } = useToast();
  const [votingQuestion, setVotingQuestion] = useState(false);
  const [votingAnswer, setVotingAnswer] = useState<number | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: [`/api/questions/${questionId}`],
    enabled: !isNaN(questionId),
  });

  const form = useForm<AnswerFormValues>({
    resolver: zodResolver(answerFormSchema),
    defaultValues: {
      content: "",
    },
  });

  const submitAnswerMutation = useMutation({
    mutationFn: async (values: AnswerFormValues) => {
      const res = await apiRequest("POST", `/api/questions/${questionId}/answers`, values);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Antwort gesendet",
        description: "Deine Antwort wurde erfolgreich veröffentlicht.",
      });
      form.reset();
      refetch();
      
      // Invalidate activities to reflect points earned
      queryClient.invalidateQueries({ queryKey: ["/api/user/activities"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/level-details"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Fehler",
        description: `Beim Senden deiner Antwort ist ein Fehler aufgetreten: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const voteQuestionMutation = useMutation({
    mutationFn: async (value: number) => {
      const res = await apiRequest("POST", `/api/questions/${questionId}/vote`, { value });
      return await res.json();
    },
    onSuccess: () => {
      refetch();
      setVotingQuestion(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Fehler",
        description: `Beim Bewerten der Frage ist ein Fehler aufgetreten: ${error.message}`,
        variant: "destructive",
      });
      setVotingQuestion(false);
    },
  });

  const voteAnswerMutation = useMutation({
    mutationFn: async ({ answerId, value }: { answerId: number, value: number }) => {
      const res = await apiRequest("POST", `/api/answers/${answerId}/vote`, { value });
      return await res.json();
    },
    onSuccess: () => {
      refetch();
      setVotingAnswer(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Fehler",
        description: `Beim Bewerten der Antwort ist ein Fehler aufgetreten: ${error.message}`,
        variant: "destructive",
      });
      setVotingAnswer(null);
    },
  });

  const onSubmit = (values: AnswerFormValues) => {
    submitAnswerMutation.mutate(values);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true, locale: de });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-grow grid main-grid">
        <Sidebar />

        <main className="p-4 sm:p-6 lg:p-8 bg-neutral-100 overflow-y-auto pb-20 md:pb-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6">
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-6 w-3/4" />
                  <div className="flex items-center">
                    <Skeleton className="h-4 w-24 mr-4" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-32 w-full" />
                  <div className="flex flex-wrap gap-1">
                    <Skeleton className="h-4 w-16 rounded" />
                    <Skeleton className="h-4 w-20 rounded" />
                    <Skeleton className="h-4 w-14 rounded" />
                  </div>
                </div>
              ) : data?.question ? (
                <>
                  <div className="flex items-start">
                    <div className="mr-3 mt-1 flex flex-col items-center">
                      <button 
                        className={`text-neutral-400 hover:text-primary ${votingQuestion ? 'animate-pulse' : ''}`}
                        disabled={votingQuestion}
                        onClick={() => {
                          setVotingQuestion(true);
                          voteQuestionMutation.mutate(1);
                        }}
                      >
                        <span className="material-icons text-sm">arrow_drop_up</span>
                      </button>
                      <span className="text-sm font-medium text-neutral-700">{data.question.votes}</span>
                      <button 
                        className={`text-neutral-400 hover:text-neutral-700 ${votingQuestion ? 'animate-pulse' : ''}`}
                        disabled={votingQuestion}
                        onClick={() => {
                          setVotingQuestion(true);
                          voteQuestionMutation.mutate(-1);
                        }}
                      >
                        <span className="material-icons text-sm">arrow_drop_down</span>
                      </button>
                    </div>
                    <div className="flex-1">
                      <h1 className="text-xl font-bold text-neutral-800 mb-3">{data.question.title}</h1>
                      <div className="flex items-center text-sm text-neutral-500 mb-4">
                        <div className="h-5 w-5 rounded-full bg-primary text-white flex items-center justify-center overflow-hidden text-xs">
                          {data.question.userId === user?.id ? "Du" : data.question.userId}
                        </div>
                        <span className="ml-2">Gefragt {formatDate(data.question.createdAt)}</span>
                      </div>
                      <div className="prose prose-sm max-w-none mb-4">
                        <p>{data.question.content}</p>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {data.question.tags && Array.isArray(data.question.tags) && data.question.tags.map((tag, i) => (
                          <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-neutral-200">
                    <h2 className="text-lg font-bold text-neutral-800 mb-4">
                      {data.answers?.length || 0} Antworten
                    </h2>
                    
                    {data.answers && data.answers.length > 0 ? (
                      <div className="space-y-6">
                        {data.answers.map(answer => (
                          <div key={answer.id} className="border-b border-neutral-200 pb-6 last:border-b-0">
                            <div className="flex items-start">
                              <div className="mr-3 mt-1 flex flex-col items-center">
                                <button 
                                  className={`text-neutral-400 hover:text-primary ${votingAnswer === answer.id ? 'animate-pulse' : ''}`}
                                  disabled={votingAnswer === answer.id}
                                  onClick={() => {
                                    setVotingAnswer(answer.id);
                                    voteAnswerMutation.mutate({ answerId: answer.id, value: 1 });
                                  }}
                                >
                                  <span className="material-icons text-sm">arrow_drop_up</span>
                                </button>
                                <span className="text-sm font-medium text-neutral-700">{answer.votes}</span>
                                <button 
                                  className={`text-neutral-400 hover:text-neutral-700 ${votingAnswer === answer.id ? 'animate-pulse' : ''}`}
                                  disabled={votingAnswer === answer.id}
                                  onClick={() => {
                                    setVotingAnswer(answer.id);
                                    voteAnswerMutation.mutate({ answerId: answer.id, value: -1 });
                                  }}
                                >
                                  <span className="material-icons text-sm">arrow_drop_down</span>
                                </button>
                              </div>
                              <div className="flex-1">
                                <div className="prose prose-sm max-w-none mb-2">
                                  <p>{answer.content}</p>
                                </div>
                                <div className="flex items-center text-xs text-neutral-500">
                                  <div className="h-4 w-4 rounded-full bg-primary text-white flex items-center justify-center overflow-hidden text-[10px]">
                                    {answer.userId === user?.id ? "Du" : answer.userId}
                                  </div>
                                  <span className="ml-2">Beantwortet {formatDate(answer.createdAt)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-neutral-500 bg-neutral-50 rounded-lg">
                        Noch keine Antworten. Sei der Erste, der diese Frage beantwortet!
                      </div>
                    )}

                    <div className="mt-8">
                      <h3 className="text-lg font-bold text-neutral-800 mb-4">Deine Antwort</h3>
                      
                      {user ? (
                        <Form {...form}>
                          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                              control={form.control}
                              name="content"
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Textarea
                                      placeholder="Schreibe deine Antwort hier..."
                                      className="min-h-[150px]"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <Button 
                              type="submit" 
                              className="w-full md:w-auto"
                              disabled={submitAnswerMutation.isPending}
                            >
                              {submitAnswerMutation.isPending ? (
                                <span className="material-icons animate-spin mr-2">refresh</span>
                              ) : null}
                              Antwort absenden
                            </Button>
                          </form>
                        </Form>
                      ) : (
                        <div className="text-center py-6 text-neutral-500 bg-neutral-50 rounded-lg">
                          Du musst angemeldet sein, um antworten zu können.
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-neutral-500">
                  Frage nicht gefunden oder wurde gelöscht.
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
