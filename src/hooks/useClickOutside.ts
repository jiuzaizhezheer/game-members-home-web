import { useEffect, useRef } from 'react'

/**
 * 自定义 Hook，用于检测点击事件是否在指定元素外部触发
 * @param ref - 目标元素的引用对象
 * @param handler - 点击外部时触发的回调函数
 */
export function useClickOutside<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  handler: (event: MouseEvent) => void
) {
  // 使用 ref 存储最新的 handler，避免 useEffect 依赖 handler 导致频繁重绑定
  const savedHandler = useRef(handler)

  // 每次渲染后更新最新的 handler
  useEffect(() => {
    savedHandler.current = handler
  }, [handler])

  useEffect(() => {
    /**
     * 点击事件处理器
     */
    function handleClickOutside(event: MouseEvent) {
      // 如果点击的目标不在 ref 关联的元素内，则触发回调
      if (ref.current && event.target instanceof Node && !ref.current.contains(event.target)) {
        savedHandler.current(event)
      }
    }

    // 绑定全局点击事件
    document.addEventListener('mousedown', handleClickOutside)
    
    // 组件卸载时移除事件绑定，防止内存泄漏
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [ref])
}
