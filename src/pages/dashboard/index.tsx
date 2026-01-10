import { Link } from 'react-router-dom'

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <p className="mt-3 text-slate-300">项目骨架已就绪。</p>
        <div className="mt-8 flex gap-3">
          <Link
            to="/login"
            className="rounded-md border border-slate-700 px-4 py-2 text-slate-100"
          >
            去登录
          </Link>
          <Link
            to="/register"
            className="rounded-md bg-slate-100 px-4 py-2 text-slate-900"
          >
            去注册
          </Link>
        </div>
      </div>
    </div>
  )
}

