import { requestJson } from '@/shared/api/http'
import type { ConversationListOut, MessageListOut, MessageSendIn } from './types'

export const messageApi = {
  getConversations: () => requestJson<ConversationListOut>('/messages/', {}),

  getMessages: (partnerUserId: string, page = 1, pageSize = 30, productId?: string | null) => {
    const params = new URLSearchParams({
      page: String(page),
      page_size: String(pageSize),
    })
    if (productId) params.set('product_id', productId)
    return requestJson<MessageListOut>(`/messages/${partnerUserId}?${params.toString()}`, {})
  },

  sendMessage: (data: MessageSendIn) =>
    requestJson<void>('/messages/', {
      method: 'POST',
      body: data,
    }),

  markAsRead: (partnerUserId: string, productId?: string | null) =>
    requestJson<void>(
      `/messages/${partnerUserId}/read${productId ? `?product_id=${productId}` : ''}`,
      {
        method: 'PATCH',
        showSuccess: false,
      },
    ),

  getUnreadCount: () => requestJson<number>('/messages/unread/count', {}),
}
