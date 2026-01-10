import { Link, useNavigate } from 'react-router-dom'

import type { Role } from '@/features/user/types'
import { useRegister } from '@/pages/register/useRegister'

export default function RegisterPage() {
  const navigate = useNavigate()
  const {
    username,
    setUsername,
    email,
    setEmail,
    password,
    setPassword,
    role,
    setRole,
    captchaImage,
    captchaCode,
    setCaptchaCode,
    error,
    submitting,
    submit,
    refreshCaptcha,
  } = useRegister()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const ok = await submit()
    if (ok) navigate('/login')
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-md px-6 py-16">
        <h1 className="text-2xl font-semibold">注册</h1>
        <p className="mt-2 text-sm text-slate-300">
          已有账号？<Link className="underline" to="/login">去登录</Link>
        </p>

        <form className="mt-8 space-y-4" onSubmit={onSubmit}>
          <label className="block">
            <div className="mb-1 text-sm text-slate-300">用户名</div>
            <input
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              minLength={5}
              required
            />
          </label>

          <label className="block">
            <div className="mb-1 text-sm text-slate-300">邮箱</div>
            <input
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label className="block">
            <div className="mb-1 text-sm text-slate-300">密码</div>
            <input
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </label>

          <label className="block">
            <div className="mb-1 text-sm text-slate-300">角色</div>
            <select
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2"
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
            >
              <option value="member">member</option>
              <option value="merchant">merchant</option>
              <option value="admin">admin</option>
            </select>
          </label>

          <div className="rounded-md border border-slate-800 bg-slate-900 p-3">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-sm text-slate-300">验证码</div>
              <button
                type="button"
                className="text-sm underline"
                onClick={() => void refreshCaptcha()}
              >
                换一张
              </button>
            </div>
            {captchaImage ? (
              <img
                className="mb-3 h-12 w-auto select-none rounded bg-white"
                src={captchaImage}
                alt="captcha"
                onClick={() => void refreshCaptcha()}
              />
            ) : (
              <div className="mb-3 h-12 rounded bg-slate-800" />
            )}
            <input
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2"
              value={captchaCode}
              onChange={(e) => setCaptchaCode(e.target.value)}
              placeholder="输入 6 位验证码"
              minLength={6}
              maxLength={6}
              required
            />
          </div>

          {error ? (
            <div className="rounded-md border border-rose-700 bg-rose-950 px-3 py-2 text-sm text-rose-200">
              {error}
            </div>
          ) : null}

          <button
            className="w-full rounded-md bg-slate-100 px-4 py-2 text-slate-900 disabled:opacity-60"
            type="submit"
            disabled={submitting}
          >
            {submitting ? '提交中…' : '注册'}
          </button>
        </form>
      </div>
    </div>
  )
}

