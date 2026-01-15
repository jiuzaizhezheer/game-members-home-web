import type { ReactNode } from 'react'
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext'
import { Toaster } from 'sonner'

/**
 * 内部渲染器，用于获取 Context 中的主题并传给 Toaster
 */
function ToasterProvider() {
  const { theme } = useTheme()
  return <Toaster position="top-center" richColors theme={theme} />
}

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        {children}
        <ToasterProvider />
      </AuthProvider>
    </ThemeProvider>
  )
}
