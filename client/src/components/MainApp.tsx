import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import Header from "./Header";
import BottomNavigation from "./BottomNavigation";
import SocialFeedScreen from "../pages/SocialFeedScreen";
import VideoFeedScreen from "../pages/VideoFeedScreen";
import NotificationsScreen from "../pages/NotificationsScreen";
import ProfileScreen from "../pages/ProfileScreen";
import NewPostModal from "./NewPostModal";
import { ScreenType } from "../App";

export default function MainApp() {
  const { user, isLoading } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<ScreenType>("social-feed");
  const [showNewPostModal, setShowNewPostModal] = useState(false);

  // Handle screen switching logic
  const handleScreenChange = (screen: ScreenType) => {
    setCurrentScreen(screen);
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="app-container max-w-md mx-auto h-[100dvh] overflow-hidden flex flex-col bg-white">
      <Header 
        title={getScreenTitle(currentScreen)} 
        currentUser={user}
        notificationCount={3} // This would come from a real notification count
        messageCount={2} // This would come from a real message count
      />
      
      <main className="flex-1 overflow-hidden relative">
        <div className="h-full" style={{ 
          display: currentScreen === "social-feed" ? "block" : "none" 
        }}>
          <SocialFeedScreen currentUser={user} />
        </div>
        
        <div className="h-full" style={{ 
          display: currentScreen === "video-feed" ? "block" : "none" 
        }}>
          <VideoFeedScreen currentUser={user} />
        </div>
        
        <div className="h-full" style={{ 
          display: currentScreen === "notifications" ? "block" : "none" 
        }}>
          <NotificationsScreen currentUser={user} />
        </div>
        
        <div className="h-full" style={{ 
          display: currentScreen === "profile" ? "block" : "none" 
        }}>
          <ProfileScreen currentUser={user || undefined} />
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
        currentUser={user}
      />
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