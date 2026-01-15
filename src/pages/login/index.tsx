import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, ChevronDown, ChevronUp, Check, Eye, EyeOff } from 'lucide-react'

import type { Role } from '@/features/auth/types'
import { authService } from '@/features/auth/authService'
import { ROLE_ICONS, ROLE_OPTIONS } from '@/features/auth/constants'
import { useClickOutside } from '@/hooks/useClickOutside'

/**
 * 首页组件 - 用户登录注册入口
 *
 * 功能：
 * - 提供邮箱/密码登录表单
 * - 支持角色选择（普通用户/商家/管理员）
 * - 登录成功后跳转到 Home
 */
export default function HomePage() {
  /** 导航 */
  const navigate = useNavigate()

  // ==================== 引用 (Refs) ====================
  /** 下拉框容器引用，用于处理点击外部关闭 */
  const dropdownRef = useRef<HTMLDivElement>(null)

  // ==================== 表单状态 ====================
  /** 用户邮箱 */
  const [email, setEmail] = useState('')
  /** 用户密码 */
  const [password, setPassword] = useState('')
  /** 用户角色：member | merchant | admin */
  const [role, setRole] = useState<Role>('member')

  // ==================== UI 状态 ====================
  /** 是否正在提交登录请求 */
  const [loading, setLoading] = useState(false)
  /** 下拉框是否处于开启状态 */
  const [isSelectOpen, setIsSelectOpen] = useState(false)
  /** 密码是否可见 */
  const [showPassword, setShowPassword] = useState(false)

  // 自定义角色图标组件
  const RoleIcon = ROLE_ICONS[role]

  // 处理点击外部关闭下拉框
  useClickOutside(dropdownRef, () => setIsSelectOpen(false))

  /**
   * 处理登录表单提交
   */
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      await authService.login({ email, password, role })
      // 根据用户角色跳转到不同的路由 (如 /member, /merchant, /admin)
      navigate(`/${role}/home`)
    } catch (err) {
      // 输出到控制台
      console.error('Login failed:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* 卡片上方的欢迎标题 */}
      <div className="mb-5 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">欢迎来到游戏会员之家</h1>
      </div>

      {/* 登录卡片主体 */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-card-lg ring-1 ring-black/5">
        {/* 顶部装饰性渐变条 */}
        <div className="h-1.5 w-full bg-primary-gradient" />

        <div className="p-5">
          <div className="mb-8 text-center">
            <h2 className="text-xl font-bold text-zinc-900">账号登录</h2>
            <p className="mt-1 text-sm text-zinc-500">选择您的角色以继续访问系统</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* 角色选择 - 自定义下拉框 */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-zinc-700">当前身份</div>
              <div className="relative" ref={dropdownRef}>
                {/* 触发器 */}
                <button
                  type="button"
                  onClick={() => setIsSelectOpen(!isSelectOpen)}
                  className={`flex h-12 w-full items-center justify-between rounded-xl bg-zinc-50 px-5 text-base text-zinc-900 transition-all focus:ring-2 focus:ring-indigo-500/20 ring-1 ring-black/5 ${isSelectOpen ? 'ring-2 ring-indigo-500/20' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 text-zinc-500">
                      <RoleIcon size={20} className="text-indigo-600" />
                    </div>
                    <span className="font-medium">
                      {ROLE_OPTIONS.find((opt) => opt.value === role)?.label}
                    </span>
                  </div>
                  <div className="text-zinc-400">
                    {isSelectOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </button>

                {/* 下拉菜单 */}
                {isSelectOpen && (
                  <div className="absolute left-0 top-full z-50 mt-2 w-full overflow-hidden rounded-2xl border border-zinc-100 bg-white p-1 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200 ring-1 ring-black/5">
                    <div className="max-h-60 overflow-y-auto">
                      {ROLE_OPTIONS.map((option) => {
                        const Icon = option.icon
                        const isActive = role === option.value
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                              setRole(option.value as Role)
                              setIsSelectOpen(false)
                            }}
                            className={`group flex w-full items-center gap-3 rounded-xl p-3 text-left transition-all duration-200 ${
                              isActive
                                ? 'bg-indigo-50/80 text-indigo-700 shadow-sm'
                                : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 hover:shadow-md'
                            }`}
                          >
                            <div
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors ${
                                isActive
                                  ? 'bg-white shadow-sm text-indigo-600 ring-1 ring-indigo-100'
                                  : 'bg-zinc-100 text-zinc-400 group-hover:bg-white group-hover:shadow-sm group-hover:text-zinc-600 group-hover:ring-1 group-hover:ring-zinc-200'
                              }`}
                            >
                              <Icon size={20} />
                            </div>
                            <div className="flex-1 overflow-hidden">
                              <span
                                className={`block font-semibold ${isActive ? 'text-indigo-900' : 'text-zinc-600 group-hover:text-zinc-900'}`}
                              >
                                {option.label}
                              </span>
                              <span
                                className={`block truncate text-[11px] leading-tight ${isActive ? 'text-indigo-500' : 'text-zinc-400 group-hover:text-zinc-500'}`}
                              >
                                {option.desc}
                              </span>
                            </div>
                            {isActive && <Check size={20} className="text-indigo-600 shrink-0" />}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 邮箱输入 */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-zinc-700">邮箱</div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-400">
                  <Mail size={20} />
                </div>
                <input
                  type="email"
                  required
                  placeholder="请输入您的邮箱"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 w-full rounded-xl bg-zinc-50 pl-12 pr-4 text-base text-zinc-900 outline-none transition-all placeholder:text-zinc-400 focus:ring-2 focus:ring-indigo-500/20 ring-1 ring-black/5"
                />
              </div>
            </div>

            {/* 密码输入 */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-zinc-700">密码</div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-400">
                  <Lock size={20} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="请输入您的密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 w-full rounded-xl bg-zinc-50 pl-12 pr-12 text-base text-zinc-900 outline-none transition-all placeholder:text-zinc-400 focus:ring-2 focus:ring-indigo-500/20 ring-1 ring-black/5"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-zinc-400 hover:text-zinc-600 transition-colors"
                >
                  {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
              </div>
            </div>

            {/* 操作按钮组 */}
            <div className="space-y-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="h-12 w-full rounded-full bg-zinc-900 text-base font-semibold text-white shadow-lg shadow-zinc-900/10 transition-all hover:bg-zinc-800 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70"
              >
                {loading ? '登录中...' : '登录'}
              </button>

              <button
                type="button"
                onClick={() => navigate('/register')}
                className="h-12 w-full rounded-full border border-transparent bg-zinc-100 text-base font-semibold text-zinc-600 transition-all hover:bg-zinc-200 hover:text-zinc-900"
              >
                暂无账号 去注册
              </button>
            </div>

            {/* 底部辅助链接 */}
            <div className="text-center text-sm">
              <span className="text-zinc-500">忘记密码？</span>{' '}
              <button type="button" className="font-semibold text-indigo-600 hover:underline">
                点击找回
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
