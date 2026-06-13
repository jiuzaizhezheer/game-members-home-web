import { useNavigate } from 'react-router-dom'
import { MessageSquare, Loader2, User, ChevronRight } from 'lucide-react'
import type { ConversationItemOut } from '@/features/message/types'
import { getFileUrl } from '@/shared/utils/file'

interface MessageListProps {
  conversations: ConversationItemOut[]
  loading: boolean
  role: 'member' | 'merchant'
  emptyText?: string
}

export default function MessageList({
  conversations,
  loading,
  role,
  emptyText = '暂无消息记录',
}: MessageListProps) {
  const navigate = useNavigate()

  const getPartnerName = (conv: ConversationItemOut) => {
    if (conv.partner_name) return conv.partner_name
    return role === 'member' ? '商家' : '买家'
  }

  const handleNavigate = (conv: ConversationItemOut) => {
    const prefix = role === 'member' ? '/member/messages' : '/merchant/messages'
    const productQuery = conv.product_id ? `?product_id=${conv.product_id}` : ''
    navigate(`${prefix}/${conv.partner_user_id}${productQuery}`)
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
      {conversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-zinc-400">
          <MessageSquare size={48} className="mb-4 opacity-50" />
          <p>{emptyText}</p>
        </div>
      ) : (
        <div className="divide-y divide-zinc-100">
          {conversations.map((conv) => (
            <div
              key={`${conv.partner_user_id}-${conv.product_id || 'general'}`}
              onClick={() => handleNavigate(conv)}
              className="group flex cursor-pointer items-center gap-4 p-4 transition-colors hover:bg-zinc-50"
            >
              {/* Avatar */}
              <div className="relative h-12 w-12 shrink-0">
                {conv.avatar_url ? (
                  <img
                    src={getFileUrl(conv.avatar_url)}
                    alt={conv.partner_name}
                    className="h-full w-full rounded-full object-cover shadow-sm border border-zinc-100"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-zinc-100 text-zinc-700 font-bold text-sm">
                    {/* Display First Char or Default Icon */}
                    {conv.partner_name ? (
                      conv.partner_name.charAt(0).toUpperCase()
                    ) : (
                      <User size={24} />
                    )}
                  </div>
                )}
                {conv.unread_count > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                    {conv.unread_count > 99 ? '99+' : conv.unread_count}
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold text-zinc-900">
                      {getPartnerName(conv)}
                    </h3>
                    {conv.product_name && (
                      <p className="mt-0.5 truncate text-[11px] text-zinc-400">
                        商品：{conv.product_name}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-zinc-400">
                    {new Date(conv.last_message_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between gap-4">
                  <p className="truncate text-xs text-zinc-500 max-w-[80%]">
                    {/* Preview Format */}
                    {(() => {
                      if (conv.last_message_type === 'image') return '[图片]'

                      const tryParse = (str: string) => {
                        try {
                          const p = JSON.parse(str)
                          if (p.name && (p.price || p.id)) return `[商品] ${p.name}`
                        } catch {
                          return null
                        }
                        return null
                      }

                      if (
                        conv.last_message_type === 'product_card' ||
                        conv.last_message_type === 'product'
                      ) {
                        const parsed = tryParse(conv.last_message)
                        return parsed || '[商品]'
                      }

                      if (conv.last_message_type === 'order') return '[订单]'

                      // Fallback check
                      const fallback = tryParse(conv.last_message)
                      if (fallback) return fallback

                      return conv.last_message
                    })()}
                  </p>
                  <ChevronRight
                    size={16}
                    className="text-zinc-300 opacity-0 transition-opacity group-hover:opacity-100"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
