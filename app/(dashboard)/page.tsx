"use client"
// import ChatInterface from "@/features/chats/chat-interface"; // This component is deprecated
import ChatsComponent from "@/features/chats"; // Using the main chats component instead

  
export default function DashboardPage() {
 
  return (
    // <ChatInterface /> // Replaced with ChatsComponent
    <ChatsComponent />
  )
}

