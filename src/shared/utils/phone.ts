const CHINA_MOBILE_INPUT_PATTERN = /^1[3-9]\d{9}$/
const INVALID_CHINA_MOBILE_NUMBERS = new Set([
  '12341234123',
  '12345678901',
  '19876543210',
  '13800138000',
])

export const CHINA_MOBILE_PHONE_MESSAGE = '请输入有效的中国大陆11位手机号'

export function normalizeChinaMobilePhone(value: string): string {
  const nationalNumber = toChinaMobileNationalNumber(value)
  return nationalNumber ? `+86${nationalNumber}` : value.trim()
}

export function isValidChinaMobilePhone(value: string): boolean {
  const nationalNumber = toChinaMobileNationalNumber(value)
  if (!nationalNumber || !CHINA_MOBILE_INPUT_PATTERN.test(nationalNumber)) {
    return false
  }

  return !isObviousInvalidChinaMobileNumber(nationalNumber)
}

export function toChinaMobileNationalNumber(value: string | null | undefined): string {
  const normalized = (value ?? '').trim().replace(/[\s-]/g, '')
  return normalized.startsWith('+86') ? normalized.slice(3) : normalized
}

function isObviousInvalidChinaMobileNumber(nationalNumber: string): boolean {
  if (INVALID_CHINA_MOBILE_NUMBERS.has(nationalNumber)) {
    return true
  }

  const subscriberNumber = nationalNumber.slice(3)
  if (/^(\d)\1+$/.test(subscriberNumber)) {
    return true
  }

  return (
    '01234567890123456789'.includes(nationalNumber) ||
    '98765432109876543210'.includes(nationalNumber)
  )
}
