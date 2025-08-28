"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Trash2, AlertTriangle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { deleteProject } from "@/api/projects"
import { useRouter } from "next/navigation"

interface DeleteProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project: {
    id: string
    name: string
  } | null
  onSuccess?: () => void
}

export function DeleteProjectDialog({ open, onOpenChange, project, onSuccess }: DeleteProjectDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleDelete = async () => {
    if (!project) return

    setIsDeleting(true)
    try {
      await deleteProject(project.id)
      toast({
        title: "Project deleted",
        description: `Project '${project.name}' has been permanently deleted.`,
      })
      onOpenChange(false)
      
      // Call onSuccess callback if provided, otherwise redirect to vault
      if (onSuccess) {
        onSuccess()
      } else {
        // Redirect to vault projects list
        router.push("/vault")
      }
    } catch (error) {
      console.error("Failed to delete project:", error)
      toast({
        title: "Error",
        description: "Failed to delete project. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  if (!project) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-red-100">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <DialogTitle className="text-lg font-semibold">Delete Project</DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground">
            Are you sure you want to delete <span className="font-semibold text-foreground">"{project.name}"</span>? 
            This action cannot be undone and will permanently remove the project and all its associated files.
          </DialogDescription>
        </DialogHeader>
        
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-amber-800">
              <p className="font-medium mb-1">Warning:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>All project files will be permanently deleted</li>
                <li>All project settings and configurations will be lost</li>
                <li>This action cannot be undone</li>
              </ul>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="gap-2"
          >
            {isDeleting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Delete Project
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
