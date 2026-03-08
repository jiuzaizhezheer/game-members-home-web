import { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import {
  Search,
  ShoppingCart,
  User,
  Gamepad2,
  Menu,
  X,
  MessageSquare,
  Package,
  Heart,
  Ticket,
  Bell,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { cartService } from '@/features/cart/service'
import { messageService } from '@/features/message/service'
import { notificationApi } from '@/features/notification/api'
import { getFileUrl } from '@/shared/utils/file'
import { useConfirm } from '@/components/ui/confirmContext'
import { useMessageSocket } from '@/hooks/useMessageSocket'
import { useNotificationSocket } from '@/hooks/useNotificationSocket'
import { toast } from 'sonner'

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { state, logout } = useAuth()
  const { user, isAuthenticated, isInitializing } = state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const keyword = searchParams.get('keyword') || ''
  const [searchValue, setSearchValue] = useState(keyword)
  const [prevKeyword, setPrevKeyword] = useState(keyword)

  // 同步搜索词与 URL
  if (keyword !== prevKeyword) {
    setPrevKeyword(keyword)
    setSearchValue(keyword)
  }

  const [cartCount, setCartCount] = useState(0)
  const [unreadMessageCount, setUnreadMessageCount] = useState(0)
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0)
  const confirm = useConfirm()

  const requestUnreadCounts = useCallback(async () => {
    if (!isAuthenticated) return null
    const [msgCount, notifCount] = await Promise.all([
      messageService.getUnreadCount(),
      notificationApi.getUnreadCount(),
    ])
    return { msgCount, notifCount }
  }, [isAuthenticated])

  const refreshUnreadMessageCount = useCallback(async () => {
    if (!isAuthenticated) return
    const msgCount = await messageService.getUnreadCount()
    setUnreadMessageCount(msgCount)
  }, [isAuthenticated])

  const refreshUnreadNotificationCount = useCallback(async () => {
    if (!isAuthenticated) return
    const notifCount = await notificationApi.getUnreadCount()
    setUnreadNotificationCount(notifCount.count)
  }, [isAuthenticated])

  useEffect(() => {
    if (isAuthenticated) {
      cartService
        .getMyCart()
        .then((cart) => setCartCount(cart.total_quantity))
        .catch(() => setCartCount(0))

      requestUnreadCounts()
        .then((data) => {
          if (!data) return
          setUnreadMessageCount(data.msgCount)
          setUnreadNotificationCount(data.notifCount.count)
        })
        .catch((e) => {
          console.error('Failed to fetch unread counts', e)
        })
    }
  }, [isAuthenticated, location.pathname, requestUnreadCounts]) // Refresh on path change to keep it somewhat updated

  // WebSocket 实时通知
  const handleNewNotification = useCallback(
    (newNotif: { title: string; content: string; link?: string | null }) => {
      const notificationLink = newNotif.link ?? undefined
      toast.info(`新通知: ${newNotif.title}`, {
        description: newNotif.content,
        action: notificationLink
          ? {
              label: '去查看',
              onClick: () => navigate(notificationLink),
            }
          : undefined,
      })
      void refreshUnreadNotificationCount()
    },
    [navigate, refreshUnreadNotificationCount],
  )

  useNotificationSocket(user?.id, handleNewNotification)

  useMessageSocket(() => {
    void refreshUnreadMessageCount()
  })

  // 未登录时购物车数量始终为 0
  const displayCartCount = isAuthenticated ? cartCount : 0

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchValue.trim()) {
      navigate(`/member/home?keyword=${encodeURIComponent(searchValue.trim())}`)
      setIsMobileMenuOpen(false)
    }
  }

  const NAV_LINKS = [
    { label: '商城', path: '/member/home', icon: Gamepad2 },
    { label: '领券', path: '/member/coupons', icon: Ticket },
    { label: '社区', path: '/community', icon: MessageSquare },
  ]

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Logo */}
            <Link to="/member/home" className="flex items-center gap-2 shrink-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-md shadow-indigo-200">
                <Gamepad2 size={20} />
              </div>
              <span className="font-bold text-zinc-900 hidden sm:block">玩家之家</span>
            </Link>

            {/* Desktop Search */}
            <div className="hidden flex-1 max-w-md md:block">
              <form onSubmit={handleSearch} className="relative group">
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="搜索游戏周边..."
                  className="w-full rounded-full border border-zinc-200 bg-zinc-50 py-2 pl-4 pr-10 text-sm outline-none transition-all placeholder:text-zinc-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-zinc-400 hover:bg-zinc-200/50 hover:text-zinc-600 transition-colors"
                >
                  <Search className="h-4 w-4" />
                </button>
              </form>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                    location.pathname.startsWith(link.path)
                      ? 'text-indigo-600'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  <link.icon size={18} />
                  {link.label}
                </Link>
              ))}

              <div className="h-4 w-px bg-zinc-200" />

              {/* Cart */}
              <Link
                to="/member/cart"
                className="relative rounded-full p-2 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
              >
                <ShoppingCart className="h-5 w-5" />
                {displayCartCount > 0 && (
                  <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white ring-2 ring-white">
                    {displayCartCount > 99 ? '99+' : displayCartCount}
                  </span>
                )}
              </Link>

              {/* User Menu */}
              {isInitializing ? (
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 animate-pulse rounded-full bg-zinc-200" />
                  <div className="h-4 w-16 animate-pulse rounded bg-zinc-200 hidden lg:block" />
                </div>
              ) : isAuthenticated && user ? (
                <div className="flex items-center gap-4">
                  <Link
                    to="/member/orders"
                    className={`text-sm font-medium transition-colors ${location.pathname === '/member/orders' ? 'text-indigo-600' : 'text-zinc-600 hover:text-zinc-900'}`}
                  >
                    我的订单
                  </Link>
                  <Link
                    to="/member/favorites"
                    className={`flex items-center gap-1 text-sm font-medium transition-colors ${location.pathname === '/member/favorites' ? 'text-indigo-600' : 'text-zinc-600 hover:text-zinc-900'}`}
                  >
                    <Heart size={15} />
                    收藏
                  </Link>
                  <Link
                    to="/member/messages"
                    className={`relative flex items-center gap-1 text-sm font-medium transition-colors ${location.pathname.startsWith('/member/messages') ? 'text-indigo-600' : 'text-zinc-600 hover:text-zinc-900'}`}
                  >
                    <MessageSquare size={15} />
                    互动
                    {unreadMessageCount > 0 && (
                      <span className="absolute -right-3 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                        {unreadMessageCount > 99 ? '99+' : unreadMessageCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    to="/member/notifications"
                    className={`relative flex items-center gap-1 text-sm font-medium transition-colors ${location.pathname.startsWith('/member/notifications') ? 'text-indigo-600' : 'text-zinc-600 hover:text-zinc-900'}`}
                  >
                    <Bell size={15} />
                    通知
                    {unreadNotificationCount > 0 && (
                      <span className="absolute -right-3 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                        {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                      </span>
                    )}
                  </Link>
                  <div className="h-4 w-px bg-zinc-200" />
                  <div className="flex items-center gap-3">
                    <Link to="/member/profile" className="flex items-center gap-2 group">
                      <div className="h-8 w-8 overflow-hidden rounded-full bg-indigo-50 ring-2 ring-transparent transition-all group-hover:ring-indigo-100 flex items-center justify-center">
                        {user.avatar_url ? (
                          <img
                            src={getFileUrl(user.avatar_url)}
                            alt={user.username}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-semibold text-indigo-500">
                            {user.username.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-medium text-zinc-700 group-hover:text-indigo-600 transition-colors hidden lg:block">
                        {user.username}
                      </span>
                    </Link>
                    <button
                      onClick={async () => {
                        const confirmed = await confirm({
                          title: '退出登录',
                          description: '确定要退出登录吗？',
                          confirmText: '退出',
                          cancelText: '取消',
                          variant: 'warning',
                        })
                        if (confirmed) {
                          await logout()
                          navigate('/member/home')
                        }
                      }}
                      className="text-sm text-zinc-400 hover:text-rose-500 transition-colors"
                    >
                      退出
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/auth/login"
                    className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
                  >
                    登录
                  </Link>
                  <Link
                    to="/auth/register"
                    className="rounded-full bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white transition-transform hover:bg-indigo-700 hover:scale-105 active:scale-95 shadow-md shadow-indigo-200"
                  >
                    注册
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 md:hidden"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-zinc-100 bg-white px-4 py-4 md:hidden dark:border-zinc-800 dark:bg-zinc-900"
            >
              <form onSubmit={handleSearch} className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder="搜索..."
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-4 text-sm outline-none dark:border-zinc-800 dark:bg-zinc-800/50"
                  />
                </div>
              </form>

              <div className="space-y-2">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${
                      location.pathname.startsWith(link.path)
                        ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400'
                        : 'text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <link.icon size={18} />
                    {link.label}
                  </Link>
                ))}

                <Link
                  to="/member/cart"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800"
                >
                  <div className="flex items-center gap-3">
                    <ShoppingCart size={18} />
                    购物车
                  </div>
                  {displayCartCount > 0 && (
                    <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-600">
                      {displayCartCount}
                    </span>
                  )}
                </Link>

                <div className="my-2 h-px bg-zinc-100 dark:bg-zinc-800" />

                <Link
                  to="/member/orders"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${location.pathname === '/member/orders' ? 'bg-indigo-50 text-indigo-600' : 'text-zinc-600 hover:bg-zinc-50'}`}
                >
                  <Package size={18} />
                  我的订单
                </Link>

                <Link
                  to="/member/favorites"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${location.pathname === '/member/favorites' ? 'bg-indigo-50 text-indigo-600' : 'text-zinc-600 hover:bg-zinc-50'}`}
                >
                  <Heart size={18} />
                  我的收藏
                </Link>

                <div className="my-2 h-px bg-zinc-100 dark:bg-zinc-800" />

                {isInitializing ? (
                  <div className="flex items-center gap-3 rounded-xl px-3 py-2.5">
                    <div className="h-5 w-5 animate-pulse rounded-full bg-zinc-200" />
                    <div className="h-4 w-24 animate-pulse rounded bg-zinc-200" />
                  </div>
                ) : isAuthenticated && user ? (
                  <>
                    <Link
                      to="/member/profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800"
                    >
                      <User size={18} />
                      个人中心 ({user.username})
                    </Link>
                    <button
                      onClick={() => {
                        logout()
                        setIsMobileMenuOpen(false)
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-500 dark:hover:bg-rose-500/10"
                    >
                      <User size={18} className="opacity-0" />
                      退出登录
                    </button>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <Link
                      to="/auth/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-center rounded-xl border border-zinc-200 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    >
                      登录
                    </Link>
                    <Link
                      to="/auth/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-center rounded-xl bg-zinc-900 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
                    >
                      注册
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
      {/* Spacer for fixed navbar */}
      <div className="h-16" />
    </>
  )
}
