import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { 
  insertUserSchema, 
  insertPostSchema, 
  insertVideoSchema,
  insertLikeSchema,
  insertCommentSchema,
  insertFollowSchema,
  insertNotificationSchema,
  insertStorySchema
} from "@shared/schema";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import MemoryStore from "memorystore";

const SessionStore = MemoryStore(session);

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure session
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "social-vid-secret",
      resave: false,
      saveUninitialized: false,
      cookie: { secure: process.env.NODE_ENV === "production" },
      store: new SessionStore({
        checkPeriod: 86400000, // 24 hours
      }),
    })
  );

  // Configure passport
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(express.json());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Incorrect username." });
        }
        if (user.password !== password) { // In production, use bcrypt to hash passwords
          return done(null, false, { message: "Incorrect password." });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // Auth routes
  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: info.message });
      }
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        const { password, ...userWithoutPassword } = user;
        return res.json(userWithoutPassword);
      });
    })(req, res, next);
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(validatedData.username);
      
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const user = await storage.createUser(validatedData);
      const { password, ...userWithoutPassword } = user;
      
      req.logIn(user, (err) => {
        if (err) {
          return res.status(500).json({ message: err.message });
        }
        return res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      return res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.get("/api/auth/me", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const { password, ...user } = req.user as any;
    res.json(user);
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout(() => {
      res.status(200).json({ message: "Logged out successfully" });
    });
  });

  // User routes
  app.get("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const user = req.user as any;
    const userId = parseInt(req.params.id);
    
    if (user.id !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }
    
    try {
      const updatedUser = await storage.updateUser(userId, req.body);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Post routes
  app.post("/api/posts", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const user = req.user as any;
      const postData = { ...req.body, userId: user.id };
      const validatedData = insertPostSchema.parse(postData);
      const post = await storage.createPost(validatedData);
      
      res.status(201).json(post);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to create post" });
    }
  });

  app.get("/api/posts/feed", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const user = req.user as any;
      const posts = await storage.getFeedPosts(user.id);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Failed to get feed posts" });
    }
  });

  app.get("/api/users/:id/posts", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const posts = await storage.getUserPosts(userId);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user posts" });
    }
  });

  // Video routes
  app.post("/api/videos", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const user = req.user as any;
      const videoData = { ...req.body, userId: user.id };
      const validatedData = insertVideoSchema.parse(videoData);
      const video = await storage.createVideo(validatedData);
      
      res.status(201).json(video);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to create video" });
    }
  });

  app.get("/api/videos/feed", async (req, res) => {
    try {
      const userId = req.isAuthenticated() ? (req.user as any).id : 0;
      const videos = await storage.getFeedVideos(userId);
      res.json(videos);
    } catch (error) {
      res.status(500).json({ message: "Failed to get feed videos" });
    }
  });

  app.get("/api/users/:id/videos", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const videos = await storage.getUserVideos(userId);
      res.json(videos);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user videos" });
    }
  });

  // Like routes
  app.post("/api/likes", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const user = req.user as any;
      const likeData = { ...req.body, userId: user.id };
      const validatedData = insertLikeSchema.parse(likeData);
      const like = await storage.createLike(validatedData);
      
      // Create notification if the like is for another user's content
      if (validatedData.postId) {
        const post = await storage.getPost(validatedData.postId);
        if (post && post.userId !== user.id) {
          await storage.createNotification({
            userId: post.userId,
            senderId: user.id,
            type: 'like',
            postId: validatedData.postId,
            message: 'liked your post',
            isRead: false
          });
        }
      } else if (validatedData.videoId) {
        const video = await storage.getVideo(validatedData.videoId);
        if (video && video.userId !== user.id) {
          await storage.createNotification({
            userId: video.userId,
            senderId: user.id,
            type: 'like',
            videoId: validatedData.videoId,
            message: 'liked your video',
            isRead: false
          });
        }
      }
      
      res.status(201).json(like);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to create like" });
    }
  });

  app.delete("/api/likes", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const user = req.user as any;
      const { postId, videoId } = req.body;
      
      if (!postId && !videoId) {
        return res.status(400).json({ message: "Either postId or videoId is required" });
      }
      
      await storage.deleteLike(user.id, postId, videoId);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete like" });
    }
  });

  // Comment routes
  app.post("/api/comments", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const user = req.user as any;
      const commentData = { ...req.body, userId: user.id };
      const validatedData = insertCommentSchema.parse(commentData);
      const comment = await storage.createComment(validatedData);
      
      // Create notification if the comment is for another user's content
      if (validatedData.postId) {
        const post = await storage.getPost(validatedData.postId);
        if (post && post.userId !== user.id) {
          await storage.createNotification({
            userId: post.userId,
            senderId: user.id,
            type: 'comment',
            postId: validatedData.postId,
            commentId: comment.id,
            message: 'commented on your post',
            isRead: false
          });
        }
      } else if (validatedData.videoId) {
        const video = await storage.getVideo(validatedData.videoId);
        if (video && video.userId !== user.id) {
          await storage.createNotification({
            userId: video.userId,
            senderId: user.id,
            type: 'comment',
            videoId: validatedData.videoId,
            commentId: comment.id,
            message: 'commented on your video',
            isRead: false
          });
        }
      }
      
      res.status(201).json(comment);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  app.get("/api/posts/:id/comments", async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const comments = await storage.getComments(postId);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ message: "Failed to get comments" });
    }
  });

  app.get("/api/videos/:id/comments", async (req, res) => {
    try {
      const videoId = parseInt(req.params.id);
      const comments = await storage.getComments(undefined, videoId);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ message: "Failed to get comments" });
    }
  });

  // Follow routes
  app.post("/api/follows", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const user = req.user as any;
      const followData = { ...req.body, followerId: user.id };
      const validatedData = insertFollowSchema.parse(followData);
      
      // Don't allow following yourself
      if (validatedData.followerId === validatedData.followingId) {
        return res.status(400).json({ message: "Cannot follow yourself" });
      }
      
      const follow = await storage.createFollow(validatedData);
      
      // Create notification for the follow request
      await storage.createNotification({
        userId: validatedData.followingId,
        senderId: user.id,
        type: 'follow_request',
        message: 'sent you a friend request',
        isRead: false
      });
      
      res.status(201).json(follow);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to create follow" });
    }
  });

  app.put("/api/follows/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const followId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status || !['accepted', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const updatedFollow = await storage.updateFollowStatus(followId, status);
      
      if (!updatedFollow) {
        return res.status(404).json({ message: "Follow not found" });
      }
      
      // Create notification for accepted follows
      if (status === 'accepted') {
        await storage.createNotification({
          userId: updatedFollow.followerId,
          senderId: updatedFollow.followingId,
          type: 'follow_accept',
          message: 'accepted your friend request',
          isRead: false
        });
      }
      
      res.json(updatedFollow);
    } catch (error) {
      res.status(500).json({ message: "Failed to update follow" });
    }
  });

  app.get("/api/users/:id/followers", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const followers = await storage.getFollowers(userId);
      
      // Remove passwords
      const followersWithoutPasswords = followers.map(({ password, ...user }) => user);
      
      res.json(followersWithoutPasswords);
    } catch (error) {
      res.status(500).json({ message: "Failed to get followers" });
    }
  });

  app.get("/api/users/:id/following", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const following = await storage.getFollowing(userId);
      
      // Remove passwords
      const followingWithoutPasswords = following.map(({ password, ...user }) => user);
      
      res.json(followingWithoutPasswords);
    } catch (error) {
      res.status(500).json({ message: "Failed to get following" });
    }
  });

  // Notification routes
  app.get("/api/notifications", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const user = req.user as any;
      const notifications = await storage.getUserNotifications(user.id);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Failed to get notifications" });
    }
  });

  app.put("/api/notifications/:id/read", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const notificationId = parseInt(req.params.id);
      const updatedNotification = await storage.markNotificationAsRead(notificationId);
      
      if (!updatedNotification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      
      res.json(updatedNotification);
    } catch (error) {
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Story routes
  app.post("/api/stories", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const user = req.user as any;
      
      // Set expiration to 24 hours from now
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);
      
      const storyData = { 
        ...req.body, 
        userId: user.id,
        expiresAt 
      };
      
      const validatedData = insertStorySchema.parse(storyData);
      const story = await storage.createStory(validatedData);
      
      res.status(201).json(story);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to create story" });
    }
  });

  app.get("/api/stories", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const user = req.user as any;
      const stories = await storage.getActiveStories(user.id);
      res.json(stories);
    } catch (error) {
      res.status(500).json({ message: "Failed to get stories" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
