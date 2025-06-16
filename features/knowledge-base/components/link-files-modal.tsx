"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { X, Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { cn } from "@/lib/utils"
import { KnowledgeBase } from "@/types/api"
import { toast } from "sonner"
import { ingestSelectedFiles } from "@/api/files"
import { getKnowledgeBases } from "@/api/knowledge-bases"

interface LinkFilesModalProps {
  isOpen: boolean
  onClose: () => void
  fileId: string | null
  onLinkFiles: (fileId: string, knowledgeBaseId: string) => void
  existingLinks?: string[] // IDs of knowledge bases already linked
}

export function LinkFilesModal({
  isOpen,
  onClose,
  fileId,
  onLinkFiles,
  existingLinks = [],
}: LinkFilesModalProps) {
  const [selectedKbIds, setSelectedKbIds] = useState<string[]>(existingLinks)
  const [isLinking, setIsLinking] = useState(false)
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // Fetch knowledge bases when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchKnowledgeBases()
    }
  }, [isOpen])

  const fetchKnowledgeBases = async () => {
    setIsLoading(true)
    try {
      const response = await getKnowledgeBases(1, fileId ?? undefined)
      setKnowledgeBases(response.results)
      // Set initial selected state based on is_file_linked
      const linkedKbIds = response.results
        .filter(kb => kb.is_file_linked)
        .map(kb => kb.knowledgebase_id.toString())
      setSelectedKbIds(linkedKbIds)
    } catch (error) {
      console.error("Failed to fetch knowledge bases:", error)
      toast.error("Failed to load knowledge bases")
    } finally {
      setIsLoading(false)
    }
  }

  const toggleKnowledgeBase = (kbId: string) => {
    setSelectedKbIds((prev) => (prev.includes(kbId) ? prev.filter((id) => id !== kbId) : [...prev, kbId]))
  }

  const handleSubmit = async () => {
    if (!fileId) {
      toast.error("Please select at least one file to link.")
      return
    }

    if (selectedKbIds.length === 0) {
      toast.error("Please select at least one knowledge base.")
      return
    }

    setIsLinking(true)

    try {
      // Process all selected knowledge bases
      await ingestSelectedFiles({
        file_ids: [fileId],
        knowledgebase_ids: selectedKbIds
      })

      toast.success(`Files linked to ${selectedKbIds.length} knowledge base(s)`)
      onLinkFiles(fileId, selectedKbIds[0]) // Pass the first selected KB ID
      onClose()
    } catch (error) {
      console.error("Failed to link files:", error)
      toast.error("Failed to link files to knowledge bases")
    } finally {
      setIsLinking(false)
    }
  }

  // Filter knowledge bases based on search query
  const filteredKnowledgeBases = knowledgeBases.filter((kb) =>
    kb.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>Link to Knowledge Base</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <Command shouldFilter={false}>
            <CommandInput 
              placeholder="Search knowledge bases..." 
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              <CommandEmpty>No knowledge bases found.</CommandEmpty>
              <CommandGroup>
                {isLoading ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">Loading knowledge bases...</div>
                ) : (
                  filteredKnowledgeBases.map((kb) => (
                    <CommandItem
                      key={kb.id}
                      value={kb.name}
                      onSelect={() => toggleKnowledgeBase(kb.knowledgebase_id.toString())}
                      className={cn(
                        "flex items-center justify-between px-4 py-2 cursor-pointer",
                        "aria-selected:bg-accent aria-selected:text-accent-foreground",
                        "hover:bg-accent hover:text-accent-foreground",
                        "data-[disabled]:opacity-100 data-[disabled]:pointer-events-auto"
                      )}
                    >
                      <div className="flex items-center">
                        <div
                          className={cn(
                            "flex h-4 w-4 items-center justify-center rounded-sm border mr-2",
                            selectedKbIds.includes(kb.knowledgebase_id.toString()) ? "bg-primary border-primary" : "border-input",
                          )}
                        >
                          {selectedKbIds.includes(kb.knowledgebase_id.toString()) && <Check className="h-3 w-3 text-primary-foreground" />}
                        </div>
                        <span>{kb.name}</span>
                      </div>
                    </CommandItem>
                  ))
                )}
              </CommandGroup>
            </CommandList>
          </Command>

          {selectedKbIds.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">Selected ({selectedKbIds.length}):</p>
              <div className="flex flex-wrap gap-2">
                {selectedKbIds.map((id) => {
                  const kb = knowledgeBases.find((kb) => kb.id.toString() === id)
                  return kb ? (
                    <Badge key={id} variant="secondary" className="flex items-center gap-1 pl-2">
                      {kb.name}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 ml-1"
                        onClick={() => toggleKnowledgeBase(kb.knowledgebase_id)}
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
