export type DashboardStats = {
  total_users: number
  total_merchants: number
  total_products: number
  total_orders: number
  pending_audits: number
}

export type AdminProfileOut = {
  id: string
  username: string
  email: string
  role: string
  is_active: boolean
  created_at: string
}

// --- 用户管理 ---
export type AdminUserItemOut = {
  id: string
  username: string
  email: string
  role: 'member' | 'merchant' | 'admin'
  is_active: boolean
  avatar_url: string | null
  created_at: string
}

export type AdminUserListOut = {
  items: AdminUserItemOut[]
  total: number
  page: number
  page_size: number
}

// --- 商家管理 ---
export type AdminMerchantItemOut = {
  user_id: string
  username: string
  email: string
  is_active: boolean
  merchant_id: string
  shop_name: string
  contact_phone: string | null
  shop_desc: string | null
  logo_url: string | null
  created_at: string
}

export type AdminMerchantListOut = {
  items: AdminMerchantItemOut[]
  total: number
  page: number
  page_size: number
}

// --- 商品管理 (复用 product types) ---
export type AdminProductItem = {
  id: string
  name: string
  price: string
  stock: number
  status: string
  sales_count: number
  views_count: number
  image_url: string | null
  merchant_id: string
}

export type AdminProductListOut = {
  items: AdminProductItem[]
  total: number
  page: number
  page_size: number
}

// --- 内容审核 ---
export type AdminPostItem = {
  id: string
  group_id: string
  group_name: string
  author_id: string
  author_name: string
  title: string
  content: string
  is_hidden: boolean
  view_count: number
  comment_count: number
  created_at: string
}

export type AdminPostListOut = {
  items: AdminPostItem[]
  total: number
  page: number
  page_size: number
}

export type AdminCommentItem = {
  id: string
  post_id: string
  author_id: string
  author_name: string
  content: string
  parent_id: string | null
  like_count: number
  created_at: string
}

export type AdminCommentListOut = {
  items: AdminCommentItem[]
  total: number
  page: number
  page_size: number
}

// --- 操作日志 ---
export type AdminLogItem = {
  id: string
  admin_id: string
  action: string
  target_type: string
  target_id: string
  detail: Record<string, unknown> | null
  created_at: string
}

export type AdminLogListOut = {
  items: AdminLogItem[]
  total: number
  page: number
  page_size: number
}
// --- 评价管理 ---
export type AdminReviewItemOut = {
  id: string
  product_id: string
  order_id: string
  user: {
    id: string
    username: string
    avatar: string | null
  }
  rating: number
  content: string
  images: string[]
  merchant_reply: string | null
  reply_at: string | null
  product_name: string | null
  product_image: string | null
  created_at: string
}

export type AdminReviewListOut = {
  items: AdminReviewItemOut[]
  total: number
  page: number
  page_size: number
}
