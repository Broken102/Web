import { Toaster } from "@/components/ui/toaster";
import { Switch, Route } from "wouter";
import NotFound from "@/pages/not-found";
import AuthPage from "./pages/AuthPage";
import { AuthProvider } from "@/hooks/use-auth";
import ProtectedHome from "./components/ProtectedHome";

// Main App component doesn't directly use useAuth
function App() {
  return (
    <>
      <Switch>
        <Route path="/auth">
          <AuthProvider>
            <AuthPage />
          </AuthProvider>
        </Route>
        <Route path="/">
          <AuthProvider>
            <ProtectedHome />
          </AuthProvider>
        </Route>
        <Route>
          <NotFound />
        </Route>
      </Switch>
      <Toaster />
    </>
  );
}

export type ScreenType = "social-feed" | "video-feed" | "notifications" | "profile";

export default App;
