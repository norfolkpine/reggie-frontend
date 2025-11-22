
// import ChatInterface from "@/features/chats/chat-interface"

// export default function ChatDetailPage() {
//   return <ChatInterface />
// }

import ChatNoDock from "@/features/chats/chat-no-dock"

// Required for static export - generate static params for dynamic routes
export async function generateStaticParams() {
  // Return empty array for now - this route will be handled client-side
  // In a real app, you might want to pre-generate common session IDs
  return []
}

export default function ChatPage() {
  return <ChatNoDock />
}