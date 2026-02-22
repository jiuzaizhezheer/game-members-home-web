export interface MessageSendIn {
  receiver_user_id: string
  content: string
  content_type?: string
  order_id?: string
}

export interface MessageItemOut {
  id: string
  sender_id: string
  content: string
  content_type: string
  is_mine: boolean
  created_at: string
}

export interface ConversationItemOut {
  partner_user_id: string
  partner_name: string
  last_message: string
  last_message_type: string
  last_message_at: string
  unread_count: number
  avatar_url?: string
}

export interface ConversationListOut {
  items: ConversationItemOut[]
}

export interface MessageListOut {
  items: MessageItemOut[]
  has_more: boolean
}
