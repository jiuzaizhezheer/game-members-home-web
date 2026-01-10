import { useState } from 'react'

import type { Role } from '@/features/user/types'
import { authService } from '@/services/authService'

export function useLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<Role>('member')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function submit() {
    setError(null)
    setSubmitting(true)
    try {
      await authService.login({ email, password, role })
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败')
      return false
    } finally {
      setSubmitting(false)
    }
  }

  return {
    email,
    setEmail,
    password,
    setPassword,
    role,
    setRole,
    error,
    submitting,
    submit,
  }
}

