import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { getAccessToken } from '@/shared/auth/token'
import { getApiBaseUrl } from '@/shared/config/env'

export interface MessagePushData {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  content_type: string
  product_id?: string | null
  created_at: string
}

interface MessagePayload {
  type: 'NEW_MESSAGE'
  data: MessagePushData
}

export function useMessageSocket(onNewMessage: (data: MessagePushData) => void) {
  const socketRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<number | null>(null)
  const connectRef = useRef<() => void>(() => {})
  const reconnectAttemptsRef = useRef(0)
  const suppressReconnectRef = useRef(false)
  const onNewMessageRef = useRef(onNewMessage)
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')

  useEffect(() => {
    onNewMessageRef.current = onNewMessage
  }, [onNewMessage])

  const connect = useCallback(() => {
    if (isAdminRoute) return
    const token = getAccessToken()
    if (!token) return

    if (
      socketRef.current &&
      (socketRef.current.readyState === WebSocket.OPEN ||
        socketRef.current.readyState === WebSocket.CONNECTING)
    ) {
      return
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    const apiBase = getApiBaseUrl()
    let wsBase = ''

    if (apiBase.startsWith('http')) {
      wsBase = apiBase.replace(/^http/, 'ws')
    } else {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      wsBase = `${protocol}//${window.location.host}${apiBase}`
    }

    let normalizedWsBase = wsBase.replace(/\/+$/, '')
    if (!normalizedWsBase.endsWith('/api')) {
      normalizedWsBase = `${normalizedWsBase}/api`
    }

    const wsUrl = `${normalizedWsBase}/messages/ws?token=${encodeURIComponent(token)}`

    const nextSocket = new WebSocket(wsUrl)
    socketRef.current = nextSocket
    setSocket(nextSocket)

    nextSocket.onopen = () => {
      setIsConnected(true)
      reconnectAttemptsRef.current = 0
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
        reconnectTimeoutRef.current = null
      }
    }

    nextSocket.onmessage = (event) => {
      try {
        const payload: MessagePayload = JSON.parse(event.data)
        if (payload.type === 'NEW_MESSAGE') {
          onNewMessageRef.current(payload.data)
        }
      } catch {
        return
      }
    }

    nextSocket.onclose = () => {
      setIsConnected(false)
      setSocket(null)
      if (suppressReconnectRef.current) {
        suppressReconnectRef.current = false
        return
      }
      reconnectAttemptsRef.current += 1
      const delay = Math.min(30_000, 1_000 * 2 ** (reconnectAttemptsRef.current - 1))
      reconnectTimeoutRef.current = window.setTimeout(() => {
        connectRef.current()
      }, delay)
    }

    nextSocket.onerror = () => {
      setIsConnected(false)
    }
  }, [isAdminRoute])

  useEffect(() => {
    connectRef.current = connect
  }, [connect])

  useEffect(() => {
    if (isAdminRoute) {
      suppressReconnectRef.current = true
      if (socketRef.current) {
        socketRef.current.close()
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      reconnectAttemptsRef.current = 0
      return
    }
    const timeoutId = window.setTimeout(() => {
      connect()
    }, 0)

    const tokenRetryId = window.setInterval(() => {
      if (!socketRef.current || socketRef.current.readyState === WebSocket.CLOSED) {
        connectRef.current()
      }
    }, 1_000)

    return () => {
      window.clearTimeout(timeoutId)
      window.clearInterval(tokenRetryId)
      if (socketRef.current) {
        socketRef.current.onclose = null
        socketRef.current.close()
      }
      setIsConnected(false)
      setSocket(null)
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      reconnectAttemptsRef.current = 0
    }
  }, [connect, isAdminRoute])

  return {
    socket,
    isConnected,
  }
}
