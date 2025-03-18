import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { insertUserSchema } from "@shared/schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Extend the schema with client-side validation
const loginSchema = insertUserSchema.pick({
  username: true,
  password: true,
}).extend({
  username: z.string().min(3, "Benutzername muss mindestens 3 Zeichen lang sein"),
  password: z.string().min(6, "Passwort muss mindestens 6 Zeichen lang sein"),
});

const registerSchema = insertUserSchema.extend({
  username: z.string().min(3, "Benutzername muss mindestens 3 Zeichen lang sein"),
  email: z.string().email("Bitte gib eine gültige E-Mail-Adresse ein"),
  password: z.string().min(6, "Passwort muss mindestens 6 Zeichen lang sein"),
  confirmPassword: z.string().min(6, "Passwort muss mindestens 6 Zeichen lang sein"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwörter stimmen nicht überein",
  path: ["confirmPassword"],
});

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<string>("login");

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Login form
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Register form
  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Submit handlers
  const onLoginSubmit = (values: z.infer<typeof loginSchema>) => {
    loginMutation.mutate(values);
  };

  const onRegisterSubmit = (values: z.infer<typeof registerSchema>) => {
    const { confirmPassword, ...userData } = values;
    registerMutation.mutate(userData);
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col md:flex-row items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-2">
              <span className="material-icons text-4xl text-primary">school</span>
            </div>
            <CardTitle className="text-2xl font-bold text-neutral-800">FinanzWissen</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-2 mb-6">
                <TabsTrigger value="login">Anmelden</TabsTrigger>
                <TabsTrigger value="register">Registrieren</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Benutzername</FormLabel>
                          <FormControl>
                            <Input placeholder="Dein Benutzername" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Passwort</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Dein Passwort" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? (
                        <span className="material-icons animate-spin mr-2">refresh</span>
                      ) : null}
                      Anmelden
                    </Button>
                  </form>
                </Form>
                <div className="mt-4 text-center text-sm text-neutral-500">
                  Noch kein Konto?{" "}
                  <button 
                    className="text-primary font-medium"
                    onClick={() => setActiveTab("register")}
                  >
                    Registrieren
                  </button>
                </div>
              </TabsContent>
              
              <TabsContent value="register">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Benutzername</FormLabel>
                          <FormControl>
                            <Input placeholder="Wähle einen Benutzernamen" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>E-Mail</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="Deine E-Mail-Adresse" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Passwort</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Wähle ein sicheres Passwort" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Passwort bestätigen</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Passwort erneut eingeben" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? (
                        <span className="material-icons animate-spin mr-2">refresh</span>
                      ) : null}
                      Registrieren
                    </Button>
                  </form>
                </Form>
                <div className="mt-4 text-center text-sm text-neutral-500">
                  Bereits ein Konto?{" "}
                  <button 
                    className="text-primary font-medium"
                    onClick={() => setActiveTab("login")}
                  >
                    Anmelden
                  </button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      <div className="hidden md:block md:w-1/2 p-8">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold text-neutral-800 mb-4">
            Finanzwissen interaktiv lernen
          </h1>
          <p className="text-neutral-600 mb-6">
            Entdecke die Welt der Finanzen mit unserem gamifizierten Lernansatz. Sammle Punkte, verdiene Abzeichen und steige im Level auf, während du dein Finanzwissen erweiterst.
          </p>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-primary bg-opacity-10 p-2 rounded-full">
                <span className="material-icons text-primary">stars</span>
              </div>
              <div className="ml-4">
                <h3 className="font-medium text-neutral-800">Sammle Punkte</h3>
                <p className="text-sm text-neutral-600">Schließe Lektionen ab, beantworte Fragen und steige in der Rangliste auf</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-accent bg-opacity-10 p-2 rounded-full">
                <span className="material-icons text-accent">emoji_events</span>
              </div>
              <div className="ml-4">
                <h3 className="font-medium text-neutral-800">Verdiene Abzeichen</h3>
                <p className="text-sm text-neutral-600">Schließe Herausforderungen ab und schalte Erfolgsabzeichen frei</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-secondary bg-opacity-10 p-2 rounded-full">
                <span className="material-icons text-secondary">people</span>
              </div>
              <div className="ml-4">
                <h3 className="font-medium text-neutral-800">Lerne gemeinsam</h3>
                <p className="text-sm text-neutral-600">Stelle Fragen, teile dein Wissen und lerne von anderen Mitgliedern</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
