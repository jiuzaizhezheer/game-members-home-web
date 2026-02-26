import { z } from 'zod'

import type { AddressOut } from '@/features/address/types'

export const OrderCreateInSchema = z.object({
  address_id: z.string().uuid({ message: '请选择有效的收货地址' }),
})

export type OrderCreateIn = z.infer<typeof OrderCreateInSchema>

export const BuyNowInSchema = z.object({
  product_id: z.string().uuid(),
  quantity: z.number().int().min(1),
  address_id: z.string().uuid({ message: '请选择有效的收货地址' }),
})

export type BuyNowIn = z.infer<typeof BuyNowInSchema>

export const OrderShipInSchema = z.object({
  courier_name: z.string().min(1, '请输入快递公司名称').max(64),
  tracking_no: z.string().min(1, '请输入运单号').max(64),
})

export type OrderShipIn = z.infer<typeof OrderShipInSchema>

export const OrderRefundApplyInSchema = z.object({
  reason: z.string().min(1, '请输入退款原因').max(255),
})

export type OrderRefundApplyIn = z.infer<typeof OrderRefundApplyInSchema>

export interface OrderRefundOut {
  id: string
  order_id: string
  user_id: string
  reason: string
  amount: number | string
  status: 'pending' | 'approved' | 'rejected'
  merchant_reply?: string | null
  created_at: string
  updated_at?: string | null
}

export interface OrderItemOut {
  id: string
  product_id: string
  product_name: string
  quantity: number
  unit_price: number | string
  product_image: string | null
  is_reviewed?: boolean
}

export interface OrderOut {
  id: string
  order_no: string
  status:
    | 'pending'
    | 'paid'
    | 'shipped'
    | 'completed'
    | 'cancelled'
    | 'refunding'
    | 'refunded'
    | 'closed'
    | 'rejected'
  total_amount: number | string
  address_id: string | null
  address: AddressOut | null
  courier_name?: string | null
  tracking_no?: string | null
  refund_status?: 'pending' | 'approved' | 'rejected' | null
  created_at: string
  paid_at?: string | null
  shipped_at?: string | null
  completed_at?: string | null
  items: OrderItemOut[]
}

export interface OrderListOut {
  items: OrderOut[]
  total: number
  page: number
  page_size: number
}
