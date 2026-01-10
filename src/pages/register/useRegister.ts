import { useEffect, useState } from 'react'

import type { Role } from '@/features/user/types'
import { userService } from '@/features/user/service'
import { authApi } from '@/features/auth/api'

export function useRegister() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<Role>('member')
  const [captchaId, setCaptchaId] = useState<string | null>(null)
  const [captchaImage, setCaptchaImage] = useState<string | null>(null)
  const [captchaCode, setCaptchaCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function refreshCaptcha() {
    setError(null)
    try {
      const captcha = await authApi.getCaptcha()
      setCaptchaId(captcha.id)
      setCaptchaImage(captcha.image)
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取验证码失败')
    }
  }

  useEffect(() => {
    void refreshCaptcha()
  }, [])

  async function submit() {
    setError(null)
    if (!captchaId) {
      setError('验证码未就绪')
      return false
    }
    setSubmitting(true)
    try {
      await userService.register({
        username,
        email,
        password,
        role,
        captcha_id: captchaId,
        captcha_code: captchaCode,
      })
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : '注册失败')
      await refreshCaptcha()
      return false
    } finally {
      setSubmitting(false)
    }
  }

  return {
    username,
    setUsername,
    email,
    setEmail,
    password,
    setPassword,
    role,
    setRole,
    captchaId,
    captchaImage,
    captchaCode,
    setCaptchaCode,
    error,
    submitting,
    submit,
    refreshCaptcha,
  }
}

