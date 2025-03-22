import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus } from "lucide-react";
import { StoryWithUser } from "@shared/schema";

interface StoryProps {
  story?: StoryWithUser;
  isAddStory?: boolean;
  username?: string;
  imageUrl?: string;
  onClick?: () => void;
}

export default function Story({ 
  story, 
  isAddStory = false,
  username,
  imageUrl,
  onClick 
}: StoryProps) {
  const displayName = story?.user.displayName || username || "Your Story";
  const profileImage = story?.user.profileImageUrl || imageUrl;
  
  return (
    <div className="flex flex-col items-center space-y-1" onClick={onClick}>
      <div className={cn(
        "w-16 h-16 rounded-full",
        isAddStory ? "border-2 border-primary flex items-center justify-center" : "border-2 border-primary p-1"
      )}>
        {isAddStory ? (
          <div className="w-14 h-14 rounded-full bg-gray-200 relative">
            <Plus className="absolute text-primary text-lg" style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} />
          </div>
        ) : (
          <Avatar className="w-full h-full">
            <AvatarImage src={profileImage} alt={displayName} />
            <AvatarFallback>{displayName.charAt(0)}</AvatarFallback>
          </Avatar>
        )}
      </div>
      <span className="text-xs text-gray-700 truncate max-w-[64px] text-center">
        {isAddStory ? "Your Story" : displayName.split(' ')[0]}
      </span>
    </div>
  );
}
