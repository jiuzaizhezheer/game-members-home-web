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
