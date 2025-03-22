import { NotificationWithSender } from "@shared/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThumbsUp, UserPlus, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

interface NotificationItemProps {
  notification: NotificationWithSender;
}

export default function NotificationItem({ notification }: NotificationItemProps) {
  const { id, type, message, createdAt, isRead, sender } = notification;
  
  const markAsReadMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("PUT", `/api/notifications/${id}/read`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    }
  });

  const acceptFollowMutation = useMutation({
    mutationFn: async () => {
      // Find the follow ID from a separate API call or store it in the notification data
      // For demo, we're just using notification.id as placeholder
      await apiRequest("PUT", `/api/follows/${id}`, { status: "accepted" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    }
  });

  const declineFollowMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("PUT", `/api/follows/${id}`, { status: "rejected" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    }
  });

  // Handle notification click
  const handleClick = () => {
    if (!isRead) {
      markAsReadMutation.mutate();
    }
  };

  return (
    <div 
      className={`py-3 border-b border-gray-200 flex items-center space-x-3 ${
        isRead ? 'bg-white' : 'bg-blue-50'
      }`}
      onClick={handleClick}
    >
      <div className="relative">
        <Avatar className="w-12 h-12">
          <AvatarImage src={sender?.profileImageUrl} alt={sender?.displayName} />
          <AvatarFallback>{sender?.displayName?.charAt(0) || 'U'}</AvatarFallback>
        </Avatar>
        <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center">
          {type === 'like' && (
            <ThumbsUp className="h-3 w-3 text-white bg-primary p-[2px] rounded-full" />
          )}
          {type === 'follow_request' && (
            <UserPlus className="h-3 w-3 text-white bg-blue-500 p-[2px] rounded-full" />
          )}
          {type === 'comment' && (
            <MessageSquare className="h-3 w-3 text-white bg-green-500 p-[2px] rounded-full" />
          )}
        </span>
      </div>
      <div className="flex-1">
        <p className="text-gray-800">
          <span className="font-semibold">{sender?.displayName}</span> {message}.
        </p>
        <p className="text-xs text-gray-500">
          {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
        </p>
      </div>
      
      {type === 'follow_request' && (
        <div className="flex space-x-2">
          <Button 
            size="sm"
            onClick={() => acceptFollowMutation.mutate()}
            disabled={acceptFollowMutation.isPending}
          >
            Accept
          </Button>
          <Button 
            size="sm"
            variant="outline"
            onClick={() => declineFollowMutation.mutate()}
            disabled={declineFollowMutation.isPending}
          >
            Decline
          </Button>
        </div>
      )}
    </div>
  );
}
