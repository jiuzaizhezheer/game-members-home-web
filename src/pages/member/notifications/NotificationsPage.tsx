import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, CheckCheck, Package, Flame, Target, Loader2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { notificationApi } from '@/features/notification/api'
import type { SystemNotification } from '@/features/notification/types'

export default function NotificationsPage() {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState<SystemNotification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const fetchNotifications = async (pageNum: number = 1, append: boolean = false) => {
    try {
      setIsLoading(true)
      const res = await notificationApi.getMyNotifications({ page: pageNum, page_size: 20 })
      if (append) {
        setNotifications((prev) => [...prev, ...res.items])
      } else {
        setNotifications(res.items)
      }
      setHasMore(res.items.length === 20)
    } catch (error) {
      console.error('Failed to load notifications', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationApi.markAsRead(id)
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)))
    } catch (error) {
      console.error('Failed to mark as read', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    } catch (error) {
      console.error('Failed to mark all as read', error)
    }
  }

  const handleNotificationClick = (notification: SystemNotification) => {
    if (!notification.is_read) {
      handleMarkAsRead(notification.id)
    }
    if (notification.link) {
      navigate(notification.link)
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <Package className="h-5 w-5 text-indigo-500" />
      case 'social':
        return <Flame className="h-5 w-5 text-rose-500" />
      default:
        return <Bell className="h-5 w-5 text-teal-500" />
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
            <Bell className="h-6 w-6 text-indigo-600" />
            通知中心
          </h1>
          <p className="mt-1 text-sm text-zinc-500">查看您的系统通知、订单状态和社交互动。</p>
        </div>
        {notifications.some((n) => !n.is_read) && (
          <button
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-2 rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-200"
          >
            <CheckCheck className="h-4 w-4" />
            全部已读
          </button>
        )}
      </div>

      {/* Notification List */}
      <div className="space-y-4">
        {notifications.length === 0 && !isLoading ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-200 bg-white py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-50">
              <Target className="h-8 w-8 text-zinc-300" />
            </div>
            <h3 className="mt-4 text-sm font-medium text-zinc-900">暂无通知</h3>
            <p className="mt-1 text-sm text-zinc-500">当有新的动态时，会在这里显示。</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={`group relative flex cursor-pointer gap-4 rounded-2xl border p-4 transition-all hover:border-indigo-200 hover:shadow-md ${
                notification.is_read
                  ? 'border-zinc-200 bg-white opacity-70'
                  : 'border-indigo-100 bg-indigo-50/30'
              }`}
            >
              {/* Unread Indicator */}
              {!notification.is_read && (
                <div className="absolute left-0 top-1/2 h-2/3 w-1 -translate-y-1/2 rounded-r bg-indigo-500" />
              )}

              {/* Icon */}
              <div className="flex shrink-0 h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-zinc-900/5">
                {getIcon(notification.type)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-4">
                  <h4
                    className={`text-sm font-medium ${notification.is_read ? 'text-zinc-700' : 'text-zinc-900'}`}
                  >
                    {notification.title}
                  </h4>
                  <span className="shrink-0 text-xs text-zinc-400">
                    {formatDistanceToNow(new Date(notification.created_at), {
                      addSuffix: true,
                      locale: zhCN,
                    })}
                  </span>
                </div>
                <p className="mt-1 text-sm text-zinc-500 line-clamp-2">{notification.content}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Load More */}
      {hasMore && notifications.length > 0 && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => {
              const nextPage = page + 1
              setPage(nextPage)
              fetchNotifications(nextPage, true)
            }}
            disabled={isLoading}
            className="rounded-full border border-zinc-200 bg-white px-6 py-2 text-sm font-medium text-zinc-600 shadow-sm hover:bg-zinc-50 hover:text-zinc-900 disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isLoading ? '加载中...' : '加载更多'}
          </button>
        </div>
      )}
    </div>
  )
}
