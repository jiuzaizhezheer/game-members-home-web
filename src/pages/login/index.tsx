import { Link, useNavigate } from 'react-router-dom'

import type { Role } from '@/features/user/types'
import { useLogin } from '@/pages/login/useLogin'

export default function LoginPage() {
  const navigate = useNavigate()
  const { email, setEmail, password, setPassword, role, setRole, error, submitting, submit } =
    useLogin()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const ok = await submit()
    if (ok) navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-md px-6 py-16">
        <h1 className="text-2xl font-semibold">登录</h1>
        <p className="mt-2 text-sm text-slate-300">
          还没有账号？<Link className="underline" to="/register">去注册</Link>
        </p>

        <form className="mt-8 space-y-4" onSubmit={onSubmit}>
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
            {submitting ? '提交中…' : '登录'}
          </button>
        </form>
      </div>
    </div>
  )
}

