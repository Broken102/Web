import { Switch, Route, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import AuthPage from "./pages/AuthPage";
import MainApp from "./components/MainApp";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

function App() {
  const { user, isLoading } = useAuth();
  const [location, setLocation] = useLocation();
  
  // Handle authentication protection
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // If user is not logged in and not on auth page, redirect to auth
  if (!user && location !== "/auth") {
    setLocation("/auth");
    return null;
  }
  
  // If user is logged in and on auth page, redirect to home
  if (user && location === "/auth") {
    setLocation("/");
    return null;
  }
  
  return (
    <>
      <Switch>
        <Route path="/auth" component={AuthPage} />
        <Route path="/">
          <MainApp />
        </Route>
        <Route component={NotFound} />
      </Switch>
      <Toaster />
    </>
  );
}

export type ScreenType = "social-feed" | "video-feed" | "notifications" | "profile";

export default App;
