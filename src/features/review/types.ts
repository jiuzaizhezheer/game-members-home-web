export interface ReviewUserOut {
  id: string
  username: string
  avatar?: string | null
}

export interface ReviewCreateIn {
  order_id: string
  product_id: string
  rating: number
  content: string
  images?: string[]
}

export interface ReviewReplyIn {
  merchant_reply: string
}

export interface ReviewOut {
  id: string
  product_id: string
  order_id: string
  user: ReviewUserOut
  rating: number
  content: string
  images: string[]
  merchant_reply?: string | null
  reply_at?: string | null
  created_at: string
  updated_at: string
}

export interface ReviewListOut {
  items: ReviewOut[]
  total: number
  page: number
  page_size: number
  total_pages: number
}
