import ChatPageClient from './page.client'

// Cloudflare Pages executes this dynamically; leave empty until you pre-render sessions
export const generateStaticParams = async () => {
  // Runtime fetching handles sessions; add IDs here if you adopt static prerendering
  return []
}

export default function ChatPage() {
  return <ChatPageClient />
}
