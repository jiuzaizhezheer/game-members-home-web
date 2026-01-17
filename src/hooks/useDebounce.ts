import { useEffect, useState } from 'react'

/**
 * 防抖 Hook - 延迟更新值，直到指定时间内没有新的变化
 */
export function useDebounce<T>(value: T, delayMs: number): T {
  // 存储防抖后的值
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    // 设置定时器，在 delayMs 毫秒后更新防抖值
    const id = window.setTimeout(() => setDebouncedValue(value), delayMs)
    // 清理函数：当 value 或 delayMs 变化时，取消上一个定时器
    // 这确保只有最后一次变化会触发更新
    return () => window.clearTimeout(id)
  }, [value, delayMs]) // 依赖项：value 或 delayMs 变化时重新执行

  return debouncedValue
}
