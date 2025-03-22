import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { PostWithUser, StoryWithUser, User } from "@shared/schema";
import StoryList from "@/components/StoryList";
import CreatePostCard from "@/components/CreatePostCard";
import PostCard from "@/components/PostCard";
import { Skeleton } from "@/components/ui/skeleton";

interface SocialFeedScreenProps {
  currentUser: User | null;
}

export default function SocialFeedScreen({ currentUser }: SocialFeedScreenProps) {
  const [showNewPost, setShowNewPost] = useState(false);
  
  // Fetch posts for the feed
  const { data: posts, isLoading: isLoadingPosts } = useQuery<PostWithUser[]>({
    queryKey: ["/api/posts/feed"],
    staleTime: 60 * 1000, // 1 minute
  });
  
  // Fetch stories
  const { data: stories, isLoading: isLoadingStories } = useQuery<StoryWithUser[]>({
    queryKey: ["/api/stories"],
    staleTime: 60 * 1000, // 1 minute
  });

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      {/* Stories section */}
      {isLoadingStories ? (
        <div className="p-4">
          <div className="flex space-x-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex flex-col items-center space-y-1">
                <Skeleton className="w-16 h-16 rounded-full" />
                <Skeleton className="w-12 h-3" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <StoryList
          stories={stories || []}
          onAddStory={() => alert("Add story feature coming soon!")}
        />
      )}
      
      {/* Create Post Card */}
      <CreatePostCard
        currentUser={currentUser}
        onCreatePost={() => setShowNewPost(true)}
      />
      
      {/* Feed Posts */}
      {isLoadingPosts ? (
        <div className="space-y-4 p-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-4 space-y-3">
              <div className="flex items-center space-x-2">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="w-32 h-4" />
                  <Skeleton className="w-24 h-3" />
                </div>
              </div>
              <Skeleton className="w-full h-16" />
              <Skeleton className="w-full h-48 rounded-lg" />
            </div>
          ))}
        </div>
      ) : posts && posts.length > 0 ? (
        posts.map((post) => (
          <PostCard 
            key={post.id} 
            post={post} 
            currentUserId={currentUser?.id}
          />
        ))
      ) : (
        <div className="flex flex-col items-center justify-center p-8 text-gray-500">
          <p>No posts in your feed yet.</p>
          <p>Try following more people or creating your first post!</p>
        </div>
      )}
    </div>
  );
}
