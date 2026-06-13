import { z } from 'zod'

// --- Group ---
export const GroupItemOutSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  cover_image: z.string().nullable().optional(),
  member_count: z.number(),
  post_count: z.number(),
  is_joined: z.boolean(),
  is_active: z.boolean().optional(),
  created_at: z.string(),
})
export type GroupItemOut = z.infer<typeof GroupItemOutSchema>

export const GroupListOutSchema = z.object({
  items: z.array(GroupItemOutSchema),
  total: z.number(),
})
export type GroupListOut = z.infer<typeof GroupListOutSchema>

export const GroupDetailOutSchema = GroupItemOutSchema
export type GroupDetailOut = z.infer<typeof GroupDetailOutSchema>

export const GroupCreateInSchema = z.object({
  name: z.string().min(2, '名字至少2个字').max(128, '名字太长了'),
  description: z.string().optional().nullable(),
  cover_image: z.string().optional().nullable(),
})
export type GroupCreateIn = z.infer<typeof GroupCreateInSchema>

// --- Post ---
export const PostItemOutSchema = z.object({
  id: z.string(),
  group_id: z.string(),
  group_name: z.string(),
  author_id: z.string(),
  author_name: z.string(),
  author_avatar: z.string().nullable().optional(),
  title: z.string(),
  content: z.string(),
  images: z.array(z.string()),
  videos: z.array(z.string()).optional(),
  view_count: z.number(),
  like_count: z.number(),
  comment_count: z.number(),
  is_liked: z.boolean(),
  is_mine: z.boolean(),
  is_top: z.boolean(),
  is_hidden: z.boolean().optional(), // Added for moderation
  created_at: z.string(),
})
export type PostItemOut = z.infer<typeof PostItemOutSchema>

export const PostListOutSchema = z.object({
  items: z.array(PostItemOutSchema),
  total: z.number(),
  page: z.number(),
  page_size: z.number(),
})
export type PostListOut = z.infer<typeof PostListOutSchema>

export const PostDetailOutSchema = PostItemOutSchema
export type PostDetailOut = z.infer<typeof PostDetailOutSchema>

export const PostCreateInSchema = z.object({
  group_id: z.string(),
  title: z.string().min(2, '标题至少2个字').max(100, '标题太长了'),
  content: z.string().min(2, '内容太少啦'),
  images: z.array(z.string()).max(9, '最多9张图片').optional(),
  videos: z.array(z.string()).max(1, '最多1个视频').optional(),
})
export type PostCreateIn = z.infer<typeof PostCreateInSchema>

// --- Comment ---
export const CommentItemOutSchema = z.object({
  id: z.string(),
  post_id: z.string(),
  author_id: z.string(),
  author_name: z.string(),
  author_avatar: z.string().nullable().optional(),
  content: z.string(),
  parent_id: z.string().nullable().optional(),
  reply_to_username: z.string().nullable().optional(),
  like_count: z.number(),
  is_liked: z.boolean(),
  created_at: z.string(),
})
export type CommentItemOut = z.infer<typeof CommentItemOutSchema>

export const CommentListOutSchema = z.object({
  items: z.array(CommentItemOutSchema),
  total: z.number(),
  page: z.number(),
  page_size: z.number(),
})
export type CommentListOut = z.infer<typeof CommentListOutSchema>

export const CommentCreateInSchema = z.object({
  content: z.string().min(1, '说点什么吧'),
  parent_id: z.string().optional(),
})
export type CommentCreateIn = z.infer<typeof CommentCreateInSchema>
