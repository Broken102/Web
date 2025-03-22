import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "./components/Header";
import BottomNavigation from "./components/BottomNavigation";
import SocialFeedScreen from "./pages/SocialFeedScreen";
import VideoFeedScreen from "./pages/VideoFeedScreen";
import NotificationsScreen from "./pages/NotificationsScreen";
import ProfileScreen from "./pages/ProfileScreen";
import NewPostModal from "./components/NewPostModal";
import { User } from "@shared/schema";

export type ScreenType = "social-feed" | "video-feed" | "notifications" | "profile";

function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>("social-feed");
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  
  // Get current user info if logged in
  const { data: currentUser, isLoading } = useQuery<User | null>({
    queryKey: ["/api/auth/me"],
    // On 401, return null instead of throwing
    queryFn: async ({ queryKey }) => {
      try {
        const res = await fetch(queryKey[0] as string, {
          credentials: "include",
        });
        
        if (res.status === 401) {
          return null;
        }
        
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`${res.status}: ${text}`);
        }
        
        return await res.json();
      } catch (error) {
        console.error("Auth error:", error);
        return null;
      }
    },
  });

  // Handle screen switching logic
  const handleScreenChange = (screen: ScreenType) => {
    setCurrentScreen(screen);
  };

  // Render the app based on auth state
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // Currently we're designing a demo so we allow access without login
  // In a real app we would redirect to login if !currentUser
  
  return (
    <div className="app-container max-w-md mx-auto h-[100dvh] overflow-hidden flex flex-col bg-white">
      <Header 
        title={getScreenTitle(currentScreen)} 
        currentUser={currentUser}
        notificationCount={3} // This would come from a real notification count
        messageCount={2} // This would come from a real message count
      />
      
      <main className="flex-1 overflow-hidden relative">
        <div className="h-full" style={{ 
          display: currentScreen === "social-feed" ? "block" : "none" 
        }}>
          <SocialFeedScreen currentUser={currentUser} />
        </div>
        
        <div className="h-full" style={{ 
          display: currentScreen === "video-feed" ? "block" : "none" 
        }}>
          <VideoFeedScreen currentUser={currentUser} />
        </div>
        
        <div className="h-full" style={{ 
          display: currentScreen === "notifications" ? "block" : "none" 
        }}>
          <NotificationsScreen currentUser={currentUser} />
        </div>
        
        <div className="h-full" style={{ 
          display: currentScreen === "profile" ? "block" : "none" 
        }}>
          <ProfileScreen currentUser={currentUser || undefined} />
        </div>
      </main>
      
      <BottomNavigation 
        currentScreen={currentScreen} 
        onScreenChange={handleScreenChange}
        onNewPost={() => setShowNewPostModal(true)}
      />
      
      <NewPostModal 
        isOpen={showNewPostModal}
        onClose={() => setShowNewPostModal(false)}
        currentUser={currentUser}
      />
      
      <Toaster />
    </div>
  );
}

function getScreenTitle(screen: ScreenType): string {
  switch (screen) {
    case "social-feed":
      return "SocialVid";
    case "video-feed":
      return "Videos";
    case "notifications":
      return "Notifications";
    case "profile":
      return "Profile";
    default:
      return "SocialVid";
  }
}

export default App;
