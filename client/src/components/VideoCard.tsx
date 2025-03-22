import { VideoWithUser } from "@shared/schema";
import { Heart, MessageSquare, Share, Plus, Music } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { cn } from "@/lib/utils";

interface VideoCardProps {
  video: VideoWithUser;
  currentUserId?: number;
}

export default function VideoCard({ video, currentUserId }: VideoCardProps) {
  const { user, description, thumbnailUrl, soundName, likeCount, commentCount, shareCount, isLiked } = video;
  
  // Like mutation
  const likeMutation = useMutation({
    mutationFn: async () => {
      if (isLiked) {
        await apiRequest("DELETE", "/api/likes", { videoId: video.id });
      } else {
        await apiRequest("POST", "/api/likes", { videoId: video.id });
      }
    },
    onSuccess: () => {
      // Invalidate the feed query to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/videos/feed"] });
    }
  });

  const handleLikeClick = () => {
    if (!currentUserId) return;
    likeMutation.mutate();
  };

  return (
    <div className="video-card snap-start h-full relative bg-black flex items-center justify-center">
      <div className="video-container w-full relative">
        <img src={thumbnailUrl} alt="Video thumbnail" className="w-full h-full object-cover" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-16 w-16 rounded-full bg-black bg-opacity-30 flex items-center justify-center">
            <svg className="h-12 w-12 text-white text-opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        
        {/* Video Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <h3 className="font-semibold">@{user.username}</h3>
          <p className="text-sm">{description}</p>
          <div className="flex items-center mt-1">
            <Music className="h-4 w-4 mr-2" />
            <p className="text-sm">{soundName}</p>
          </div>
        </div>
        
        {/* Video Actions */}
        <div className="absolute right-4 bottom-20 flex flex-col items-center space-y-4">
          <button 
            className="text-white flex flex-col items-center"
            onClick={handleLikeClick}
            disabled={likeMutation.isPending}
          >
            <div className={cn(
              "w-10 h-10 rounded-full bg-gray-800 bg-opacity-50 flex items-center justify-center",
              isLiked ? "text-red-500" : "text-white"
            )}>
              <Heart className="h-6 w-6" fill={isLiked ? "currentColor" : "none"} />
            </div>
            <span className="text-xs mt-1">{likeCount || 0}</span>
          </button>
          
          <button className="text-white flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-gray-800 bg-opacity-50 flex items-center justify-center">
              <MessageSquare className="h-6 w-6" />
            </div>
            <span className="text-xs mt-1">{commentCount || 0}</span>
          </button>
          
          <button className="text-white flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-gray-800 bg-opacity-50 flex items-center justify-center">
              <Share className="h-6 w-6" />
            </div>
            <span className="text-xs mt-1">{shareCount || 0}</span>
          </button>
        </div>
        
        {/* Profile Button */}
        <div className="absolute right-4 bottom-96 flex flex-col items-center">
          <div className="w-12 h-12 rounded-full border-2 border-white overflow-hidden">
            <img src={user.profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
          </div>
          <div className="w-6 h-6 bg-[#FE2C55] rounded-full flex items-center justify-center -mt-3">
            <Plus className="h-4 w-4 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}
