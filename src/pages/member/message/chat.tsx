import { useParams, useSearchParams } from 'react-router-dom'
import ChatWindow from '@/components/common/ChatWindow'

export default function MemberChatPage() {
  const { partnerUserId } = useParams<{ partnerUserId: string }>()
  const [searchParams] = useSearchParams()
  const productId = searchParams.get('product_id')

  if (!partnerUserId) return null

  return <ChatWindow partnerUserId={partnerUserId} productId={productId} role="member" />
}
