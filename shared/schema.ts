import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password"),  // Optional for social auth
  displayName: text("display_name").notNull(),
  email: text("email").unique(),
  bio: text("bio"),
  location: text("location"),
  profileImageUrl: text("profile_image_url"),
  coverImageUrl: text("cover_image_url"),
  provider: text("provider").default("local"), // local, google, facebook, instagram, tiktok, linkedin
  providerId: text("provider_id"), // Id from the provider
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  displayName: true,
  email: true,
  bio: true,
  location: true,
  profileImageUrl: true,
  coverImageUrl: true,
  provider: true,
  providerId: true,
});

// Posts table
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  privacy: text("privacy").default("public").notNull(),
});

export const insertPostSchema = createInsertSchema(posts).pick({
  userId: true,
  content: true,
  imageUrl: true,
  privacy: true,
});

// Videos table
export const videos = pgTable("videos", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  description: text("description"),
  videoUrl: text("video_url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  soundName: text("sound_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertVideoSchema = createInsertSchema(videos).pick({
  userId: true,
  description: true,
  videoUrl: true,
  thumbnailUrl: true,
  soundName: true,
});

// Likes table
export const likes = pgTable("likes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  postId: integer("post_id").references(() => posts.id),
  videoId: integer("video_id").references(() => videos.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertLikeSchema = createInsertSchema(likes).pick({
  userId: true,
  postId: true,
  videoId: true,
});

// Comments table
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  postId: integer("post_id").references(() => posts.id),
  videoId: integer("video_id").references(() => videos.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCommentSchema = createInsertSchema(comments).pick({
  userId: true,
  postId: true,
  videoId: true,
  content: true,
});

// Follows table (for friend/follow functionality)
export const follows = pgTable("follows", {
  id: serial("id").primaryKey(),
  followerId: integer("follower_id").notNull().references(() => users.id),
  followingId: integer("following_id").notNull().references(() => users.id),
  status: text("status").default("pending").notNull(), // pending, accepted, rejected
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertFollowSchema = createInsertSchema(follows).pick({
  followerId: true,
  followingId: true,
  status: true,
});

// Notifications table
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  senderId: integer("sender_id").references(() => users.id),
  type: text("type").notNull(), // like, comment, follow_request, follow_accept, etc.
  postId: integer("post_id").references(() => posts.id),
  videoId: integer("video_id").references(() => videos.id),
  commentId: integer("comment_id").references(() => comments.id),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertNotificationSchema = createInsertSchema(notifications).pick({
  userId: true,
  senderId: true,
  type: true,
  postId: true,
  videoId: true,
  commentId: true,
  message: true,
  isRead: true,
});

// Stories table
export const stories = pgTable("stories", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  imageUrl: text("image_url").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(), // 24 hours after createdAt
});

export const insertStorySchema = createInsertSchema(stories).pick({
  userId: true,
  imageUrl: true,
  expiresAt: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Post = typeof posts.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;

export type Video = typeof videos.$inferSelect;
export type InsertVideo = z.infer<typeof insertVideoSchema>;

export type Like = typeof likes.$inferSelect;
export type InsertLike = z.infer<typeof insertLikeSchema>;

export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;

export type Follow = typeof follows.$inferSelect;
export type InsertFollow = z.infer<typeof insertFollowSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export type Story = typeof stories.$inferSelect;
export type InsertStory = z.infer<typeof insertStorySchema>;

// Custom types for extended data
export type PostWithUser = Post & {
  user: User;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  isLiked?: boolean;
};

export type VideoWithUser = Video & {
  user: User;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  isLiked?: boolean;
};

export type NotificationWithSender = Notification & {
  sender?: User;
};

export type StoryWithUser = Story & {
  user: User;
};
