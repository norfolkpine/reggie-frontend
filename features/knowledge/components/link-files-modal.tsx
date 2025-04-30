"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { X, Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import type { KnowledgeBase } from "../types"

interface LinkFilesModalProps {
  isOpen: boolean
  onClose: () => void
  fileIds: string[]
  knowledgeBases: KnowledgeBase[]
  onLinkFiles: (fileIds: string[], knowledgeBaseId: string) => void
  existingLinks?: string[] // IDs of knowledge bases already linked
}

export function LinkFilesModal({
  isOpen,
  onClose,
  fileIds,
  knowledgeBases,
  onLinkFiles,
  existingLinks = [],
}: LinkFilesModalProps) {
  const [selectedKbIds, setSelectedKbIds] = useState<string[]>(existingLinks)
  const [isLinking, setIsLinking] = useState(false)
  const { toast } = useToast()

  // Reset selections when modal opens or fileIds change
  useEffect(() => {
    if (isOpen) {
      setSelectedKbIds(existingLinks)
    }
  }, [isOpen, existingLinks])

  const toggleKnowledgeBase = (kbId: string) => {
    setSelectedKbIds((prev) => (prev.includes(kbId) ? prev.filter((id) => id !== kbId) : [...prev, kbId]))
  }

  const handleSubmit = async () => {
    if (fileIds.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select at least one file to link.",
        variant: "destructive",
      })
      return
    }

    if (selectedKbIds.length === 0) {
      toast({
        title: "No knowledge bases selected",
        description: "Please select at least one knowledge base.",
        variant: "destructive",
      })
      return
    }

    setIsLinking(true)

    try {
      // Process all selected knowledge bases
      for (const kbId of selectedKbIds) {
        if (!existingLinks.includes(kbId)) {
          await onLinkFiles(fileIds, kbId)
        }
      }

      // In a real app, you would also handle removing links that were unchecked
      // This would require a separate API call like unlinkFiles

      toast({
        title: "Success",
        description: `Files linked to ${selectedKbIds.length} knowledge base(s)`,
      })
      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to link files to knowledge bases",
        variant: "destructive",
      })
    } finally {
      setIsLinking(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>Link to Knowledge Base</DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="py-4">
          <Command className="rounded-lg border shadow-md">
            <CommandInput placeholder="Search knowledge bases..." />
            <CommandList>
              <CommandEmpty>No knowledge bases found.</CommandEmpty>
              <CommandGroup className="max-h-60 overflow-auto">
                {knowledgeBases.map((kb) => (
                  <CommandItem
                    key={kb.id}
                    onSelect={() => toggleKnowledgeBase(kb.id)}
                    className="flex items-center justify-between px-4 py-2 cursor-pointer"
                  >
                    <div className="flex items-center">
                      <div
                        className={cn(
                          "flex h-4 w-4 items-center justify-center rounded-sm border mr-2",
                          selectedKbIds.includes(kb.id) ? "bg-primary border-primary" : "border-input",
                        )}
                      >
                        {selectedKbIds.includes(kb.id) && <Check className="h-3 w-3 text-primary-foreground" />}
                      </div>
                      <span>{kb.name}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>

          {selectedKbIds.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">Selected ({selectedKbIds.length}):</p>
              <div className="flex flex-wrap gap-2">
                {selectedKbIds.map((id) => {
                  const kb = knowledgeBases.find((kb) => kb.id === id)
                  return kb ? (
                    <Badge key={id} variant="secondary" className="flex items-center gap-1 pl-2">
                      {kb.name}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 ml-1"
                        onClick={() => toggleKnowledgeBase(id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ) : null
                })}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLinking}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLinking || selectedKbIds.length === 0}>
            {isLinking ? "Linking..." : "OK"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
