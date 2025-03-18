import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertQuestionSchema } from "@shared/schema";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import Navbar from "@/components/layout/navbar";
import Sidebar from "@/components/layout/sidebar";
import MobileNavigation from "@/components/layout/mobile-navigation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Extend the question schema with client-side validation
const questionFormSchema = insertQuestionSchema.pick({
  title: true,
  content: true,
  tags: true,
}).extend({
  title: z.string().min(10, "Titel muss mindestens 10 Zeichen lang sein").max(100, "Titel darf maximal 100 Zeichen lang sein"),
  content: z.string().min(20, "Beschreibung muss mindestens 20 Zeichen lang sein"),
  tags: z.array(z.string()).min(1, "Mindestens ein Tag ist erforderlich"),
  tagInput: z.string().optional(),
});

type QuestionFormValues = Omit<z.infer<typeof questionFormSchema>, 'tagInput'>;

export default function AskQuestionPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const form = useForm<z.infer<typeof questionFormSchema>>({
    resolver: zodResolver(questionFormSchema),
    defaultValues: {
      title: "",
      content: "",
      tags: [],
      tagInput: "",
    },
  });

  const submitQuestionMutation = useMutation({
    mutationFn: async (values: QuestionFormValues) => {
      const res = await apiRequest("POST", "/api/questions", values);
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Frage gestellt",
        description: "Deine Frage wurde erfolgreich veröffentlicht.",
      });
      
      // Invalidate activities to reflect points earned
      queryClient.invalidateQueries({ queryKey: ["/api/user/activities"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/level-details"] });
      
      // Navigate to the question detail page
      navigate(`/questions/${data.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Fehler",
        description: `Beim Stellen deiner Frage ist ein Fehler aufgetreten: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: z.infer<typeof questionFormSchema>) => {
    const { tagInput, ...questionData } = values;
    submitQuestionMutation.mutate(questionData);
  };

  const handleAddTag = () => {
    const tagInput = form.getValues("tagInput")?.trim();
    if (!tagInput) return;
    
    const currentTags = form.getValues("tags");
    if (currentTags.includes(tagInput)) {
      form.setError("tagInput", { 
        type: "manual", 
        message: "Dieser Tag existiert bereits" 
      });
      return;
    }
    
    form.setValue("tags", [...currentTags, tagInput]);
    form.setValue("tagInput", "");
    form.clearErrors("tags");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const currentTags = form.getValues("tags");
    form.setValue("tags", currentTags.filter(tag => tag !== tagToRemove));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddTag();
    }
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
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="text-xl">Frage stellen</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Titel</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Wie lautet deine Frage? Sei spezifisch."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Beschreibung</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Beschreibe deine Frage ausführlich. Füge relevante Details hinzu."
                              className="min-h-[200px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div>
                      <FormField
                        control={form.control}
                        name="tagInput"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tags</FormLabel>
                            <div className="flex space-x-2">
                              <FormControl>
                                <Input 
                                  placeholder="Tag hinzufügen (Enter drücken)"
                                  {...field}
                                  onKeyDown={handleTagInputKeyDown}
                                />
                              </FormControl>
                              <Button 
                                type="button" 
                                variant="outline"
                                onClick={handleAddTag}
                              >
                                Hinzufügen
                              </Button>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="tags"
                        render={() => (
                          <FormItem>
                            <div className="flex flex-wrap gap-2 mt-3">
                              {form.getValues("tags").map((tag, index) => (
                                <div 
                                  key={index} 
                                  className="flex items-center bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded"
                                >
                                  {tag}
                                  <button 
                                    type="button"
                                    className="ml-1 text-blue-600 hover:text-blue-800"
                                    onClick={() => handleRemoveTag(tag)}
                                  >
                                    <span className="material-icons text-xs">close</span>
                                  </button>
                                </div>
                              ))}
                              {form.getValues("tags").length === 0 && (
                                <div className="text-sm text-neutral-500">
                                  Noch keine Tags hinzugefügt
                                </div>
                              )}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="flex gap-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate("/questions")}
                      >
                        Abbrechen
                      </Button>
                      <Button 
                        type="submit"
                        disabled={submitQuestionMutation.isPending}
                      >
                        {submitQuestionMutation.isPending ? (
                          <span className="material-icons animate-spin mr-2">refresh</span>
                        ) : null}
                        Frage veröffentlichen
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      <MobileNavigation />
    </div>
  );
}
