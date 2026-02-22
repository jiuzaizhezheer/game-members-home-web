/** 收藏项响应 */
export type FavoriteItemOut = {
  product_id: string
  product_name: string
  product_image: string | null
  product_price: number
  product_status: 'on' | 'off'
  created_at: string
}

/** 收藏列表响应 */
export type FavoriteListOut = {
  items: FavoriteItemOut[]
  total: number
  page: number
  page_size: number
}

/** 添加收藏请求 */
export type FavoriteAddIn = {
  product_id: string
}

/** 批量取消收藏请求 */
export type FavoriteBatchDeleteIn = {
  product_ids: string[]
}

/** 收藏状态检查响应 */
export type FavoriteCheckOut = {
  is_favorited: boolean
}
