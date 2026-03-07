import { z } from 'zod'

// ==========================================
// Schemas
// ==========================================

export const SystemNotificationSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  type: z.string(), // system, order, social
  title: z.string(),
  content: z.string(),
  link: z.string().nullable().optional(),
  is_read: z.boolean(),
  created_at: z.string(),
})

export const NotificationListOutSchema = z.object({
  items: z.array(SystemNotificationSchema),
  total: z.number(),
  page: z.number(),
  page_size: z.number(),
})

export const UnreadCountOutSchema = z.object({
  count: z.number(),
})

// ==========================================
// Types
// ==========================================

export type SystemNotification = z.infer<typeof SystemNotificationSchema>
export type NotificationListOut = z.infer<typeof NotificationListOutSchema>
export type UnreadCountOut = z.infer<typeof UnreadCountOutSchema>
