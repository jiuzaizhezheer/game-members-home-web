import { messageApi } from './api'
import type { MessageSendIn } from './types'

export const messageService = {
  async getConversations() {
    return await messageApi.getConversations()
  },

  async getMessages(partnerUserId: string, page?: number, pageSize?: number) {
    return await messageApi.getMessages(partnerUserId, page, pageSize)
  },

  async sendMessage(data: MessageSendIn) {
    return await messageApi.sendMessage(data)
  },

  async markAsRead(partnerUserId: string) {
    return await messageApi.markAsRead(partnerUserId)
  },

  async getUnreadCount() {
    return await messageApi.getUnreadCount()
  },
}
