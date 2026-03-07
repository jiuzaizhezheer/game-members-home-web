import { requestJson } from '@/shared/api/http'
import type { NotificationListOut, UnreadCountOut } from './types'

export const notificationApi = {
  /**
   * 获取当前用户的未读消息数
   */
  getUnreadCount: () =>
    requestJson<UnreadCountOut>('/notifications/unread-count', { method: 'GET' }),

  /**
   * 获取当前用户的系统通知列表
   */
  getMyNotifications: (params?: {
    page?: number
    page_size?: number
    notification_type?: string
  }) => requestJson<NotificationListOut>('/notifications/my', { method: 'GET', params }),

  /**
   * 标记某一特定通知为已读
   */
  markAsRead: (notificationId: string) =>
    requestJson<boolean>(`/notifications/${notificationId}/read`, { method: 'POST' }),

  /**
   * 一键已读所有通知
   */
  markAllAsRead: () => requestJson<number>('/notifications/read-all', { method: 'POST' }),
}
