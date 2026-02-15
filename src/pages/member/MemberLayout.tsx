import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'

export default function MemberLayout() {
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
