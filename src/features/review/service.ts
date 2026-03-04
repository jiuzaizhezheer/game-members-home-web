import { reviewApi } from './api'
import type { ReviewCreateIn, ReviewListOut, ReviewOut, ReviewReplyIn } from './types'

export const reviewService = {
  /** 发表商品评价 */
  async createReview(payload: ReviewCreateIn): Promise<ReviewOut> {
    return await reviewApi.createReview(payload)
  },

  /** 分页获取某商品的评价记录 */
  async getProductReviews(productId: string, page = 1, pageSize = 10): Promise<ReviewListOut> {
    return await reviewApi.getProductReviews(productId, page, pageSize)
  },

  /** 分页获取商家的收到评价记录 */
  async getMerchantReviews(page = 1, pageSize = 10): Promise<ReviewListOut> {
    return await reviewApi.getMerchantReviews(page, pageSize)
  },

  /** 商家回复评价 */
  async replyReview(reviewId: string, payload: ReviewReplyIn): Promise<ReviewOut> {
    return await reviewApi.replyReview(reviewId, payload)
  },
}
