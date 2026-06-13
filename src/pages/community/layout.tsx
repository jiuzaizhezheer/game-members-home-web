import { Outlet } from 'react-router-dom'
import Navbar from '../member/Navbar'

export default function CommunityLayout() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <Navbar />
      <div className="pt-4 pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
