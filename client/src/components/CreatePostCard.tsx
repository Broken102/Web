import { User } from "@shared/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Video, Image, Smile } from "lucide-react";

interface CreatePostCardProps {
  currentUser: User | null | undefined;
  onCreatePost: () => void;
}

export default function CreatePostCard({ currentUser, onCreatePost }: CreatePostCardProps) {
  const handleInputClick = () => {
    onCreatePost();
  };

  return (
    <div className="p-4 bg-white mb-2 border-b border-gray-200">
      <div className="flex items-center space-x-3">
        <Avatar className="w-10 h-10">
          <AvatarImage src={currentUser?.profileImageUrl} alt={currentUser?.displayName} />
          <AvatarFallback>
            {currentUser?.displayName?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
        <Input
          type="text"
          placeholder="What's on your mind?"
          className="flex-1 bg-gray-100 rounded-full text-sm"
          onClick={handleInputClick}
          readOnly
        />
      </div>
      <div className="flex justify-between mt-3 border-t border-gray-200 pt-3">
        <button className="flex items-center justify-center flex-1 py-1 text-gray-500 text-sm">
          <Video className="h-4 w-4 text-red-500 mr-1" /> Live
        </button>
        <button className="flex items-center justify-center flex-1 py-1 text-gray-500 text-sm" onClick={onCreatePost}>
          <Image className="h-4 w-4 text-green-500 mr-1" /> Photo
        </button>
        <button className="flex items-center justify-center flex-1 py-1 text-gray-500 text-sm">
          <Smile className="h-4 w-4 text-yellow-500 mr-1" /> Feeling
        </button>
      </div>
    </div>
  );
}
