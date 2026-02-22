import { Outlet, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import Navbar from '../member/Navbar'

export default function CommunityLayout() {
  const {
    state: { isAuthenticated, isInitializing },
  } = useAuth()
  const location = useLocation()

  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
      </div>
    )
  }

  // Allow guest access partially? Or force login?
  // Let's force login for now for simplicity, or allow read-only later
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace state={{ from: location }} />
  }

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
