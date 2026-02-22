import { useEffect, useState } from 'react'
import { messageService } from '@/features/message/service'
import type { ConversationItemOut } from '@/features/message/types'
import MessageList from '@/components/common/MessageList'

export default function MerchantMessageList() {
  const [conversations, setConversations] = useState<ConversationItemOut[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await messageService.getConversations()
        setConversations(res.items)
      } catch (error) {
        console.error('Failed to load conversations', error)
      } finally {
        setLoading(false)
      }
    }
    fetchConversations()

    // 简单轮询刷新未读状态
    const timer = setInterval(fetchConversations, 10_000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">消息列表</h1>
        <p className="mt-1 text-sm text-zinc-500">查看并回复买家的咨询消息</p>
      </div>

      <MessageList conversations={conversations} loading={loading} role="merchant" />
    </div>
  )
}
