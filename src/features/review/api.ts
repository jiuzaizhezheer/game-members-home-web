import { requestJson } from '@/shared/api/http'
import type { ReviewCreateIn, ReviewListOut, ReviewOut, ReviewReplyIn } from './types'

export const reviewApi = {
  /**
   * 发表商品评价 (会员)
   */
  async createReview(payload: ReviewCreateIn): Promise<ReviewOut> {
    return await requestJson<ReviewOut>('/reviews', {
      method: 'POST',
      body: payload,
    })
  },

  /**
   * 获取某商品的评价列表 (公开)
   */
  async getProductReviews(productId: string, page = 1, pageSize = 10): Promise<ReviewListOut> {
    return await requestJson<ReviewListOut>(
      `/reviews/products/${productId}?page=${page}&page_size=${pageSize}`,
      {
        method: 'GET',
        auth: false,
      },
    )
  },

  /**
   * 获取商家收到的评价列表 (商家端)
   */
  async getMerchantReviews(page = 1, pageSize = 10): Promise<ReviewListOut> {
    return await requestJson<ReviewListOut>(
      `/reviews/merchants?page=${page}&page_size=${pageSize}`,
      {
        method: 'GET',
      },
    )
  },

  /**
   * 商家回复评价 (商家端)
   */
  async replyReview(reviewId: string, payload: ReviewReplyIn): Promise<ReviewOut> {
    return await requestJson<ReviewOut>(`/reviews/${reviewId}/reply`, {
      method: 'POST',
      body: payload,
    })
  },
}
