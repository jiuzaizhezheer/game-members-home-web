import { useState } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Store,
  Package,
  FileSearch,
  ShieldCheck,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  MessageCircle,
  FileText,
} from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'

/**
 * 管理后台侧边栏菜单项
 * - 仪表盘（当前可用）
 * - 用户管理（后续扩展）
 * - 商家管理（后续扩展）
 * - 商品管理（后续扩展）
 * - 内容审核
 */
const SIDEBAR_ITEMS = [
  { icon: LayoutDashboard, label: '仪表盘', path: '/admin/dashboard' },
  { icon: Users, label: '用户管理', path: '/admin/users' },
  { icon: Store, label: '商家管理', path: '/admin/merchants' },
  { icon: Package, label: '商品管理', path: '/admin/products' },
  { icon: MessageCircle, label: '社群管理', path: '/admin/community' },
  { icon: FileSearch, label: '内容审核', path: '/admin/content' },
  { icon: FileText, label: '操作日志', path: '/admin/logs' },
]

export default function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const { logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    navigate('/auth/login')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50/50 text-zinc-900">
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

        <div className="border-t border-zinc-100 p-3">
          <button
            onClick={() => setShowLogoutConfirm(true)}
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

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogoutConfirm(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                <LogOut size={24} />
              </div>
              <h3 className="mb-2 text-lg font-bold text-zinc-900">确认退出管理员后台？</h3>
              <p className="mb-6 text-sm text-zinc-500">
                退出后您将需要重新验证身份后才能继续管理操作。
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 rounded-full border border-zinc-200 py-2.5 text-sm font-bold text-zinc-500 hover:bg-zinc-50 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 rounded-full bg-rose-600 py-2.5 text-sm font-bold text-white shadow-lg shadow-rose-200 hover:bg-rose-700 transition-all active:scale-95"
                >
                  确认退出
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto">
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
