export type DashboardOverviewOut = {
  total_sales: number
  order_count: number
  product_count: number
  today_sales: number
}

export type SalesTrendItem = {
  date: string
  sales: number
  orders: number
}

export type SalesTrendOut = {
  items: SalesTrendItem[]
}

export type ProductRankingItem = {
  product_id: string
  product_name: string
  image_url: string | null
  sales_amount: number
  sales_quantity: number
}

export type ProductRankingOut = {
  items: ProductRankingItem[]
}
