import { User } from "@shared/schema";
import { Search, Bell, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  title: string;
  currentUser: User | null;
  notificationCount?: number;
  messageCount?: number;
}

export default function Header({ 
  title, 
  currentUser,
  notificationCount = 0,
  messageCount = 0
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm px-4 py-2 flex justify-between items-center">
      <div className="text-2xl font-bold text-primary">{title}</div>
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" className="rounded-full bg-gray-100">
          <Search className="h-5 w-5 text-gray-700" />
        </Button>
        
        <Button variant="ghost" size="icon" className="rounded-full bg-gray-100 relative">
          <Bell className="h-5 w-5 text-gray-700" />
          {notificationCount > 0 && (
            <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
              {notificationCount}
            </span>
          )}
        </Button>
        
        <Button variant="ghost" size="icon" className="rounded-full bg-gray-100 relative">
          <MessageSquare className="h-5 w-5 text-gray-700" />
          {messageCount > 0 && (
            <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
              {messageCount}
            </span>
          )}
        </Button>
      </div>
    </header>
  );
}
