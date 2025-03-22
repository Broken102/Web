import { Home, Play, Plus, Bell, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScreenType } from "../App";

interface BottomNavigationProps {
  currentScreen: ScreenType;
  onScreenChange: (screen: ScreenType) => void;
  onNewPost: () => void;
}

export default function BottomNavigation({
  currentScreen,
  onScreenChange,
  onNewPost
}: BottomNavigationProps) {
  return (
    <nav className="bg-white border-t border-gray-200 py-2 px-4">
      <div className="flex justify-between">
        <NavButton 
          icon={<Home className="h-6 w-6" />} 
          label="Home"
          isActive={currentScreen === "social-feed"}
          onClick={() => onScreenChange("social-feed")}
        />
        
        <NavButton 
          icon={<Play className="h-6 w-6" />} 
          label="Videos"
          isActive={currentScreen === "video-feed"}
          onClick={() => onScreenChange("video-feed")}
        />
        
        <NewPostButton onClick={onNewPost} />
        
        <NavButton 
          icon={<Bell className="h-6 w-6" />} 
          label="Alerts"
          isActive={currentScreen === "notifications"}
          onClick={() => onScreenChange("notifications")}
        />
        
        <NavButton 
          icon={<User className="h-6 w-6" />} 
          label="Profile"
          isActive={currentScreen === "profile"}
          onClick={() => onScreenChange("profile")}
        />
      </div>
    </nav>
  );
}

interface NavButtonProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

function NavButton({ icon, label, isActive, onClick }: NavButtonProps) {
  return (
    <button 
      className={cn(
        "flex flex-col items-center w-1/5",
        isActive ? "text-primary" : "text-gray-500"
      )}
      onClick={onClick}
    >
      {icon}
      <span className="text-xs mt-1">{label}</span>
    </button>
  );
}

interface NewPostButtonProps {
  onClick: () => void;
}

function NewPostButton({ onClick }: NewPostButtonProps) {
  return (
    <button className="flex flex-col items-center w-1/5" onClick={onClick}>
      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-[#FE2C55] flex items-center justify-center text-white">
        <Plus className="h-6 w-6" />
      </div>
    </button>
  );
}
