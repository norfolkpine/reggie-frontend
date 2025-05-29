'use client'
import ChatInterface from "@/features/chats/chat-interface"
import VaultView from "@/features/vault/components/vault-view"
import { useParams, useSearchParams } from "next/navigation"

export default function VaultPage() {
    const {id} = useParams()
  return <VaultView projectId={Number(id ?? '0')} />
}
