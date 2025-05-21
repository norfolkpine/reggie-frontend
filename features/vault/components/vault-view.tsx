"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Plus,
  Search,
  MoreHorizontal,
  FolderIcon,
  FileText,
  Settings,
  MessageSquare,
  ArrowLeft,
  Star,
} from "lucide-react"
import { useEffect, useState } from "react"
import { InstructionDialog } from "./instructions-dialog"
import { useRouter } from "next/navigation"
import { Project } from "@/types/api"
import { getProject } from "@/api/projects"
import { handleApiError } from "@/lib/utils/handle-api-error"
import { useToast } from "@/components/ui/use-toast"
import { UploadFileModal } from "./upload-file-modal"
import SearchInput from "@/components/ui/search-input"
import { Badge } from "@/components/ui/badge"

export default function ProjectView({ projectId }: { projectId: number }) {
  const [project, setProject] = useState<Project | null>(null)
  const router = useRouter()
  const [instructionDialogOpen, setInstructionDialogOpen] = useState(false)
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [pickedFiles, setPickedFiles] = useState<File[]>([])
  const [search, setSearch] = useState("")
  const [tab, setTab] = useState("all")
  const { toast } = useToast()

  function onBack() {
    router.back()
  }

  async function fetchProject() {
    try {
      const response = await getProject(projectId)
      setProject(response)
    } catch (error) {
      const { message } = handleApiError(error)
      if (message) {
        toast({
          title: message,
          description: "Failed to fetch project",
          variant: "destructive",
        })
      }
    }
  }

  useEffect(() => {
    fetchProject()
  }, [])

  // Mock chats for demo
  const chats = [
    {
      id: 1,
      title: "DLT Table Manager Fix",
      description: "i want to keep the manager",
      date: "2023-06-15",
      by: "John Doe",
      tags: ["Bugfix", "DLT"],
      starred: true,
    },
    {
      id: 2,
      title: "Sprint Planning",
      description: "Sprint planning for Q2",
      date: "2023-05-20",
      by: "Sarah Brown",
      tags: ["Planning"],
      starred: false,
    },
  ]

  const filteredChats = chats.filter(chat =>
    chat.title.toLowerCase().includes(search.toLowerCase()) ||
    chat.description.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col min-h-screen w-full max-w-4xl mx-auto px-2 sm:px-6 py-6 gap-4">
      {/* Header */}
      <div className="flex items-center gap-4 border-b pb-4">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={onBack}
          title="Back to projects"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center">
          <FolderIcon className="h-6 w-6 text-red-500" />
        </div>
        <h1 className="text-2xl font-semibold truncate flex-1">{project?.name}</h1>
        <Button variant="outline" className="gap-2" onClick={() => setUploadModalOpen(true)}>
          <FileText className="h-5 w-5" /> Upload File
        </Button>
        <Button variant="outline" className="gap-2" onClick={() => setInstructionDialogOpen(true)}>
          <Settings className="h-5 w-5" /> Instructions
        </Button>
      </div>

      {/* Search and Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2">
        <SearchInput
          placeholder="Search chats or files..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="flex gap-2 mt-2 sm:mt-0">
          <Button variant={tab === "all" ? "default" : "outline"} size="sm" onClick={() => setTab("all")}>All</Button>
          <Button variant={tab === "starred" ? "default" : "outline"} size="sm" onClick={() => setTab("starred")}>Starred</Button>
        </div>
      </div>

      {/* Picked Files List */}
      {pickedFiles.length > 0 && (
        <Card className="p-3 mb-2">
          <div className="text-xs font-medium mb-2">Files to upload:</div>
          <ul className="space-y-1">
            {pickedFiles.map((file, idx) => (
              <li key={file.name + idx} className="flex items-center text-xs">
                <FileText className="w-4 h-4 mr-2 text-muted-foreground" />
                <span className="truncate max-w-[180px]" title={file.name}>{file.name}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Chats Section as Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
        {filteredChats.length === 0 ? (
          <Card className="col-span-full flex flex-col items-center justify-center py-12">
            <span className="text-muted-foreground">No chats found.</span>
          </Card>
        ) : (
          filteredChats.map(chat => (
            <Card key={chat.id} className="flex flex-col gap-2 p-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                <span className="font-semibold text-base flex-1 truncate">{chat.title}</span>
                {chat.starred && <Star className="h-4 w-4 text-yellow-400" />}
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-sm text-muted-foreground truncate">{chat.description}</div>
              <div className="flex items-center gap-2 mt-2">
                {chat.tags.map(tag => (
                  <Badge key={tag} variant="outline">{tag}</Badge>
                ))}
                <span className="ml-auto text-xs text-muted-foreground">{chat.date}</span>
                <span className="text-xs text-muted-foreground">{chat.by}</span>
              </div>
              <div className="flex gap-2 mt-2">
                <Button variant="outline" size="sm">View</Button>
                <Button variant="outline" size="sm">Download</Button>
              </div>
            </Card>
          ))
        )}
      </div>

      <InstructionDialog
        open={instructionDialogOpen}
        onOpenChange={setInstructionDialogOpen}
        onSubmit={(data) => {
          setInstructionDialogOpen(false)
        }}
      />
      <UploadFileModal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        onFilesSelected={setPickedFiles}
        supportedTypes={[".pdf", ".png", "image/jpeg"]}
        maxFiles={5}
        title="Upload files"
      />
    </div>
  )
}
