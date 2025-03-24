"use client"
import { useState } from "react"
import ChatInterface from "@/components/chat-interface"
import Sidebar from "@/components/sidebar"
import Library from "@/components/library"
import ExploreAgents from "@/components/explore-agents"
import Projects from "@/components/projects"

export default function Home() {
  const [activeView, setActiveView] = useState("chat")

  const renderView = () => {
    switch (activeView) {
      case "library":
        return <Library />
      case "explore-agents":
        return <ExploreAgents />
      case "projects":
        return <Projects />
      case "chat":
      default:
        return <ChatInterface />
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar onViewChange={setActiveView} activeView={activeView} />
      {renderView()}
    </div>
  )
}

