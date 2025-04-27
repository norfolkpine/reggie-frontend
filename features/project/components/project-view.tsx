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
} from "lucide-react"
import { useEffect, useState } from "react"
import { InstructionDialog } from "./instructions-dialog"
import { useRouter } from "next/navigation"
import { Project } from "@/types/api"
import { getProject } from "@/api/projects"
import { handleApiError } from "@/lib/utils/handle-api-error"
import { useToast } from "@/components/ui/use-toast"
import { UploadFileModal } from "./upload-file-modal"

export default function ProjectView({ projectId }: { projectId: number }) {
  const [project, setProject] = useState<Project | null>(null)
  const router = useRouter()
  const [instructionDialogOpen, setInstructionDialogOpen] = useState(false)
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [pickedFiles, setPickedFiles] = useState<File[]>([])
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

  return (
    <>
      <div className="flex flex-col min-h-screen w-full max-w-4xl mx-auto px-2 sm:px-6 py-6 gap-6">
        {/* Header */}
        <div className="flex items-center gap-4">
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
          <h1 className="text-2xl font-semibold truncate">{project?.name}</h1>
        </div>

        {/* New Chat Form */}
        <Card className="p-3 shadow-lg border-gray-200 rounded-2xl">
          <form className="flex items-center gap-2">
            <Button type="button" variant="ghost" size="icon" className="rounded-full">
              <Plus className="h-5 w-5" />
            </Button>
            <Input
              className="flex-1 border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
              placeholder="New chat in this project"
            />
            <div className="flex items-center gap-1">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Button
            variant="outline"
            className="h-auto p-4 justify-start"
            onClick={() => setUploadModalOpen(true)}
          >
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
            onClick={() => setInstructionDialogOpen(true)}
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

        {/* Chats Section */}
        <section className="flex flex-col gap-2 flex-1">
          <h2 className="text-sm font-medium text-muted-foreground mb-1">Chats in this project</h2>
          <ScrollArea className="flex-1 min-h-[200px] max-h-[40vh]">
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
        </section>
      </div>
      <InstructionDialog
        open={instructionDialogOpen}
        onOpenChange={setInstructionDialogOpen}
        onSubmit={(data) => {
          console.log("Instruction created:", data)
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
    </>
  )
}

