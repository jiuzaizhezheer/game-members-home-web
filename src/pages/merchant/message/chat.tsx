import { useParams } from 'react-router-dom'
import ChatWindow from '@/components/common/ChatWindow'

export default function MerchantChatPage() {
  const { partnerUserId } = useParams<{ partnerUserId: string }>()

  if (!partnerUserId) return null

  return <ChatWindow partnerUserId={partnerUserId} role="merchant" />
}
