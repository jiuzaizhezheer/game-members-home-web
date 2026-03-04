export const PROMOTION_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  EXPIRED: 'expired',
} as const

export const DISCOUNT_TYPES = {
  PERCENT: 'percent',
  FIXED: 'fixed',
} as const

export const PROMOTION_STATUS_OPTIONS = [
  { label: '启用', value: PROMOTION_STATUS.ACTIVE },
  { label: '停用', value: PROMOTION_STATUS.INACTIVE },
]

export const DISCOUNT_TYPE_OPTIONS = [
  { label: '百分比折扣', value: DISCOUNT_TYPES.PERCENT },
  { label: '固定金额减免', value: DISCOUNT_TYPES.FIXED },
]
