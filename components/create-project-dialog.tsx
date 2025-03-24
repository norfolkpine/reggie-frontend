"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { HelpCircle } from "lucide-react"

interface CreateProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateProject: (name: string) => void
}

export function CreateProjectDialog({ open, onOpenChange, onCreateProject }: CreateProjectDialogProps) {
  const [projectName, setProjectName] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (projectName.trim()) {
      onCreateProject(projectName)
      setProjectName("")
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Project name</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <Input
              placeholder="E.g. Birthday Party Planning"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              autoFocus
            />
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <HelpCircle className="h-5 w-5 shrink-0" />
              <div>
                <div className="font-medium text-foreground">What&apos;s a project?</div>
                <div>
                  Projects keep chats, files, and custom instructions in one place. Use them for ongoing work, or just
                  to keep things tidy.
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!projectName.trim()}>
              Create project
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

