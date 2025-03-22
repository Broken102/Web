import { useQuery } from "@tanstack/react-query";
import { NotificationWithSender, User } from "@shared/schema";
import NotificationItem from "@/components/NotificationItem";
import { Skeleton } from "@/components/ui/skeleton";

interface NotificationsScreenProps {
  currentUser: User | null;
}

export default function NotificationsScreen({ currentUser }: NotificationsScreenProps) {
  // Fetch notifications
  const { data: notifications, isLoading } = useQuery<NotificationWithSender[]>({
    queryKey: ["/api/notifications"],
    staleTime: 30 * 1000, // 30 seconds
    enabled: !!currentUser, // Only fetch if user is logged in
  });

  if (!currentUser) {
    return (
      <div className="h-full overflow-y-auto bg-white flex items-center justify-center p-4 text-center">
        <div>
          <h2 className="text-xl font-semibold mb-2">Not Signed In</h2>
          <p className="text-gray-600">Please sign in to view your notifications</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-white">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800">Notifications</h2>
      </div>
      
      <div className="px-4">
        {isLoading ? (
          // Skeleton loading state
          [...Array(5)].map((_, i) => (
            <div key={i} className="py-3 border-b border-gray-200 flex items-center space-x-3">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="w-3/4 h-4" />
                <Skeleton className="w-1/4 h-3" />
              </div>
            </div>
          ))
        ) : notifications && notifications.length > 0 ? (
          // Notifications list
          notifications.map((notification) => (
            <NotificationItem key={notification.id} notification={notification} />
          ))
        ) : (
          // Empty state
          <div className="py-8 text-center">
            <p className="text-gray-500">No notifications yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
