import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import Navbar from './Navbar'

export default function MemberLayout() {
  const { state } = useAuth()

  // 1. 如果正在初始化，渲染空
  if (state.isInitializing) return null

  // 2. 如果已登录但角色不是 member，重定向到其对应角色的首页
  // 注意：member 页面通常也允许未登录访问部分内容，但作为 Layout，
  // 我们这里主要防止已登录的其他角色（如商家）意外进入买家区域的受限部分。
  if (state.isAuthenticated && state.user && state.user.role !== 'member') {
    return <Navigate to={`/${state.user.role}`} replace />
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50/50 text-zinc-900 font-sans selection:bg-indigo-500/30">
      <Navbar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>

      {/* Simple Footer */}
      <footer className="border-t border-zinc-200 bg-white py-5 shrink-0">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            &copy; {new Date().getFullYear()} 玩家之家 (Game Members Home). All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
