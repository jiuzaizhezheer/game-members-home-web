import type { ReactNode } from 'react'
import { AuthProvider } from '@/contexts/AuthContext'
import { ConfirmProvider } from '@/components/ui/ConfirmDialog'
import { Toaster } from 'sonner'

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ConfirmProvider>
        {children}
        <Toaster position="top-center" richColors theme="light" />
      </ConfirmProvider>
    </AuthProvider>
  )
}
