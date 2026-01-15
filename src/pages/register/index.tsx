import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, ChevronDown, ChevronUp, Check, RefreshCw, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import { ZodError } from 'zod'

import type { Role } from '@/features/auth/types'
import { authService } from '@/features/auth/authService'
import { commonApi } from '@/features/common/api'
import { ROLE_ICONS, ROLE_OPTIONS } from '@/features/auth/constants'
import { useClickOutside } from '@/hooks/useClickOutside'
import { RegisterSchema } from '@/features/auth/types'

/**
 * 注册页面组件
 */
export default function RegisterPage() {
  /** 导航 */
  const navigate = useNavigate()

  // ==================== 引用 (Refs) ====================
  /** 下拉框容器引用 */
  const dropdownRef = useRef<HTMLDivElement>(null)

  // ==================== 表单状态 ====================
  /** 用户名 */
  const [username, setUsername] = useState('')
  /** 用户邮箱 */
  const [email, setEmail] = useState('')
  /** 用户密码 */
  const [password, setPassword] = useState('')
  /** 用户角色 */
  const [role, setRole] = useState<Role>('member')
  /** 验证码 ID */
  const [captchaId, setCaptchaId] = useState('')
  /** 验证码输入值 */
  const [captchaCode, setCaptchaCode] = useState('')

  // ==================== UI 状态 ====================
  /** 验证码图片 (Base64) */
  const [captchaImage, setCaptchaImage] = useState('')
  /** 是否正在加载验证码 */
  const [captchaLoading, setCaptchaLoading] = useState(false)
  /** 是否正在提交 */
  const [loading, setLoading] = useState(false)
  /** 下拉框是否开启 */
  const [isSelectOpen, setIsSelectOpen] = useState(false)
  /** 密码是否可见 */
  const [showPassword, setShowPassword] = useState(false)

  // 自定义角色图标组件
  const RoleIcon = ROLE_ICONS[role]

  // 处理点击外部关闭下拉框
  useClickOutside(dropdownRef, () => setIsSelectOpen(false))

  /**
   * 获取验证码
   */
  const fetchCaptcha = useCallback(async () => {
    setCaptchaLoading(true)
    try {
      const data = await commonApi.getCaptcha()
      setCaptchaId(data.id)
      setCaptchaImage(data.image)
      setCaptchaCode('') // 刷新后清空输入
    } catch (err) {
      console.error('Failed to fetch captcha:', err)
    } finally {
      setCaptchaLoading(false)
    }
  }, [])

  /**
   * 处理注册表单提交
   */
  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    
    if (!captchaId) {
      toast.error('请先获取验证码')
      return
    }

    setLoading(true)
    try {
      // 1. 构造表单数据
      const formData = {
        username,
        email,
        password,
        role,
        captcha_id: captchaId,
        captcha_code: captchaCode,
      }

      // 2. 使用 Zod Schema 进行校验
      // .parse() 会在校验失败时抛出异常，这里我们用 parse 而不是 safeParse，因为下面有 catch 块统一处理
      RegisterSchema.parse(formData)

      // 3. 校验通过，发起请求
      await authService.register(formData)
      
      toast.success('注册成功，请登录')
      // 注册成功跳转到登录页
      navigate('/login')
    } catch (err) {
      if (err instanceof ZodError) {
        // 如果是校验错误，显示第一条错误信息
        const firstError = err.issues[0]?.message || '表单校验失败'
        toast.error(firstError)
      } else {
        // 其他错误（如网络错误、后端报错）
        console.error('Register failed:', err)
        // 注册失败通常需要刷新验证码
        fetchCaptcha()
      }
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

      <div className="relative z-10 w-full max-w-md my-5">
        {/* 顶部标题 */}
        <div className="mb-4 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">创建新账号</h1>
        </div>

        {/* 注册卡片主体 */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-card-lg ring-1 ring-black/5">
          {/* 顶部装饰性渐变条 */}
          <div className="h-1.5 w-full bg-primary-gradient" />

          <div className="p-5">
            <div className="mb-4 text-center">
              <h2 className="text-xl font-bold text-zinc-900">账号注册</h2>
              <p className="mt-1 text-sm text-zinc-500">请填写以下信息完成注册</p>
            </div>

            <form onSubmit={handleRegister} className="space-y-3">
              {/* 角色选择 */}
              <div className="space-y-2">
                <div className="text-sm font-medium text-zinc-700">
                  当前身份
                </div>
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsSelectOpen(!isSelectOpen)}
                    className={`flex h-11 w-full items-center justify-between rounded-xl bg-zinc-50 px-5 text-sm text-zinc-900 transition-all focus:ring-2 focus:ring-indigo-500/20 ring-1 ring-black/5 ${isSelectOpen ? 'ring-2 ring-indigo-500/20' : ''
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-zinc-500 shadow-sm ring-1 ring-black/5">
                        <RoleIcon size={20} className="text-indigo-600" />
                      </div>
                      <span className="font-medium">
                        {ROLE_OPTIONS.find(opt => opt.value === role)?.label}
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
                              className={`group flex w-full items-center gap-3 rounded-xl p-3 text-left transition-all duration-200 ${isActive
                                ? 'bg-indigo-50/80 text-indigo-700 shadow-sm'
                                : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 hover:shadow-md'
                                }`}
                            >
                              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors ${isActive
                                ? 'bg-white shadow-sm text-indigo-600 ring-1 ring-indigo-100'
                                : 'bg-zinc-100 text-zinc-400 group-hover:bg-white group-hover:shadow-sm group-hover:text-zinc-600 group-hover:ring-1 group-hover:ring-zinc-200'
                                }`}>
                                <Icon size={20} />
                              </div>
                              <div className="flex-1 overflow-hidden">
                                <span className={`block font-semibold ${isActive ? 'text-indigo-900' : 'text-zinc-600 group-hover:text-zinc-900'}`}>
                                  {option.label}
                                </span>
                                <span className={`block truncate text-[11px] leading-tight ${isActive ? 'text-indigo-500' : 'text-zinc-400 group-hover:text-zinc-500'}`}>
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

              {/* 用户名输入 */}
              <div className="space-y-2">
                <div className="text-sm font-medium text-zinc-700">用户名</div>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-400">
                    <RoleIcon size={20} />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="就在这这er"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="h-10 w-full rounded-xl bg-zinc-50 pl-12 pr-4 text-sm text-zinc-900 outline-none transition-all placeholder:text-zinc-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 ring-1 ring-black/5"
                  />
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
                    // autoComplete="off"
                    placeholder="user@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-10 w-full rounded-xl bg-zinc-50 pl-12 pr-4 text-sm text-zinc-900 outline-none transition-all placeholder:text-zinc-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 ring-1 ring-black/5"
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
                    autoComplete="new-password"
                    placeholder="hzy123456"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-10 w-full rounded-xl bg-zinc-50 pl-12 pr-12 text-sm text-zinc-900 outline-none transition-all placeholder:text-zinc-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 ring-1 ring-black/5"
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

              {/* 验证码 */}
              <div className="space-y-2">
                <div className="text-sm font-medium text-zinc-700">验证码</div>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      required
                      placeholder="请输入验证码"
                      value={captchaCode}
                      onChange={(e) => setCaptchaCode(e.target.value)}
                      className="h-10 w-full rounded-xl bg-zinc-50 px-4 text-base text-zinc-900 outline-none transition-all placeholder:text-zinc-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 ring-1 ring-black/5"
                    />
                  </div>
                  <div 
                    className="relative h-10 w-32 shrink-0 overflow-hidden rounded-xl bg-indigo-50 ring-1 ring-black/5">
                    {captchaImage ? (
                      <img 
                        src={captchaImage} 
                        alt="验证码" 
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center gap-1 text-xs font-medium text-zinc-900/80 select-none">
                        <span>点击右侧获取</span>
                        <ArrowRight size={20} />
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={fetchCaptcha}
                    disabled={captchaLoading}
                    className="flex h-10 w-12 shrink-0 items-center justify-center rounded-xl bg-zinc-50 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 ring-1 ring-black/5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RefreshCw size={20} className={captchaLoading ? 'animate-spin' : ''} />
                  </button>
                </div>
              </div>

              {/* 提交按钮 */}
              <div className="space-y-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="h-12 w-full rounded-full bg-zinc-900 text-base font-semibold text-white shadow-lg shadow-zinc-900/10 transition-all hover:bg-zinc-800 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70"
                >
                  {loading ? '注册中...' : '立即注册'}
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="h-12 w-full rounded-full border border-transparent bg-zinc-100 text-base font-semibold text-zinc-600 transition-all hover:bg-zinc-200 hover:text-zinc-900"
                >
                  返回
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
