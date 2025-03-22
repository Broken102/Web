import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { User } from "@shared/schema";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Image, X, Upload } from "lucide-react";

interface NewPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null | undefined;
}

export default function NewPostModal({ isOpen, onClose, currentUser }: NewPostModalProps) {
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const { toast } = useToast();

  const createPostMutation = useMutation({
    mutationFn: async () => {
      if (!content.trim() && !imageUrl.trim()) {
        throw new Error("Post cannot be empty");
      }

      return await apiRequest("POST", "/api/posts", {
        content: content.trim(),
        imageUrl: imageUrl.trim() || undefined,
        privacy: "public"
      });
    },
    onSuccess: () => {
      // Clear form fields
      setContent("");
      setImageUrl("");
      
      // Close modal
      onClose();
      
      // Show success toast
      toast({
        title: "Post created",
        description: "Your post has been published!",
      });
      
      // Refresh feed
      queryClient.invalidateQueries({ queryKey: ["/api/posts/feed"] });
      if (currentUser) {
        queryClient.invalidateQueries({ queryKey: [`/api/users/${currentUser.id}/posts`] });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create post",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createPostMutation.mutate();
  };

  // Mock function to add an image URL
  const handleImageUpload = () => {
    // In a real app, this would open a file picker and upload the image to a server
    // For demo, we'll use a placeholder image URL
    setImageUrl("https://images.unsplash.com/photo-1469474968028-56623f02e42e");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Post</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[100px]"
          />
          
          {imageUrl && (
            <div className="relative">
              <img 
                src={imageUrl} 
                alt="Post preview" 
                className="w-full h-auto rounded-md"
              />
              <button
                type="button"
                className="absolute top-2 right-2 p-1 bg-gray-800 bg-opacity-70 rounded-full text-white"
                onClick={() => setImageUrl("")}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleImageUpload}
              >
                <Image className="h-4 w-4 mr-2" /> Add Photo
              </Button>
            </div>
            
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createPostMutation.isPending || (!content.trim() && !imageUrl.trim())}
              >
                {createPostMutation.isPending ? (
                  <span className="flex items-center">
                    <Upload className="h-4 w-4 mr-2 animate-spin" /> Posting...
                  </span>
                ) : (
                  "Post"
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
