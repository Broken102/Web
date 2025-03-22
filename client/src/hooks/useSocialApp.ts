import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User, Post, Video, Notification } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export function useSocialApp() {
  const queryClient = useQueryClient();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  
  // Current user query
  const { data: currentUser, isLoading: isLoadingUser } = useQuery<User | null>({
    queryKey: ["/api/auth/me"],
    staleTime: 5 * 60 * 1000, // 5 minutes
    onSuccess: (data) => {
      setIsLoggedIn(!!data);
    },
    onError: () => {
      setIsLoggedIn(false);
    }
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async ({ username, password }: { username: string; password: string }) => {
      const res = await apiRequest("POST", "/api/auth/login", { username, password });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    }
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (userData: {
      username: string;
      password: string;
      displayName: string;
      bio?: string;
      location?: string;
    }) => {
      const res = await apiRequest("POST", "/api/auth/register", userData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    }
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      setIsLoggedIn(false);
    }
  });

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (postData: { content: string; imageUrl?: string }) => {
      const res = await apiRequest("POST", "/api/posts", postData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts/feed"] });
      if (currentUser) {
        queryClient.invalidateQueries({ queryKey: [`/api/users/${currentUser.id}/posts`] });
      }
    }
  });

  // Like post mutation
  const likePostMutation = useMutation({
    mutationFn: async (postId: number) => {
      await apiRequest("POST", "/api/likes", { postId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts/feed"] });
    }
  });

  // Unlike post mutation
  const unlikePostMutation = useMutation({
    mutationFn: async (postId: number) => {
      await apiRequest("DELETE", "/api/likes", { postId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts/feed"] });
    }
  });

  // Create video mutation
  const createVideoMutation = useMutation({
    mutationFn: async (videoData: {
      description: string;
      videoUrl: string;
      thumbnailUrl?: string;
      soundName?: string;
    }) => {
      const res = await apiRequest("POST", "/api/videos", videoData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/videos/feed"] });
    }
  });

  // Follow user mutation
  const followUserMutation = useMutation({
    mutationFn: async (followingId: number) => {
      const res = await apiRequest("POST", "/api/follows", {
        followingId,
        status: "pending"
      });
      return res.json();
    }
  });

  // Count unread notifications
  const { data: notifications } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
    enabled: !!currentUser,
    staleTime: 30 * 1000 // 30 seconds
  });

  const unreadNotificationCount = notifications
    ? notifications.filter(n => !n.isRead).length
    : 0;

  return {
    currentUser,
    isLoadingUser,
    isLoggedIn,
    unreadNotificationCount,
    loginMutation,
    registerMutation,
    logoutMutation,
    createPostMutation,
    likePostMutation,
    unlikePostMutation,
    createVideoMutation,
    followUserMutation
  };
}
