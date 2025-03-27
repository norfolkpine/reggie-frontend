"use client"
import ChatInterface from "@/features/chats/chat-interface"
import { Header } from "@/components/layout/header"
import { Main } from "@/components/layout/main"
import { ProfileDropdown } from "@/components/profile-dropdown"
import { Search } from "@/components/search"
import Sidebar from "@/components/sidebar"
import { TopNav } from "@/components/top-nav"
import ExploreAgents from "@/features/explore"
import Library from "@/features/library"
import Projects from "@/features/project"
import { useState } from "react"

const topNav = [
    {
      title: 'Overview',
      href: 'dashboard/overview',
      isActive: true,
      disabled: false,
    },
    {
      title: 'Customers',
      href: 'dashboard/customers',
      isActive: false,
      disabled: true,
    },
    {
      title: 'Products',
      href: 'dashboard/products',
      isActive: false,
      disabled: true,
    },
    {
      title: 'Settings',
      href: 'dashboard/settings',
      isActive: false,
      disabled: true,
    },
  ]
  
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [activeView, setActiveView] = useState("chat")

  const handleViewChange = (view: string) => {
    setActiveView(view)
  }

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
      <Sidebar onViewChange={handleViewChange} activeView={activeView} />
      <div className="flex flex-col flex-1">
      <Header>
        <div className='ml-auto flex items-center space-x-4'>
          <Search />
          <ProfileDropdown />
        </div>
      </Header>
      <Main className="flex-1 overflow-y-auto">
        {renderView()}
      </Main>
      </div>
    </div>
  )
}

