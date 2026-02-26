import { requestJson } from '@/shared/api/http'
import type {
  AdminProfileOut,
  AdminUserItemOut,
  AdminUserListOut,
  AdminMerchantItemOut,
  AdminMerchantListOut,
  AdminProductListOut,
  AdminPostListOut,
  AdminCommentListOut,
  AdminLogListOut,
  DashboardStats,
  AdminReviewListOut,
} from './types'
import type { GroupCreateIn, GroupItemOut } from '@/features/community/types'

export const adminApi = {
  /** 获取管理员个人信息 */
  async getProfile(): Promise<AdminProfileOut> {
    return await requestJson<AdminProfileOut>('/admins/profile', { method: 'GET' })
  },

  /** 获取仪表盘统计数据 */
  async getDashboardStats(): Promise<DashboardStats> {
    return await requestJson<DashboardStats>('/admins/dashboard', { method: 'GET' })
  },

  /** 获取操作日志列表 */
  async getLogs(params?: { page?: number; page_size?: number }): Promise<AdminLogListOut> {
    const qs = new URLSearchParams()
    if (params?.page) qs.set('page', String(params.page))
    if (params?.page_size) qs.set('page_size', String(params.page_size))
    return await requestJson<AdminLogListOut>(`/admins/logs/?${qs}`, { method: 'GET' })
  },

  /** 创建社群话题圈 */
  async createCommunityGroup(data: GroupCreateIn): Promise<GroupItemOut> {
    return await requestJson<GroupItemOut>('/admins/communities/groups', {
      method: 'POST',
      body: data,
    })
  },

  // --- 用户管理 ---

  /** 获取用户列表 */
  async getUsers(params?: {
    page?: number
    page_size?: number
    keyword?: string
    role?: string
    is_active?: boolean
  }): Promise<AdminUserListOut> {
    const query = new URLSearchParams()
    if (params?.page) query.set('page', String(params.page))
    if (params?.page_size) query.set('page_size', String(params.page_size))
    if (params?.keyword) query.set('keyword', params.keyword)
    if (params?.role) query.set('role', params.role)
    if (params?.is_active !== undefined) query.set('is_active', String(params.is_active))
    const qs = query.toString()
    return await requestJson<AdminUserListOut>(`/admins/users/${qs ? `?${qs}` : ''}`, {
      method: 'GET',
    })
  },

  /** 获取用户详情 */
  async getUserDetail(id: string): Promise<AdminUserItemOut> {
    return await requestJson<AdminUserItemOut>(`/admins/users/${id}`, { method: 'GET' })
  },

  /** 禁用用户 */
  async disableUser(id: string): Promise<void> {
    await requestJson<void>(`/admins/users/${id}/disable`, { method: 'PATCH' })
  },

  /** 启用用户 */
  async enableUser(id: string): Promise<void> {
    await requestJson<void>(`/admins/users/${id}/enable`, { method: 'PATCH' })
  },

  // --- 商家管理 ---

  /** 获取商家列表 */
  async getMerchants(params?: {
    page?: number
    page_size?: number
    keyword?: string
  }): Promise<AdminMerchantListOut> {
    const query = new URLSearchParams()
    if (params?.page) query.set('page', String(params.page))
    if (params?.page_size) query.set('page_size', String(params.page_size))
    if (params?.keyword) query.set('keyword', params.keyword)
    const qs = query.toString()
    return await requestJson<AdminMerchantListOut>(`/admins/merchants/${qs ? `?${qs}` : ''}`, {
      method: 'GET',
    })
  },

  /** 获取商家详情 */
  async getMerchantDetail(id: string): Promise<AdminMerchantItemOut> {
    return await requestJson<AdminMerchantItemOut>(`/admins/merchants/${id}`, { method: 'GET' })
  },

  /** 审核商家（启用/禁用） */
  async verifyMerchant(id: string, is_active: boolean): Promise<void> {
    await requestJson<void>(`/admins/merchants/${id}/verify?is_active=${is_active}`, {
      method: 'PATCH',
    })
  },

  // --- 商品管理 ---

  /** 获取全平台商品列表 */
  async getProducts(params?: {
    page?: number
    page_size?: number
    keyword?: string
    status?: string
  }): Promise<AdminProductListOut> {
    const query = new URLSearchParams()
    if (params?.page) query.set('page', String(params.page))
    if (params?.page_size) query.set('page_size', String(params.page_size))
    if (params?.keyword) query.set('keyword', params.keyword)
    if (params?.status) query.set('status', params.status)
    const qs = query.toString()
    return await requestJson<AdminProductListOut>(`/admins/products/${qs ? `?${qs}` : ''}`, {
      method: 'GET',
    })
  },

  /** 强制下架商品 */
  async forceOfflineProduct(id: string): Promise<void> {
    await requestJson<void>(`/admins/products/${id}/offline`, { method: 'PATCH' })
  },

  // --- 内容审核 ---

  /** 获取全平台帖子列表 */
  async getPosts(params?: {
    page?: number
    page_size?: number
    keyword?: string
    is_hidden?: boolean
  }): Promise<AdminPostListOut> {
    const query = new URLSearchParams()
    if (params?.page) query.set('page', String(params.page))
    if (params?.page_size) query.set('page_size', String(params.page_size))
    if (params?.keyword) query.set('keyword', params.keyword)
    if (params?.is_hidden !== undefined) query.set('is_hidden', String(params.is_hidden))
    const qs = query.toString()
    return await requestJson<AdminPostListOut>(`/admins/communities/posts${qs ? `?${qs}` : ''}`, {
      method: 'GET',
    })
  },

  /** 审核帖子（隐藏/显示） */
  async reviewPost(id: string, is_hidden: boolean): Promise<void> {
    await requestJson<void>(`/admins/communities/posts/${id}/review?is_hidden=${is_hidden}`, {
      method: 'PATCH',
    })
  },

  /** 删除帖子 */
  async deletePost(id: string): Promise<void> {
    await requestJson<void>(`/admins/communities/posts/${id}`, { method: 'DELETE' })
  },

  /** 获取全平台评论列表 */
  async getComments(params?: {
    page?: number
    page_size?: number
    post_id?: string
  }): Promise<AdminCommentListOut> {
    const query = new URLSearchParams()
    if (params?.page) query.set('page', String(params.page))
    if (params?.page_size) query.set('page_size', String(params.page_size))
    if (params?.post_id) query.set('post_id', params.post_id)
    const qs = query.toString()
    return await requestJson<AdminCommentListOut>(
      `/admins/communities/comments${qs ? `?${qs}` : ''}`,
      { method: 'GET' },
    )
  },

  /** 删除评论 */
  async deleteComment(id: string): Promise<void> {
    await requestJson<void>(`/admins/communities/comments/${id}`, { method: 'DELETE' })
  },

  // --- 评价管理 ---

  /** 获取全平台评价列表 */
  async getReviews(params?: {
    page?: number
    page_size?: number
    keyword?: string
  }): Promise<AdminReviewListOut> {
    const query = new URLSearchParams()
    if (params?.page) query.set('page', String(params.page))
    if (params?.page_size) query.set('page_size', String(params.page_size))
    if (params?.keyword) query.set('keyword', params.keyword)
    const qs = query.toString()
    return await requestJson<AdminReviewListOut>(`/admins/reviews${qs ? `?${qs}` : ''}`, {
      method: 'GET',
    })
  },

  /** 删除评价 */
  async deleteReview(id: string): Promise<void> {
    await requestJson<void>(`/admins/reviews/${id}`, { method: 'DELETE' })
  },
}
