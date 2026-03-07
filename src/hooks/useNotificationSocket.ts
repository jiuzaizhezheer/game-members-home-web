import { useEffect, useRef, useCallback, useState } from 'react'
import { getApiBaseUrl } from '@/shared/config/env'
import type { SystemNotification } from '@/features/notification/types'

interface NotificationPayload {
  type: 'NEW_NOTIFICATION'
  data: SystemNotification
}

export function useNotificationSocket(
  userId: string | undefined,
  onNewNotification: (data: SystemNotification) => void,
) {
  const socketRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<number | null>(null)
  const connectRef = useRef<() => void>(() => {})
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  const connect = useCallback(() => {
    if (!userId) return

    // 获取基础 API 地址并转换为 ws 协议
    const apiBase = getApiBaseUrl()
    let wsBase = ''

    if (apiBase.startsWith('http')) {
      wsBase = apiBase.replace(/^http/, 'ws')
    } else {
      // 处理相对路径的情况
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      wsBase = `${protocol}//${window.location.host}${apiBase}`
    }

    const wsUrl = `${wsBase}/notifications/ws/${userId}`

    const socket = new WebSocket(wsUrl)
    socketRef.current = socket
    setSocket(socket)

    socket.onopen = () => {
      console.log('[WebSocket] Notification connection established')
      setIsConnected(true)
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
        reconnectTimeoutRef.current = null
      }
    }

    socket.onmessage = (event) => {
      try {
        const payload: NotificationPayload = JSON.parse(event.data)
        if (payload.type === 'NEW_NOTIFICATION') {
          onNewNotification(payload.data)
        }
      } catch (err) {
        console.error('[WebSocket] Failed to parse message', err)
      }
    }

    socket.onclose = () => {
      console.log('[WebSocket] Notification connection closed')
      setIsConnected(false)
      // 尝试自动重连 (5秒后)
      reconnectTimeoutRef.current = window.setTimeout(() => {
        connectRef.current()
      }, 5000)
    }

    socket.onerror = (err) => {
      console.error('[WebSocket] Notification error', err)
      setIsConnected(false)
      socket.close()
    }
  }, [userId, onNewNotification])

  useEffect(() => {
    connectRef.current = connect
  }, [connect])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      connect()
    }, 0)

    return () => {
      window.clearTimeout(timeoutId)
      if (socketRef.current) {
        // 关闭连接时避免触发自动重连
        socketRef.current.onclose = null
        socketRef.current.close()
      }
      setIsConnected(false)
      setSocket(null)
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
    }
  }, [connect])

  return {
    socket,
    isConnected,
  }
}
