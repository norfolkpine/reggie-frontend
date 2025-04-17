'use client'
import ChatInterface from "@/features/chats/chat-interface"
import ProjectView from "@/features/project/components/project-view"
import { useParams, useSearchParams } from "next/navigation"


export default function ChatPage() {
    const {id} = useParams()
  return <ProjectView projectId={Number(id ?? '0')} />
}