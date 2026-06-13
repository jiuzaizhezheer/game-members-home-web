import { messageApi } from './api'
import type { MessageSendIn } from './types'

export const messageService = {
  async getConversations() {
    return await messageApi.getConversations()
  },

  async getMessages(
    partnerUserId: string,
    page?: number,
    pageSize?: number,
    productId?: string | null,
  ) {
    return await messageApi.getMessages(partnerUserId, page, pageSize, productId)
  },

  async sendMessage(data: MessageSendIn) {
    return await messageApi.sendMessage(data)
  },

  async markAsRead(partnerUserId: string, productId?: string | null) {
    return await messageApi.markAsRead(partnerUserId, productId)
  },

  async getUnreadCount() {
    return await messageApi.getUnreadCount()
  },
}
