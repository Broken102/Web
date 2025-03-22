import {
  users, posts, videos, likes, comments, follows, notifications, stories,
  type User, type InsertUser,
  type Post, type InsertPost,
  type Video, type InsertVideo,
  type Like, type InsertLike,
  type Comment, type InsertComment,
  type Follow, type InsertFollow,
  type Notification, type InsertNotification,
  type Story, type InsertStory,
  type PostWithUser,
  type VideoWithUser,
  type NotificationWithSender,
  type StoryWithUser
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined>;
  
  // Post methods
  createPost(post: InsertPost): Promise<Post>;
  getPost(id: number): Promise<Post | undefined>;
  getFeedPosts(userId: number): Promise<PostWithUser[]>;
  getUserPosts(userId: number): Promise<PostWithUser[]>;
  
  // Video methods
  createVideo(video: InsertVideo): Promise<Video>;
  getVideo(id: number): Promise<Video | undefined>;
  getFeedVideos(userId: number): Promise<VideoWithUser[]>;
  getUserVideos(userId: number): Promise<VideoWithUser[]>;
  
  // Like methods
  createLike(like: InsertLike): Promise<Like>;
  deleteLike(userId: number, postId?: number, videoId?: number): Promise<void>;
  getLikes(postId?: number, videoId?: number): Promise<Like[]>;
  
  // Comment methods
  createComment(comment: InsertComment): Promise<Comment>;
  getComments(postId?: number, videoId?: number): Promise<Comment[]>;
  
  // Follow methods
  createFollow(follow: InsertFollow): Promise<Follow>;
  updateFollowStatus(id: number, status: string): Promise<Follow | undefined>;
  getFollowers(userId: number): Promise<User[]>;
  getFollowing(userId: number): Promise<User[]>;
  
  // Notification methods
  createNotification(notification: InsertNotification): Promise<Notification>;
  getUserNotifications(userId: number): Promise<NotificationWithSender[]>;
  markNotificationAsRead(id: number): Promise<Notification | undefined>;
  
  // Story methods
  createStory(story: InsertStory): Promise<Story>;
  getActiveStories(userId: number): Promise<StoryWithUser[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private posts: Map<number, Post>;
  private videos: Map<number, Video>;
  private likes: Map<number, Like>;
  private comments: Map<number, Comment>;
  private follows: Map<number, Follow>;
  private notifications: Map<number, Notification>;
  private stories: Map<number, Story>;
  
  private currentUserId: number;
  private currentPostId: number;
  private currentVideoId: number;
  private currentLikeId: number;
  private currentCommentId: number;
  private currentFollowId: number;
  private currentNotificationId: number;
  private currentStoryId: number;

  constructor() {
    this.users = new Map();
    this.posts = new Map();
    this.videos = new Map();
    this.likes = new Map();
    this.comments = new Map();
    this.follows = new Map();
    this.notifications = new Map();
    this.stories = new Map();
    
    this.currentUserId = 1;
    this.currentPostId = 1;
    this.currentVideoId = 1;
    this.currentLikeId = 1;
    this.currentCommentId = 1;
    this.currentFollowId = 1;
    this.currentNotificationId = 1;
    this.currentStoryId = 1;
    
    // Initialize with demo data
    this.initializeDemoData();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Post methods
  async createPost(post: InsertPost): Promise<Post> {
    const id = this.currentPostId++;
    const newPost: Post = {
      ...post,
      id,
      createdAt: new Date(),
    };
    this.posts.set(id, newPost);
    return newPost;
  }

  async getPost(id: number): Promise<Post | undefined> {
    return this.posts.get(id);
  }

  async getFeedPosts(userId: number): Promise<PostWithUser[]> {
    // Get posts from user and followed users
    const following = Array.from(this.follows.values())
      .filter(f => f.followerId === userId && f.status === 'accepted')
      .map(f => f.followingId);
    
    // Include user's own posts
    const relevantUserIds = [...following, userId];
    
    const feedPosts = Array.from(this.posts.values())
      .filter(post => relevantUserIds.includes(post.userId) || post.privacy === 'public')
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    return Promise.all(feedPosts.map(async post => {
      const user = await this.getUser(post.userId) as User;
      const likes = await this.getLikes(post.id);
      const comments = await this.getComments(post.id);
      const isLiked = likes.some(like => like.userId === userId);
      
      return {
        ...post,
        user,
        likeCount: likes.length,
        commentCount: comments.length,
        shareCount: Math.floor(Math.random() * 10), // Just for display
        isLiked
      };
    }));
  }

  async getUserPosts(userId: number): Promise<PostWithUser[]> {
    const userPosts = Array.from(this.posts.values())
      .filter(post => post.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    return Promise.all(userPosts.map(async post => {
      const user = await this.getUser(post.userId) as User;
      const likes = await this.getLikes(post.id);
      const comments = await this.getComments(post.id);
      
      return {
        ...post,
        user,
        likeCount: likes.length,
        commentCount: comments.length,
        shareCount: Math.floor(Math.random() * 10),
        isLiked: likes.some(like => like.userId === userId)
      };
    }));
  }

  // Video methods
  async createVideo(video: InsertVideo): Promise<Video> {
    const id = this.currentVideoId++;
    const newVideo: Video = {
      ...video,
      id,
      createdAt: new Date(),
    };
    this.videos.set(id, newVideo);
    return newVideo;
  }

  async getVideo(id: number): Promise<Video | undefined> {
    return this.videos.get(id);
  }

  async getFeedVideos(userId: number): Promise<VideoWithUser[]> {
    const feedVideos = Array.from(this.videos.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    return Promise.all(feedVideos.map(async video => {
      const user = await this.getUser(video.userId) as User;
      const likes = await this.getLikes(undefined, video.id);
      const comments = await this.getComments(undefined, video.id);
      
      return {
        ...video,
        user,
        likeCount: likes.length,
        commentCount: comments.length,
        shareCount: Math.floor(Math.random() * 100),
        isLiked: likes.some(like => like.userId === userId)
      };
    }));
  }

  async getUserVideos(userId: number): Promise<VideoWithUser[]> {
    const userVideos = Array.from(this.videos.values())
      .filter(video => video.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    return Promise.all(userVideos.map(async video => {
      const user = await this.getUser(video.userId) as User;
      const likes = await this.getLikes(undefined, video.id);
      const comments = await this.getComments(undefined, video.id);
      
      return {
        ...video,
        user,
        likeCount: likes.length,
        commentCount: comments.length,
        shareCount: Math.floor(Math.random() * 100),
        isLiked: likes.some(like => like.userId === userId)
      };
    }));
  }

  // Like methods
  async createLike(like: InsertLike): Promise<Like> {
    // First, check if the like already exists
    const existing = Array.from(this.likes.values()).find(
      l => l.userId === like.userId && 
      ((like.postId && l.postId === like.postId) || 
       (like.videoId && l.videoId === like.videoId))
    );
    
    if (existing) return existing;
    
    const id = this.currentLikeId++;
    const newLike: Like = {
      ...like,
      id,
      createdAt: new Date(),
    };
    this.likes.set(id, newLike);
    return newLike;
  }

  async deleteLike(userId: number, postId?: number, videoId?: number): Promise<void> {
    const likeToDelete = Array.from(this.likes.values()).find(
      l => l.userId === userId && 
      ((postId && l.postId === postId) || 
       (videoId && l.videoId === videoId))
    );
    
    if (likeToDelete) {
      this.likes.delete(likeToDelete.id);
    }
  }

  async getLikes(postId?: number, videoId?: number): Promise<Like[]> {
    return Array.from(this.likes.values()).filter(like => {
      if (postId) return like.postId === postId;
      if (videoId) return like.videoId === videoId;
      return false;
    });
  }

  // Comment methods
  async createComment(comment: InsertComment): Promise<Comment> {
    const id = this.currentCommentId++;
    const newComment: Comment = {
      ...comment,
      id,
      createdAt: new Date(),
    };
    this.comments.set(id, newComment);
    return newComment;
  }

  async getComments(postId?: number, videoId?: number): Promise<Comment[]> {
    return Array.from(this.comments.values())
      .filter(comment => {
        if (postId) return comment.postId === postId;
        if (videoId) return comment.videoId === videoId;
        return false;
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Follow methods
  async createFollow(follow: InsertFollow): Promise<Follow> {
    // Check if follow relationship already exists
    const existing = Array.from(this.follows.values()).find(
      f => f.followerId === follow.followerId && f.followingId === follow.followingId
    );
    
    if (existing) {
      // Update existing follow status
      const updatedFollow = { ...existing, status: follow.status };
      this.follows.set(existing.id, updatedFollow);
      return updatedFollow;
    }
    
    const id = this.currentFollowId++;
    const newFollow: Follow = {
      ...follow,
      id,
      createdAt: new Date(),
    };
    this.follows.set(id, newFollow);
    return newFollow;
  }

  async updateFollowStatus(id: number, status: string): Promise<Follow | undefined> {
    const follow = this.follows.get(id);
    if (!follow) return undefined;
    
    const updatedFollow = { ...follow, status };
    this.follows.set(id, updatedFollow);
    return updatedFollow;
  }

  async getFollowers(userId: number): Promise<User[]> {
    const followerIds = Array.from(this.follows.values())
      .filter(f => f.followingId === userId && f.status === 'accepted')
      .map(f => f.followerId);
    
    return Promise.all(followerIds.map(id => this.getUser(id))) as Promise<User[]>;
  }

  async getFollowing(userId: number): Promise<User[]> {
    const followingIds = Array.from(this.follows.values())
      .filter(f => f.followerId === userId && f.status === 'accepted')
      .map(f => f.followingId);
    
    return Promise.all(followingIds.map(id => this.getUser(id))) as Promise<User[]>;
  }

  // Notification methods
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const id = this.currentNotificationId++;
    const newNotification: Notification = {
      ...notification,
      id,
      createdAt: new Date(),
    };
    this.notifications.set(id, newNotification);
    return newNotification;
  }

  async getUserNotifications(userId: number): Promise<NotificationWithSender[]> {
    const userNotifications = Array.from(this.notifications.values())
      .filter(n => n.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    return Promise.all(userNotifications.map(async notification => {
      const sender = notification.senderId 
        ? await this.getUser(notification.senderId) 
        : undefined;
      
      return {
        ...notification,
        sender
      };
    }));
  }

  async markNotificationAsRead(id: number): Promise<Notification | undefined> {
    const notification = this.notifications.get(id);
    if (!notification) return undefined;
    
    const updatedNotification = { ...notification, isRead: true };
    this.notifications.set(id, updatedNotification);
    return updatedNotification;
  }

  // Story methods
  async createStory(story: InsertStory): Promise<Story> {
    const id = this.currentStoryId++;
    const newStory: Story = {
      ...story,
      id,
      createdAt: new Date(),
    };
    this.stories.set(id, newStory);
    return newStory;
  }

  async getActiveStories(userId: number): Promise<StoryWithUser[]> {
    // Get stories that haven't expired
    const now = new Date();
    
    // Get the user's following
    const following = Array.from(this.follows.values())
      .filter(f => f.followerId === userId && f.status === 'accepted')
      .map(f => f.followingId);
    
    // Include the user's own stories
    const relevantUserIds = [...following, userId];
    
    const activeStories = Array.from(this.stories.values())
      .filter(story => 
        relevantUserIds.includes(story.userId) && 
        new Date(story.expiresAt) > now
      )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    return Promise.all(activeStories.map(async story => {
      const user = await this.getUser(story.userId) as User;
      return { ...story, user };
    }));
  }

  private initializeDemoData() {
    // Initialize with demo users
    const users: InsertUser[] = [
      {
        username: 'current_user',
        password: 'password',
        displayName: 'Jordan Wilson',
        bio: 'Digital creator | Travel enthusiast',
        location: 'San Francisco, CA',
        profileImageUrl: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d',
        coverImageUrl: 'https://images.unsplash.com/photo-1504805572947-34fad45aed93'
      },
      {
        username: 'alex',
        password: 'password',
        displayName: 'Alex Johnson',
        bio: 'Photographer & Designer',
        location: 'New York',
        profileImageUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde',
        coverImageUrl: 'https://images.unsplash.com/photo-1517999144091-3d9dca6d1e43'
      },
      {
        username: 'jessica',
        password: 'password',
        displayName: 'Jessica Miller',
        bio: 'Travel | Photography | Food',
        location: 'Miami',
        profileImageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
        coverImageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e'
      },
      {
        username: 'michael',
        password: 'password',
        displayName: 'Michael Brown',
        bio: 'Software Engineer | Gamer',
        location: 'Seattle',
        profileImageUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36',
        coverImageUrl: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3'
      },
      {
        username: 'sarah',
        password: 'password',
        displayName: 'Sarah Adams',
        bio: 'Artist & Content Creator',
        location: 'Los Angeles',
        profileImageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80',
        coverImageUrl: 'https://images.unsplash.com/photo-1581985673473-0784a7a44e39'
      },
      {
        username: 'dancerkayla',
        password: 'password',
        displayName: 'Kayla Dance',
        bio: 'Professional Dancer | Instructor',
        location: 'Chicago',
        profileImageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
        coverImageUrl: 'https://images.unsplash.com/photo-1596431366119-85a0f24d29ff'
      },
      {
        username: 'travelbuddy',
        password: 'password',
        displayName: 'Travel Buddy',
        bio: 'Travel Vlogger & Adventure Seeker',
        location: 'Bali, Indonesia',
        profileImageUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6',
        coverImageUrl: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf'
      }
    ];

    // Create users and store their IDs
    const userIds: number[] = [];
    users.forEach(user => {
      const newUser = this.createUser(user);
      userIds.push(this.currentUserId - 1);
    });

    // Create posts
    const posts: InsertPost[] = [
      {
        userId: userIds[1], // Alex
        content: 'Just finished my new home office setup! So happy with how it turned out.',
        imageUrl: 'https://images.unsplash.com/photo-1593062096033-9a26b09da705',
        privacy: 'public'
      },
      {
        userId: userIds[2], // Jessica
        content: 'Had an amazing time at the beach today! Perfect weather ☀️ #weekendvibes',
        imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
        privacy: 'public'
      },
      {
        userId: userIds[0], // Current user
        content: 'Exploring the beautiful mountains this weekend! #adventure #hiking',
        imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b',
        privacy: 'public'
      }
    ];

    posts.forEach(post => {
      this.createPost(post);
    });

    // Create videos
    const videos: InsertVideo[] = [
      {
        userId: userIds[5], // Dancer Kayla
        description: 'New dance routine! #dance #viral',
        videoUrl: 'https://example.com/video1.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1561046139-9cb7c6318a22',
        soundName: 'Original Sound - dancerkayla'
      },
      {
        userId: userIds[6], // Travel Buddy
        description: 'Secret beach in Bali! #travel #paradise',
        videoUrl: 'https://example.com/video2.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf',
        soundName: 'Island Vibes - TropicalBeats'
      }
    ];

    videos.forEach(video => {
      this.createVideo(video);
    });

    // Create follows (friendships)
    const follows: InsertFollow[] = [
      { followerId: userIds[0], followingId: userIds[1], status: 'accepted' },
      { followerId: userIds[0], followingId: userIds[2], status: 'accepted' },
      { followerId: userIds[0], followingId: userIds[3], status: 'accepted' },
      { followerId: userIds[0], followingId: userIds[4], status: 'accepted' },
      { followerId: userIds[0], followingId: userIds[5], status: 'accepted' },
      { followerId: userIds[1], followingId: userIds[0], status: 'accepted' },
      { followerId: userIds[2], followingId: userIds[0], status: 'accepted' },
      { followerId: userIds[3], followingId: userIds[0], status: 'pending' },
      { followerId: userIds[4], followingId: userIds[0], status: 'accepted' }
    ];

    follows.forEach(follow => {
      this.createFollow(follow);
    });

    // Create likes
    const likes: InsertLike[] = [
      { userId: userIds[0], postId: 1 },
      { userId: userIds[3], postId: 1 },
      { userId: userIds[4], postId: 1 },
      { userId: userIds[0], postId: 2 },
      { userId: userIds[1], postId: 2 },
      { userId: userIds[2], postId: 3 },
      { userId: userIds[1], videoId: 1 },
      { userId: userIds[2], videoId: 1 },
      { userId: userIds[0], videoId: 2 }
    ];

    likes.forEach(like => {
      this.createLike(like);
    });

    // Create comments
    const comments: InsertComment[] = [
      { userId: userIds[0], postId: 1, content: 'Looks awesome! What monitor is that?' },
      { userId: userIds[3], postId: 1, content: 'Great setup!' },
      { userId: userIds[1], postId: 2, content: 'So jealous! The water looks amazing.' },
      { userId: userIds[4], videoId: 1, content: 'Incredible moves! 🔥' }
    ];

    comments.forEach(comment => {
      this.createComment(comment);
    });

    // Create notifications
    const notifications: InsertNotification[] = [
      {
        userId: userIds[0],
        senderId: userIds[1],
        type: 'like',
        postId: 3,
        message: 'liked your post',
        isRead: false
      },
      {
        userId: userIds[0],
        senderId: userIds[2],
        type: 'follow_request',
        message: 'sent you a friend request',
        isRead: false
      },
      {
        userId: userIds[0],
        senderId: userIds[3],
        type: 'comment',
        postId: 3,
        message: 'commented on your post',
        isRead: false
      }
    ];

    notifications.forEach(notification => {
      this.createNotification(notification);
    });

    // Create stories
    const tomorrow = new Date();
    tomorrow.setHours(tomorrow.getHours() + 24);

    const stories: InsertStory[] = [
      {
        userId: userIds[1],
        imageUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde',
        expiresAt: tomorrow
      },
      {
        userId: userIds[2],
        imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
        expiresAt: tomorrow
      },
      {
        userId: userIds[3],
        imageUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36',
        expiresAt: tomorrow
      },
      {
        userId: userIds[4],
        imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80',
        expiresAt: tomorrow
      }
    ];

    stories.forEach(story => {
      this.createStory(story);
    });
  }
}

export const storage = new MemStorage();
