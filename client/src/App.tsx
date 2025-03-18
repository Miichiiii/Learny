import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import { AuthProvider } from "./hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import DashboardPage from "./pages/dashboard-page";
import AuthPage from "./pages/auth-page";
import LeaderboardPage from "./pages/leaderboard-page";
import BadgesPage from "./pages/badges-page";
import ProfilePage from "./pages/profile-page";
import CoursesPage from "./pages/courses-page";
import QuestionsPage from "./pages/questions-page";
import QuestionDetailPage from "./pages/question-detail-page";
import AskQuestionPage from "./pages/ask-question-page";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={DashboardPage} />
      <ProtectedRoute path="/leaderboard" component={LeaderboardPage} />
      <ProtectedRoute path="/badges" component={BadgesPage} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <ProtectedRoute path="/courses" component={CoursesPage} />
      <ProtectedRoute path="/questions" component={QuestionsPage} />
      <ProtectedRoute path="/questions/:id" component={QuestionDetailPage} />
      <ProtectedRoute path="/ask-question" component={AskQuestionPage} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
