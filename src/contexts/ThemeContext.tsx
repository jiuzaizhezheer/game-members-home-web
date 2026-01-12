import { createContext, type ReactNode, useContext, useMemo, useState } from 'react'

/**
 * 主题类型：深色或浅色
 */
export type Theme = 'dark' | 'light'

/**
 * 主题上下文值类型
 */
type ThemeContextValue = {
  /** 当前主题名称 */
  theme: Theme
  /** 切换主题的函数 */
  setTheme: (theme: Theme) => void
}

/**
 * 主题上下文对象
 */
const ThemeContext = createContext<ThemeContextValue | null>(null)

/**
 * 主题提供者组件
 * 负责管理和提供全局的主题状态（深色/浅色模式）
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark')

  /**
   * 构造上下文值，仅在主题改变时重新计算
   */
  const value = useMemo<ThemeContextValue>(() => ({ theme, setTheme }), [theme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

/**
 * 获取主题上下文的 Hook
 * @throws {Error} 如果在 ThemeProvider 之外使用则抛出异常
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('ThemeProvider missing')
  return ctx
}

