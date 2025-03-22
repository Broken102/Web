import { PostWithUser } from "@shared/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoreHorizontal, ThumbsUp, MessageSquare, Share } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { cn } from "@/lib/utils";

interface PostCardProps {
  post: PostWithUser;
  currentUserId?: number;
}

export default function PostCard({ post, currentUserId }: PostCardProps) {
  const { user, content, imageUrl, createdAt, likeCount, commentCount, shareCount, isLiked } = post;
  
  // Like mutation
  const likeMutation = useMutation({
    mutationFn: async () => {
      if (isLiked) {
        await apiRequest("DELETE", "/api/likes", { postId: post.id });
      } else {
        await apiRequest("POST", "/api/likes", { postId: post.id });
      }
    },
    onSuccess: () => {
      // Invalidate the feed and user posts queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/posts/feed"] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user.id}/posts`] });
    }
  });

  const handleLikeClick = () => {
    if (!currentUserId) return;
    likeMutation.mutate();
  };

  return (
    <div className="bg-white mb-2 border-b border-gray-200">
      <div className="p-4">
        {/* Post Header */}
        <div className="flex justify-between">
          <div className="flex items-center space-x-2">
            <Avatar className="w-10 h-10">
              <AvatarImage src={user.profileImageUrl} alt={user.displayName} />
              <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium text-gray-800">{user.displayName}</h3>
              <p className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(createdAt), { addSuffix: true })} · <span>🌎</span>
              </p>
            </div>
          </div>
          <button>
            <MoreHorizontal className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        
        {/* Post Content */}
        <p className="mt-2 text-gray-800">{content}</p>
        {imageUrl && (
          <div className="mt-3 rounded-lg overflow-hidden">
            <img src={imageUrl} alt="Post" className="w-full h-auto" />
          </div>
        )}
        
        {/* Post Stats */}
        <div className="flex justify-between mt-3 text-sm text-gray-500">
          <div className="flex space-x-1 items-center">
            <span className="flex items-center justify-center w-5 h-5 bg-primary rounded-full text-white text-xs">
              <ThumbsUp className="h-3 w-3" />
            </span>
            <span>{likeCount || 0}</span>
          </div>
          <div>
            <span>{commentCount || 0} comments</span>
            <span> · </span>
            <span>{shareCount || 0} shares</span>
          </div>
        </div>
        
        {/* Post Actions */}
        <div className="flex justify-between mt-2 pt-2 border-t border-gray-200">
          <button 
            className={cn(
              "flex items-center flex-1 justify-center py-1 text-sm",
              isLiked ? "text-primary" : "text-gray-500"
            )}
            onClick={handleLikeClick}
            disabled={likeMutation.isPending}
          >
            <ThumbsUp className="h-4 w-4 mr-1" /> Like
          </button>
          <button className="flex items-center flex-1 justify-center py-1 text-gray-500 text-sm">
            <MessageSquare className="h-4 w-4 mr-1" /> Comment
          </button>
          <button className="flex items-center flex-1 justify-center py-1 text-gray-500 text-sm">
            <Share className="h-4 w-4 mr-1" /> Share
          </button>
        </div>
      </div>
    </div>
  );
}
