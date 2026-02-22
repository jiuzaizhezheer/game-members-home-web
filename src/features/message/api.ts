import { requestJson } from '@/shared/api/http'
import type { ConversationListOut, MessageListOut, MessageSendIn } from './types'

export const messageApi = {
  getConversations: () => requestJson<ConversationListOut>('/messages/', {}),

  getMessages: (partnerUserId: string, page = 1, pageSize = 30) =>
    requestJson<MessageListOut>(
      `/messages/${partnerUserId}?page=${page}&page_size=${pageSize}`,
      {},
    ),

  sendMessage: (data: MessageSendIn) =>
    requestJson<void>('/messages/', {
      method: 'POST',
      body: data,
    }),

  markAsRead: (partnerUserId: string) =>
    requestJson<void>(`/messages/${partnerUserId}/read`, {
      method: 'PATCH',
      showSuccess: false,
    }),

  getUnreadCount: () => requestJson<number>('/messages/unread/count', {}),
}
