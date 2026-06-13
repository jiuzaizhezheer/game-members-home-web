export interface MessageSendIn {
  receiver_user_id: string
  content: string
  content_type?: string
  product_id?: string
  order_id?: string
}

export interface MessageItemOut {
  id: string
  sender_id: string
  content: string
  content_type: string
  product_id?: string | null
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
  product_id?: string | null
  product_name?: string | null
  product_image?: string | null
}

export interface ConversationListOut {
  items: ConversationItemOut[]
}

export interface MessageListOut {
  items: MessageItemOut[]
  has_more: boolean
}
