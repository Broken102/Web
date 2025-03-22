import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { User, PostWithUser } from "@shared/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Camera, Share, MapPin } from "lucide-react";
import PostCard from "@/components/PostCard";
import { Skeleton } from "@/components/ui/skeleton";

interface ProfileScreenProps {
  currentUser?: User;
  userId?: number;
}

export default function ProfileScreen({ currentUser, userId }: ProfileScreenProps) {
  const [activeTab, setActiveTab] = useState("posts");
  const profileUserId = userId || currentUser?.id || 1;
  
  // Fetch user data if viewing someone else's profile
  const { data: profileUser, isLoading: isLoadingUser } = useQuery<User>({
    queryKey: [`/api/users/${profileUserId}`],
    enabled: !!profileUserId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    // Initialize with currentUser if it's the user's own profile
    initialData: profileUserId === currentUser?.id ? currentUser : undefined,
  });
  
  // Fetch user's posts
  const { data: userPosts, isLoading: isLoadingPosts } = useQuery<PostWithUser[]>({
    queryKey: [`/api/users/${profileUserId}/posts`],
    enabled: !!profileUserId,
    staleTime: 60 * 1000, // 1 minute
  });
  
  const isOwnProfile = currentUser?.id === profileUserId;
  
  if (isLoadingUser) {
    return <ProfileSkeleton />;
  }
  
  if (!profileUser) {
    return (
      <div className="h-full overflow-y-auto bg-white flex items-center justify-center p-4 text-center">
        <div>
          <h2 className="text-xl font-semibold mb-2">User Not Found</h2>
          <p className="text-gray-600">The requested profile could not be found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-white">
      {/* Profile Header */}
      <div className="relative">
        <div className="h-36 bg-gray-300 relative">
          <img 
            src={profileUser.coverImageUrl || "https://images.unsplash.com/photo-1504805572947-34fad45aed93"} 
            alt="Cover" 
            className="w-full h-full object-cover"
          />
          {isOwnProfile && (
            <button className="absolute bottom-3 right-3 bg-gray-200 bg-opacity-70 p-2 rounded-full">
              <Camera className="h-5 w-5 text-gray-700" />
            </button>
          )}
        </div>
        
        <div className="absolute -bottom-16 left-4 w-32 h-32 rounded-full border-4 border-white bg-gray-200 overflow-hidden">
          <Avatar className="w-full h-full">
            <AvatarImage src={profileUser.profileImageUrl} alt={profileUser.displayName} />
            <AvatarFallback>{profileUser.displayName.charAt(0)}</AvatarFallback>
          </Avatar>
          {isOwnProfile && (
            <button className="absolute bottom-0 right-0 bg-gray-200 p-2 rounded-full">
              <Camera className="h-5 w-5 text-gray-700" />
            </button>
          )}
        </div>
      </div>
      
      {/* Profile Info */}
      <div className="mt-16 px-4">
        <h1 className="text-2xl font-bold text-gray-800">{profileUser.displayName}</h1>
        <p className="text-gray-500">{profileUser.bio || "No bio yet"}</p>
        {profileUser.location && (
          <div className="flex items-center mt-1 text-sm text-gray-500">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{profileUser.location}</span>
          </div>
        )}
        
        {/* Profile Stats */}
        <div className="flex justify-between mt-4 text-sm">
          <div className="text-center">
            <div className="font-bold text-gray-800">1,258</div>
            <div className="text-gray-500">Friends</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-gray-800">32K</div>
            <div className="text-gray-500">Followers</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-gray-800">245</div>
            <div className="text-gray-500">Following</div>
          </div>
        </div>
        
        {/* Profile Actions */}
        <div className="flex space-x-2 mt-4">
          {isOwnProfile ? (
            <Button className="flex-1" variant="default">
              <Camera className="h-4 w-4 mr-1" /> Edit Profile
            </Button>
          ) : (
            <Button className="flex-1" variant="default">
              Follow
            </Button>
          )}
          <Button className="flex-1" variant="outline">
            <Share className="h-4 w-4 mr-1" /> Share Profile
          </Button>
        </div>
        
        {/* Profile Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="w-full justify-between bg-transparent border-b border-gray-200">
            <TabsTrigger 
              value="posts" 
              className="data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary py-3 px-4 font-medium data-[state=inactive]:text-gray-500"
            >
              Posts
            </TabsTrigger>
            <TabsTrigger 
              value="videos" 
              className="data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary py-3 px-4 font-medium data-[state=inactive]:text-gray-500"
            >
              Videos
            </TabsTrigger>
            <TabsTrigger 
              value="photos" 
              className="data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary py-3 px-4 font-medium data-[state=inactive]:text-gray-500"
            >
              Photos
            </TabsTrigger>
            <TabsTrigger 
              value="about" 
              className="data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary py-3 px-4 font-medium data-[state=inactive]:text-gray-500"
            >
              About
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        {/* Profile Content */}
        <div className="py-4">
          {activeTab === "posts" && (
            <>
              {isLoadingPosts ? (
                // Loading skeleton
                [...Array(2)].map((_, i) => (
                  <div key={i} className="mb-4 bg-white rounded-lg border border-gray-200 p-4 space-y-3">
                    <div className="flex items-center space-x-2">
                      <Skeleton className="w-8 h-8 rounded-full" />
                      <div className="space-y-1">
                        <Skeleton className="w-32 h-4" />
                        <Skeleton className="w-24 h-3" />
                      </div>
                    </div>
                    <Skeleton className="w-full h-16" />
                    <Skeleton className="w-full h-48 rounded-lg" />
                  </div>
                ))
              ) : userPosts && userPosts.length > 0 ? (
                // User posts
                userPosts.map((post) => (
                  <PostCard 
                    key={post.id} 
                    post={post} 
                    currentUserId={currentUser?.id}
                  />
                ))
              ) : (
                // Empty state
                <div className="text-center py-8 text-gray-500">
                  <p>No posts yet</p>
                  {isOwnProfile && (
                    <p className="mt-2">Create your first post to share with friends!</p>
                  )}
                </div>
              )}
            </>
          )}
          
          {activeTab === "videos" && (
            <div className="text-center py-8 text-gray-500">
              <p>No videos yet</p>
            </div>
          )}
          
          {activeTab === "photos" && (
            <div className="text-center py-8 text-gray-500">
              <p>No photos yet</p>
            </div>
          )}
          
          {activeTab === "about" && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-800 mb-1">Bio</h3>
                <p className="text-gray-600">{profileUser.bio || "No bio yet"}</p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-800 mb-1">Location</h3>
                <p className="text-gray-600">{profileUser.location || "Not specified"}</p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-800 mb-1">Username</h3>
                <p className="text-gray-600">@{profileUser.username}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="h-full overflow-y-auto bg-white">
      <Skeleton className="h-36 w-full" />
      <div className="mt-16 px-4">
        <div className="absolute -top-16 left-4 w-32 h-32">
          <Skeleton className="w-full h-full rounded-full" />
        </div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64 mb-2" />
        <Skeleton className="h-4 w-32 mb-4" />
        
        <div className="flex justify-between mt-4 mb-4">
          <Skeleton className="h-12 w-28" />
          <Skeleton className="h-12 w-28" />
          <Skeleton className="h-12 w-28" />
        </div>
        
        <div className="flex space-x-2 mt-4 mb-6">
          <Skeleton className="h-10 w-1/2" />
          <Skeleton className="h-10 w-1/2" />
        </div>
        
        <Skeleton className="h-12 w-full mb-6" />
        
        <div className="space-y-4">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    </div>
  );
}
