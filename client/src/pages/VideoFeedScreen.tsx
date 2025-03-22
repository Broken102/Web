import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { VideoWithUser, User } from "@shared/schema";
import VideoCard from "@/components/VideoCard";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

interface VideoFeedScreenProps {
  currentUser: User | null;
}

export default function VideoFeedScreen({ currentUser }: VideoFeedScreenProps) {
  const [activeTab, setActiveTab] = useState<string>("for-you");
  
  // Fetch videos for the feed
  const { data: videos, isLoading } = useQuery<VideoWithUser[]>({
    queryKey: ["/api/videos/feed"],
    staleTime: 60 * 1000, // 1 minute
  });

  return (
    <div className="h-full overflow-hidden">
      {/* Video feed tabs */}
      <div className="bg-black text-white border-b border-gray-800">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-center bg-transparent h-auto py-2">
            <TabsTrigger 
              value="for-you" 
              className="data-[state=active]:text-[#FE2C55] data-[state=active]:border-b-2 data-[state=active]:border-[#FE2C55] text-white bg-transparent py-1 px-6 font-semibold data-[state=inactive]:text-gray-400"
            >
              For You
            </TabsTrigger>
            <TabsTrigger 
              value="following" 
              className="data-[state=active]:text-[#FE2C55] data-[state=active]:border-b-2 data-[state=active]:border-[#FE2C55] text-white bg-transparent py-1 px-6 font-semibold data-[state=inactive]:text-gray-400"
            >
              Following
            </TabsTrigger>
            <TabsTrigger 
              value="discover" 
              className="data-[state=active]:text-[#FE2C55] data-[state=active]:border-b-2 data-[state=active]:border-[#FE2C55] text-white bg-transparent py-1 px-6 font-semibold data-[state=inactive]:text-gray-400"
            >
              Discover
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {/* Vertical scrolling video feed */}
      <div className="h-[calc(100%-40px)] bg-black overflow-y-scroll snap-y snap-mandatory">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <Skeleton className="w-full h-full bg-gray-900" />
          </div>
        ) : videos && videos.length > 0 ? (
          videos.map((video) => (
            <VideoCard 
              key={video.id} 
              video={video} 
              currentUserId={currentUser?.id}
            />
          ))
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-white p-8 text-center">
            <p className="text-lg font-semibold mb-2">No videos to show</p>
            <p className="text-gray-400">Follow creators to see more videos in your feed</p>
          </div>
        )}
      </div>
    </div>
  );
}
