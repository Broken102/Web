import { User } from "@shared/schema";
import { Search, Bell, MessageSquare, LogOut, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";

interface HeaderProps {
  title: string;
  currentUser: User | null | undefined;
  notificationCount?: number;
  messageCount?: number;
}

export default function Header({ 
  title, 
  currentUser,
  notificationCount = 0,
  messageCount = 0
}: HeaderProps) {
  // Only use auth functionality if we have a user
  // This avoids the useAuth call when no user is logged in
  const auth = currentUser ? useAuth() : null;
  const logoutMutation = auth?.logoutMutation;
  
  const handleLogout = () => {
    if (logoutMutation) {
      logoutMutation.mutate();
    }
  };
  
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
        
        {currentUser && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="rounded-full flex items-center gap-1 pl-1">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={currentUser.profileImageUrl || undefined} alt={currentUser.displayName} />
                  <AvatarFallback>{currentUser.displayName.charAt(0)}</AvatarFallback>
                </Avatar>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <Avatar className="h-5 w-5 mr-2">
                      <AvatarFallback>{currentUser.displayName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Search className="h-4 w-4 mr-2" />
                  Find Friends
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} disabled={logoutMutation?.isPending}>
                <LogOut className="h-4 w-4 mr-2" />
                {logoutMutation?.isPending ? "Logging out..." : "Logout"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
