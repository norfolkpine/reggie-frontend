"use client"

import { useState, useEffect } from "react"
import { Database, Plus, Search, MoreHorizontal, FileText, Calendar, Info, Trash2, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { KnowledgeBaseDetail } from "./knowledge-base-detail"
import { KnowledgeBaseForm } from "./knowledge-base-form"
import type { KnowledgeBase } from "../types"

export function KnowledgeBaseManager() {
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedKnowledgeBaseId, setSelectedKnowledgeBaseId] = useState<string | null>(null)
  const [knowledgeBaseToEdit, setKnowledgeBaseToEdit] = useState<KnowledgeBase | null>(null)

  useEffect(() => {
    fetchKnowledgeBases()
  }, [])

  const fetchKnowledgeBases = async () => {
    setIsLoading(true)
    try {
      // In a real implementation, this would be an actual API call
      // const fetchedKbs = await knowledgeBaseService.getKnowledgeBases()

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const fetchedKbs: KnowledgeBase[] = [
        {
          id: "kb-1",
          name: "Product Documentation",
          description: "All product documentation including user guides and technical specifications",
          documentCount: 24,
          createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
          embeddingModel: "openai-ada-002",
          chunkMethod: "fixed-size",
          chunkSize: 1000,
          chunkOverlap: 200,
          permissions: [
            {
              id: "perm-1",
              userId: "current-user",
              role: "owner",
            },
            {
              id: "perm-2",
              userId: "user-2",
              role: "editor",
            },
          ],
        },
        {
          id: "kb-2",
          name: "Customer Support",
          description: "Knowledge base for customer support agents with FAQs and troubleshooting guides",
          documentCount: 42,
          createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
          embeddingModel: "openai-3-small",
          chunkMethod: "paragraph",
          permissions: [
            {
              id: "perm-3",
              userId: "current-user",
              role: "owner",
            },
          ],
        },
        {
          id: "kb-3",
          name: "Research Papers",
          description: "Collection of research papers and academic articles",
          documentCount: 18,
          createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 15 * 86400000).toISOString(),
          embeddingModel: "cohere-embed-english",
          chunkMethod: "semantic",
          chunkSize: 800,
          chunkOverlap: 100,
          permissions: [
            {
              id: "perm-4",
              userId: "user-3",
              role: "owner",
            },
            {
              id: "perm-5",
              userId: "current-user",
              role: "editor",
            },
          ],
        },
      ]

      setKnowledgeBases(fetchedKbs)
    } catch (error) {
      console.error("Failed to fetch knowledge bases:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateKnowledgeBase = async (data: Partial<KnowledgeBase>) => {
    setIsSubmitting(true)
    try {
      // In a real implementation, this would be an actual API call
      // const newKb = await knowledgeBaseService.createKnowledgeBase(data)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const newKb: KnowledgeBase = {
        id: `kb-${Date.now()}`,
        name: data.name || "Untitled Knowledge Base",
        description: data.description || "",
        documentCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        embeddingModel: data.embeddingModel || "openai-ada-002",
        chunkMethod: data.chunkMethod || "fixed-size",
        chunkSize: data.chunkSize,
        chunkOverlap: data.chunkOverlap,
        permissions: data.permissions || [],
      }

      setKnowledgeBases((prevKbs) => [...prevKbs, newKb])
      setIsCreateDialogOpen(false)
    } catch (error) {
      console.error("Failed to create knowledge base:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditKnowledgeBase = async (data: Partial<KnowledgeBase>) => {
    if (!knowledgeBaseToEdit) return

    setIsSubmitting(true)
    try {
      // In a real implementation, this would be an actual API call
      // const updatedKb = await knowledgeBaseService.updateKnowledgeBase(knowledgeBaseToEdit.id, data)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setKnowledgeBases((prevKbs) =>
        prevKbs.map((kb) =>
          kb.id === knowledgeBaseToEdit.id
            ? {
                ...kb,
                ...data,
                updatedAt: new Date().toISOString(),
              }
            : kb,
        ),
      )

      setIsEditDialogOpen(false)
      setKnowledgeBaseToEdit(null)
    } catch (error) {
      console.error("Failed to update knowledge base:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteKnowledgeBase = async (kbId: string) => {
    try {
      // In a real implementation, this would be an actual API call
      // await knowledgeBaseService.deleteKnowledgeBase(kbId)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      setKnowledgeBases((prevKbs) => prevKbs.filter((kb) => kb.id !== kbId))

      // If the deleted KB was selected, clear the selection
      if (selectedKnowledgeBaseId === kbId) {
        setSelectedKnowledgeBaseId(null)
      }
    } catch (error) {
      console.error("Failed to delete knowledge base:", error)
    }
  }

  const openEditDialog = (kb: KnowledgeBase) => {
    setKnowledgeBaseToEdit(kb)
    setIsEditDialogOpen(true)
  }

  const filteredKnowledgeBases = knowledgeBases.filter(
    (kb) =>
      kb.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      kb.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // If a knowledge base is selected, show its detail view
  if (selectedKnowledgeBaseId) {
    const selectedKb = knowledgeBases.find((kb) => kb.id === selectedKnowledgeBaseId) || null

    return (
      <KnowledgeBaseDetail
        knowledgeBaseId={selectedKnowledgeBaseId}
        knowledgeBase={selectedKb}
        onBack={() => setSelectedKnowledgeBaseId(null)}
        onEdit={() => {
          if (selectedKb) {
            openEditDialog(selectedKb)
          }
        }}
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Knowledge Bases</h2>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Knowledge Base
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search knowledge bases..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-5 bg-muted rounded w-1/2"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-muted rounded w-full mb-2"></div>
                <div className="h-4 bg-muted rounded w-5/6"></div>
              </CardContent>
              <CardFooter>
                <div className="h-4 bg-muted rounded w-1/3"></div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : filteredKnowledgeBases.length === 0 ? (
        <div className="text-center py-10">
          <Database className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
          <h3 className="mt-4 text-lg font-medium">No knowledge bases found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {searchQuery ? "Try a different search term" : "Create your first knowledge base to get started"}
          </p>
          {!searchQuery && (
            <Button className="mt-4" onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Knowledge Base
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredKnowledgeBases.map((kb) => (
            <Card key={kb.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>{kb.name}</CardTitle>
                <CardDescription>{kb.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-muted-foreground">
                  <FileText className="h-4 w-4 mr-1" />
                  <span>{kb.documentCount} documents</span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground mt-1">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Updated {formatDate(kb.updatedAt)}</span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm" onClick={() => setSelectedKnowledgeBaseId(kb.id)}>
                  <Info className="h-4 w-4 mr-2" />
                  View Details
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEditDialog(kb)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDeleteKnowledgeBase(kb.id)}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Create Knowledge Base Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Knowledge Base</DialogTitle>
          </DialogHeader>
          <KnowledgeBaseForm
            onSubmit={handleCreateKnowledgeBase}
            onCancel={() => setIsCreateDialogOpen(false)}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Knowledge Base Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Knowledge Base</DialogTitle>
          </DialogHeader>
          {knowledgeBaseToEdit && (
            <KnowledgeBaseForm
              knowledgeBase={knowledgeBaseToEdit}
              onSubmit={handleEditKnowledgeBase}
              onCancel={() => {
                setIsEditDialogOpen(false)
                setKnowledgeBaseToEdit(null)
              }}
              isSubmitting={isSubmitting}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
