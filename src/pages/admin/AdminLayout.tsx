import { useState } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Store,
  Package,
  ShoppingCart,
  FileSearch,
  ShieldCheck,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
} from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { clearAccessToken } from '@/shared/auth/token'

/**
 * 管理后台侧边栏菜单项
 * - 仪表盘（当前可用）
 * - 用户管理（后续扩展）
 * - 商家管理（后续扩展）
 * - 商品管理（后续扩展）
 * - 订单管理（后续扩展）
 * - 内容审核（后续扩展）
 */
const SIDEBAR_ITEMS = [
  { icon: LayoutDashboard, label: '仪表盘', path: '/admin/dashboard' },
  { icon: Users, label: '用户管理', path: '/admin/users', disabled: true },
  { icon: Store, label: '商家管理', path: '/admin/merchants', disabled: true },
  { icon: Package, label: '商品管理', path: '/admin/products', disabled: true },
  { icon: ShoppingCart, label: '订单管理', path: '/admin/orders', disabled: true },
  { icon: FileSearch, label: '内容审核', path: '/admin/audit', disabled: true },
]

export default function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    clearAccessToken()
    navigate('/auth/login')
  }

  return (
    <div className="flex min-h-screen bg-gray-50/50 text-zinc-900">
      {/* Mobile Menu Backdrop */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-zinc-200 bg-white shadow-sm transition-all duration-300 lg:relative ${
          isCollapsed ? 'w-16' : 'w-64'
        } ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Logo Area */}
        <div className="flex h-16 items-center justify-between px-4">
          <div
            className={`flex items-center gap-3 overflow-hidden ${isCollapsed ? 'justify-center w-full' : ''}`}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-600 text-white shadow-md shadow-rose-200">
              <ShieldCheck size={20} />
            </div>
            {!isCollapsed && <span className="truncate font-semibold text-zinc-900">管理后台</span>}
          </div>
          {/* Collapse Button (Desktop) */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden rounded-full p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 lg:block"
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {SIDEBAR_ITEMS.map((item) => {
            const isActive = location.pathname.startsWith(item.path)
            const isDisabled = item.disabled

            if (isDisabled) {
              return (
                <div
                  key={item.path}
                  className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-zinc-300 cursor-not-allowed ${
                    isCollapsed ? 'justify-center' : ''
                  }`}
                  title="即将上线"
                >
                  <item.icon size={20} className="shrink-0 text-zinc-300" />
                  {!isCollapsed && (
                    <span className="font-medium flex items-center gap-2">
                      {item.label}
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-100 text-zinc-400">
                        即将上线
                      </span>
                    </span>
                  )}
                </div>
              )
            }

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200 ${
                  isActive
                    ? 'bg-rose-50 text-rose-600 shadow-sm ring-1 ring-rose-100'
                    : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
                } ${isCollapsed ? 'justify-center' : ''}`}
              >
                <item.icon
                  size={20}
                  className={`shrink-0 transition-colors ${
                    isActive ? 'text-rose-600' : 'text-zinc-400 group-hover:text-zinc-600'
                  }`}
                />
                {!isCollapsed && <span className="font-medium">{item.label}</span>}
              </NavLink>
            )
          })}
        </nav>

        {/* User Profile & Logout */}
        <div className="border-t border-zinc-100 p-3">
          <button
            onClick={handleLogout}
            className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-zinc-500 hover:bg-rose-50 hover:text-rose-600 transition-all duration-200 ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <LogOut
              size={20}
              className="shrink-0 text-zinc-400 transition-colors group-hover:text-rose-500"
            />
            {!isCollapsed && <span className="font-medium">退出登录</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden">
        {/* Mobile Header */}
        <div className="flex h-16 items-center border-b border-zinc-200 bg-white px-4 shadow-sm lg:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="-ml-2 rounded-lg p-2 text-zinc-500 hover:bg-zinc-100"
          >
            <Menu size={20} />
          </button>
          <span className="ml-3 font-semibold text-zinc-900">管理后台</span>
        </div>

        {/* Page Content */}
        <div className="p-4 md:p-8 lg:p-10">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  )
}
