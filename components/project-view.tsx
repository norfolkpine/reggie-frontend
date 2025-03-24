"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Plus,
  Search,
  MoreHorizontal,
  ArrowUp,
  FolderIcon,
  FileText,
  Settings,
  MessageSquare,
  ArrowLeft,
} from "lucide-react"

interface ProjectViewProps {
  projectName: string
  onBack: () => void
}

export default function ProjectView({ projectName, onBack }: ProjectViewProps) {
  return (
    <div className="flex-1 flex flex-col h-full max-w-6xl mx-auto w-full px-4">
      {/* Project Header - Add back button */}
      <div className="py-6 flex items-center gap-4">
        <Button variant="ghost" size="icon" className="rounded-full mr-1" onClick={onBack} title="Back to projects">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center">
          <FolderIcon className="h-6 w-6 text-red-500" />
        </div>
        <h1 className="text-2xl font-semibold">{projectName}</h1>
      </div>

      {/* New Chat Input */}
      <Card className="p-2 shadow-lg border-gray-200 rounded-2xl mb-6">
        <form className="flex items-center">
          <Button type="button" variant="ghost" size="icon" className="rounded-full">
            <Plus className="h-5 w-5" />
          </Button>

          <Input
            className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
            placeholder="New chat in this project"
          />

          <div className="flex items-center gap-2 px-2">
            <Button type="button" variant="ghost" size="icon" className="rounded-full">
              <Search className="h-5 w-5" />
            </Button>
            <Button type="button" variant="ghost" size="icon" className="rounded-full">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </div>
        </form>
      </Card>

      {/* Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <Button variant="outline" className="h-auto p-4 justify-start" onClick={() => console.log("Add files clicked")}>
          <div className="flex items-start gap-4">
            <FileText className="h-5 w-5 mt-0.5" />
            <div className="text-left">
              <div className="font-medium mb-1">Add files</div>
              <div className="text-sm text-muted-foreground">Chats in this project can access file content</div>
            </div>
          </div>
        </Button>

        <Button
          variant="outline"
          className="h-auto p-4 justify-start"
          onClick={() => console.log("Add instructions clicked")}
        >
          <div className="flex items-start gap-4">
            <Settings className="h-5 w-5 mt-0.5" />
            <div className="text-left">
              <div className="font-medium mb-1">Add instructions</div>
              <div className="text-sm text-muted-foreground">Tailor the way ChatGPT responds in this project</div>
            </div>
          </div>
        </Button>
      </div>

      {/* Chats Section */}
      <div>
        <h2 className="text-sm font-medium text-muted-foreground mb-3">Chats in this project</h2>
        <ScrollArea className="h-[calc(100vh-320px)]">
          <div className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start px-4 py-6 h-auto"
              onClick={() => console.log("Chat clicked")}
            >
              <div className="flex items-start gap-4">
                <MessageSquare className="h-5 w-5 mt-0.5" />
                <div className="text-left">
                  <div className="font-medium mb-1">DLT Table Manager Fix</div>
                  <div className="text-sm text-muted-foreground">i want to keep the manager</div>
                </div>
              </div>
            </Button>
          </div>
        </ScrollArea>
      </div>

      {/* Scroll to top button */}
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-6 right-6 rounded-full h-10 w-10 bg-background shadow-lg"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        <ArrowUp className="h-5 w-5" />
      </Button>
    </div>
  )
}

