import { useEffect, useState, useRef, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Send, Loader2, Image as LucideImage, X } from 'lucide-react'
import { messageService } from '@/features/message/service'
import type { MessageItemOut } from '@/features/message/types'
import { useMessageSocket } from '@/hooks/useMessageSocket'
import { getFileUrl } from '@/shared/utils/file'

interface ChatWindowProps {
  partnerUserId: string
  productId?: string | null
  role: 'member' | 'merchant'
  title?: string
}

export default function ChatWindow({ partnerUserId, productId, role, title }: ChatWindowProps) {
  const navigate = useNavigate()

  const [messages, setMessages] = useState<MessageItemOut[]>([])
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  const HEADER_TITLE = title || (role === 'member' ? '与商家对话' : '与买家对话')
  const BACK_PATH = role === 'member' ? '/member/messages' : '/merchant/messages'

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const upsertMessages = useCallback((next: MessageItemOut[]) => {
    setMessages((prev) => {
      const byId = new Map<string, MessageItemOut>()
      prev.forEach((m) => byId.set(m.id, m))
      next.forEach((m) => byId.set(m.id, m))
      return Array.from(byId.values()).sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      )
    })
  }, [])

  const fetchMessages = useCallback(
    async (scroll = true) => {
      if (!partnerUserId) return
      try {
        const res = await messageService.getMessages(partnerUserId, undefined, undefined, productId)
        upsertMessages(res.items)
        setHasMore(res.has_more)
        if (scroll) {
          setTimeout(scrollToBottom, 100)
        }
      } catch {
        console.error('Failed to load messages')
      } finally {
        setLoading(false)
      }
    },
    [partnerUserId, productId, scrollToBottom, upsertMessages],
  )

  useMessageSocket((data) => {
    if (data.sender_id !== partnerUserId) return
    if ((data.product_id || null) !== (productId || null)) return

    const nextItem: MessageItemOut = {
      id: data.id,
      sender_id: data.sender_id,
      content: data.content,
      content_type: data.content_type,
      product_id: data.product_id || null,
      is_mine: false,
      created_at: data.created_at,
    }
    upsertMessages([nextItem])
    setTimeout(scrollToBottom, 50)
    messageService.markAsRead(partnerUserId, productId).catch(() => {})
  })

  useEffect(() => {
    fetchMessages()
    if (partnerUserId) {
      messageService.markAsRead(partnerUserId, productId).catch(() => {})
    }
  }, [fetchMessages, partnerUserId, productId])

  const handleSend = async () => {
    const content = inputValue.trim()
    if (!content || !partnerUserId) return

    setSending(true)
    try {
      await messageService.sendMessage({
        receiver_user_id: partnerUserId,
        product_id: productId || undefined,
        content,
      })
      upsertMessages([
        {
          id: `local-${Date.now()}`,
          sender_id: 'me',
          content,
          content_type: 'text',
          product_id: productId || null,
          is_mine: true,
          created_at: new Date().toISOString(),
        },
      ])
      setInputValue('')
      setTimeout(scrollToBottom, 50)
    } catch (error) {
      console.error(error)
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleProductClick = (productId: string) => {
    if (role === 'member') {
      navigate(`/member/product/${productId}`)
    } else {
      navigate(`/merchant/product/edit/${productId}`)
    }
  }

  // Ref Product Handling
  const location = useLocation()
  const [refProduct, setRefProduct] = useState<{
    id: string
    name: string
    price: number
    image?: string
  } | null>(null)

  useEffect(() => {
    const state = location.state as {
      refProduct?: { id: string; name: string; price: number; image?: string }
    }
    if (state?.refProduct) {
      setRefProduct(state.refProduct)
      // Clear state to prevent re-appearance on refresh? Actually better to keep until sent
      // But user requirement: "send after, no longer show"
    }
  }, [location.state])

  const handleSendProduct = async () => {
    if (!refProduct || !partnerUserId) return
    try {
      await messageService.sendMessage({
        receiver_user_id: partnerUserId,
        product_id: productId || refProduct.id,
        content: JSON.stringify(refProduct),
        content_type: 'product_card',
      })
      upsertMessages([
        {
          id: `local-${Date.now()}`,
          sender_id: 'me',
          content: JSON.stringify(refProduct),
          content_type: 'product_card',
          product_id: productId || refProduct.id,
          is_mine: true,
          created_at: new Date().toISOString(),
        },
      ])
      setRefProduct(null) // Hide card after sending
      // Clear location state to prevent reappearance on refresh
      navigate('.', { replace: true, state: {} })
      setTimeout(scrollToBottom, 50)
    } catch (error) {
      console.error(error)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    )
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-120px)] max-w-3xl flex-col bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-200 bg-zinc-50/50">
        <button
          onClick={() => navigate(BACK_PATH)}
          className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-zinc-200/50 text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-sm font-semibold text-zinc-900">{HEADER_TITLE}</h1>
          <p className="text-[10px] text-zinc-400">ID: {partnerUserId?.slice(0, 8)}...</p>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-white scrollbar-thin"
      >
        {hasMore && (
          <div className="text-center">
            <button className="text-xs text-indigo-500 hover:underline">加载更多...</button>
          </div>
        )}

        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-zinc-400">
            <p className="text-sm">暂无消息</p>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.is_mine ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm bg-zinc-100 text-zinc-900 ${
                msg.is_mine ? 'rounded-br-none' : 'rounded-bl-none border border-zinc-200'
              }`}
            >
              {/* Content Render Logic */}
              {(() => {
                // Product Card
                if (msg.content_type === 'product_card' || msg.content_type === 'product') {
                  try {
                    const product = JSON.parse(msg.content)
                    return (
                      <div
                        onClick={() => handleProductClick(product.id)}
                        className="flex cursor-pointer items-start gap-3 rounded-lg p-2 transition-colors bg-white hover:bg-zinc-50 border border-zinc-100"
                      >
                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded bg-zinc-200">
                          {product.image ? (
                            <img
                              src={getFileUrl(product.image)}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-zinc-400">
                              <LucideImage size={16} />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-1 text-xs font-medium text-zinc-900">
                            {product.name}
                          </p>
                          <p className="mt-0.5 text-xs font-bold text-zinc-900">
                            ¥{Number(product.price).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    )
                  } catch {
                    return null
                  }
                }

                // Text fallback for product-like content
                const tryParse = (str: string) => {
                  try {
                    const p = JSON.parse(str)
                    if (p.name && (p.price || p.id)) return p
                  } catch {
                    return null
                  }
                  return null
                }
                const fallbackProduct = tryParse(msg.content)
                if (fallbackProduct) {
                  return (
                    <div
                      onClick={() => handleProductClick(fallbackProduct.id)}
                      className="flex cursor-pointer items-start gap-3 rounded-lg p-2 transition-colors bg-white hover:bg-zinc-50 border border-zinc-100"
                    >
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded bg-zinc-200">
                        {fallbackProduct.image ? (
                          <img
                            src={getFileUrl(fallbackProduct.image)}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-zinc-400">
                            <LucideImage size={16} />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 text-xs font-medium text-zinc-900">
                          {fallbackProduct.name}
                        </p>
                        <p className="mt-0.5 text-xs font-bold text-zinc-900">
                          ¥{Number(fallbackProduct.price).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  )
                }

                // Default Text
                return (
                  <p className="whitespace-pre-wrap break-words text-zinc-700">{msg.content}</p>
                )
              })()}

              <p className="mt-1 text-[10px] text-zinc-400 text-right">
                {new Date(msg.created_at).toLocaleTimeString('zh-CN', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Product Card Preview (if active) */}
      {refProduct && (
        <div className="border-t border-zinc-100 bg-zinc-50/80 px-4 py-3 backdrop-blur-sm">
          <div className="relative flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-3 shadow-sm">
            <button
              onClick={() => {
                setRefProduct(null)
                navigate('.', { replace: true, state: {} })
              }}
              className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-zinc-200 text-zinc-500 hover:bg-zinc-300"
            >
              <X size={14} />
            </button>
            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-zinc-100 border border-zinc-100">
              {refProduct.image ? (
                <img
                  src={getFileUrl(refProduct.image)}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-zinc-300">
                  <LucideImage size={20} />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-zinc-900">
                发送商品链接: {refProduct.name}
              </p>
              <p className="text-xs font-bold text-zinc-900">
                ¥{Number(refProduct.price).toFixed(2)}
              </p>
            </div>
            <button
              onClick={handleSendProduct}
              className="shrink-0 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-800"
            >
              发送链接
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-zinc-200 bg-zinc-50 px-4 py-3">
        <div className="flex items-end gap-3 rounded-xl bg-white p-2 shadow-sm ring-1 ring-zinc-200">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入回复内容..."
            rows={1}
            className="flex-1 resize-none border-none bg-transparent px-2 py-1.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:ring-0"
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || sending}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-900 text-white transition-all hover:bg-zinc-800 disabled:opacity-50"
          >
            {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
      </div>
    </div>
  )
}
