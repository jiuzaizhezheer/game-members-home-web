import { requestJson } from '@/shared/api/http'
import {
  type PromotionCreateIn,
  type PromotionDetailOut,
  type PromotionListOut,
  type PromotionOut,
  type PromotionUpdateIn,
  type CouponOut,
  type UserCouponOut,
} from './types'

const BASE_URL = '/merchants/promotions'

export const promotionApi = {
  list: (params?: { page?: number; page_size?: number }) => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.page_size) searchParams.set('page_size', params.page_size.toString())

    return requestJson<PromotionListOut>(`${BASE_URL}?${searchParams.toString()}`, {
      method: 'GET',
    })
  },

  get: (id: string) => requestJson<PromotionDetailOut>(`${BASE_URL}/${id}`, { method: 'GET' }),

  create: (data: PromotionCreateIn) =>
    requestJson<PromotionOut>(BASE_URL, {
      method: 'POST',
      body: data,
    }),

  update: (id: string, data: PromotionUpdateIn) =>
    requestJson<PromotionOut>(`${BASE_URL}/${id}`, {
      method: 'PUT',
      body: data,
    }),

  delete: (id: string) => requestJson<void>(`${BASE_URL}/${id}`, { method: 'DELETE' }),
}

const COUPON_BASE_URL = '/coupons'

export const couponApi = {
  getCenter: (params?: { page?: number; page_size?: number }) => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.page_size) searchParams.set('page_size', params.page_size.toString())

    return requestJson<CouponOut[]>(`${COUPON_BASE_URL}/center?${searchParams.toString()}`, {
      method: 'GET',
    })
  },

  getMyCoupons: (params?: { page?: number; page_size?: number; status?: string }) => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.page_size) searchParams.append('page_size', params.page_size.toString())
    if (params?.status) searchParams.append('status', params.status)

    return requestJson<UserCouponOut[]>(`${COUPON_BASE_URL}/my?${searchParams.toString()}`, {
      method: 'GET',
    })
  },

  claim: (couponId: string) =>
    requestJson<UserCouponOut>(`${COUPON_BASE_URL}/claim`, {
      method: 'POST',
      body: { coupon_id: couponId },
    }),
}
