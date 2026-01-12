import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Mail, Lock, ChevronDown, ChevronUp, Store, ShieldCheck, Check } from 'lucide-react'

import type { Role } from '@/features/auth/types'
import { authService } from '@/features/auth/authService'

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

  /** 角色图标映射 */
  const roleIcons = {
    member: User,
    merchant: Store,
    admin: ShieldCheck,
  }

  // 自定义角色图标组件
  const RoleIcon = roleIcons[role]

  /** 角色选项配置 */
  const roleOptions = [
    { value: 'member', label: '普通用户', icon: User, desc: '浏览游戏资讯与周边' },
    { value: 'merchant', label: '合作商家', icon: Store, desc: '管理店铺、发布优惠活动' },
    { value: 'admin', label: '系统管理员', icon: ShieldCheck, desc: '系统维护与全平台管理' },
  ] as const

  // 处理点击外部关闭下拉框
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsSelectOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  /**
   * 处理登录表单提交
   * 
   * 流程：
   * 1. 阻止浏览器默认表单提交行为
   * 2. 开启 loading
   * 3. 调用 authService.login 进行认证
   * 4. 成功则跳转
   * 5. 无论成功失败，最终关闭 loading
   */
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      await authService.login({ email, password, role })
      // TODO: 根据用户角色跳转到不同的路由 (如 /member, /admin, /merchant)
      navigate(`/${role}/home`)
    } catch (err) {
      // 输出到控制台
      console.error('Login failed:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-bg-main px-4 font-sans text-zinc-900">
      {/* 背景装饰元素 */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-rose-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* 卡片上方的欢迎标题 */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900">欢迎来到游戏会员之家</h1>
        </div>

        {/* 登录卡片主体 */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-card-lg ring-1 ring-black/5">
          {/* 顶部装饰性渐变条 */}
          <div className="h-1.5 w-full bg-primary-gradient" />

          <div className="p-8">
            <div className="mb-8 text-center">
              <h2 className="text-xl font-bold text-zinc-900">账号登录</h2>
              <p className="mt-1 text-sm text-zinc-500">选择您的角色以继续访问系统</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              {/* 角色选择 - 自定义下拉框 */}
              <div className="space-y-2">
                <div className="text-sm font-medium text-zinc-700">
                  当前身份
                </div>
                <div className="relative" ref={dropdownRef}>
                  {/* 触发器 */}
                  <button
                    type="button"
                    onClick={() => setIsSelectOpen(!isSelectOpen)}
                    className={`flex h-12 w-full items-center justify-between rounded-full bg-input-bg px-5 text-base text-zinc-900 transition-all focus:ring-2 focus:ring-indigo-500/20 ring-1 ring-black/5 ${isSelectOpen ? 'ring-2 ring-indigo-500/20' : ''
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 text-zinc-500">
                        <RoleIcon size={16} className="text-indigo-600" />
                      </div>
                      <span className="font-medium">
                        {roleOptions.find(opt => opt.value === role)?.label}
                      </span>
                    </div>
                    <div className="text-zinc-400">
                      {isSelectOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </button>

                  {/* 下拉菜单 */}
                  {isSelectOpen && (
                    <div className="absolute left-0 top-full z-50 mt-2 w-full overflow-hidden rounded-2xl border border-zinc-100 bg-white p-1 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200 ring-1 ring-black/5">
                      <div className="max-h-60 overflow-y-auto">
                        {roleOptions.map((option) => {
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
                              className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors ${isActive
                                  ? 'bg-zinc-100 text-indigo-700'
                                  : 'hover:bg-zinc-50 text-zinc-600'
                                }`}
                            >
                              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${isActive ? 'bg-white shadow-sm text-indigo-600 ring-1 ring-black/5' : 'bg-zinc-100 text-zinc-400'
                                }`}>
                                <Icon size={20} />
                              </div>
                              <div className="flex-1 overflow-hidden">
                                <div className="flex items-center justify-between">
                                  <span className={`block font-semibold ${isActive ? 'text-zinc-900' : 'text-zinc-700'}`}>
                                    {option.label}
                                  </span>
                                  {isActive && <Check size={16} className="text-indigo-600" />}
                                </div>
                                <span className={`block truncate text-xs ${isActive ? 'text-indigo-500' : 'text-zinc-400'}`}>
                                  {option.desc}
                                </span>
                              </div>
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
                    id="email-input"
                    type="email"
                    required
                    placeholder="请输入您的邮箱"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 w-full rounded-full bg-input-bg pl-12 pr-4 text-base text-zinc-900 outline-none transition-all placeholder:text-zinc-400 focus:ring-2 focus:ring-indigo-500/20 ring-1 ring-black/5"
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
                    id="password-input"
                    type="password"
                    required
                    placeholder="请输入您的密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 w-full rounded-full bg-input-bg pl-12 pr-4 text-base text-zinc-900 outline-none transition-all placeholder:text-zinc-400 focus:ring-2 focus:ring-indigo-500/20 ring-1 ring-black/5"
                  />
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
                  className="h-12 w-full rounded-full border border-transparent bg-zinc-100 text-base font-semibold text-zinc-600 transition-all hover:bg-zinc-200 hover:text-zinc-900"
                >
                  注册新用户
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
    </div>
  )
}
