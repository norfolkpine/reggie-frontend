"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Info, Plus, X } from "lucide-react"
import type { KnowledgeBase, EmbeddingModel, ChunkMethod, KnowledgeBasePermission } from "../types"

interface KnowledgeBaseFormProps {
  knowledgeBase?: KnowledgeBase
  onSubmit: (data: Partial<KnowledgeBase>) => void
  onCancel: () => void
  isSubmitting: boolean
}

export function KnowledgeBaseForm({ knowledgeBase, onSubmit, onCancel, isSubmitting }: KnowledgeBaseFormProps) {
  const [name, setName] = useState(knowledgeBase?.name || "")
  const [description, setDescription] = useState(knowledgeBase?.description || "")
  const [embeddingModel, setEmbeddingModel] = useState(knowledgeBase?.embeddingModel || "")
  const [chunkMethod, setChunkMethod] = useState(knowledgeBase?.chunkMethod || "")
  const [chunkSize, setChunkSize] = useState(knowledgeBase?.chunkSize || 1000)
  const [chunkOverlap, setChunkOverlap] = useState(knowledgeBase?.chunkOverlap || 200)
  const [permissions, setPermissions] = useState<KnowledgeBasePermission[]>(knowledgeBase?.permissions || [])
  const [activeTab, setActiveTab] = useState("general")
  const [availableModels, setAvailableModels] = useState<EmbeddingModel[]>([])
  const [availableChunkMethods, setAvailableChunkMethods] = useState<ChunkMethod[]>([])
  const [newUserEmail, setNewUserEmail] = useState("")
  const [newUserRole, setNewUserRole] = useState<KnowledgeBasePermission["role"]>("viewer")

  useEffect(() => {
    // In a real app, these would be fetched from an API
    const mockEmbeddingModels: EmbeddingModel[] = [
      {
        id: "openai-ada-002",
        name: "OpenAI Ada 002",
        provider: "OpenAI",
        description: "OpenAI's text-embedding-ada-002 model with 1536 dimensions",
        dimensions: 1536,
        isDefault: true,
      },
      {
        id: "openai-3-small",
        name: "OpenAI 3 Small",
        provider: "OpenAI",
        description: "OpenAI's text-embedding-3-small model with 1536 dimensions",
        dimensions: 1536,
      },
      {
        id: "openai-3-large",
        name: "OpenAI 3 Large",
        provider: "OpenAI",
        description: "OpenAI's text-embedding-3-large model with 3072 dimensions",
        dimensions: 3072,
      },
      {
        id: "cohere-embed-english",
        name: "Cohere Embed English",
        provider: "Cohere",
        description: "Cohere's English language embedding model",
        dimensions: 1024,
      },
      {
        id: "local-minilm",
        name: "Local MiniLM",
        provider: "Local",
        description: "Locally hosted MiniLM embedding model",
        dimensions: 384,
      },
    ]

    const mockChunkMethods: ChunkMethod[] = [
      {
        id: "general",
        name: "General",
        description: "General purpose chunking for most document types",
        supportsCustomSize: true,
        supportsOverlap: true,
        isDefault: true,
      },
      {
        id: "paper",
        name: "Paper",
        description: "Optimized for academic papers and research documents",
        supportsCustomSize: true,
        supportsOverlap: true,
      },
      {
        id: "resume",
        name: "Resume",
        description: "Specialized for parsing resumes and CVs",
        supportsCustomSize: true,
        supportsOverlap: true,
      },
      {
        id: "qa",
        name: "Q&A",
        description: "Designed for question and answer content",
        supportsCustomSize: true,
        supportsOverlap: true,
      },
    ]

    setAvailableModels(mockEmbeddingModels)
    setAvailableChunkMethods(mockChunkMethods)

    // Set defaults if not editing
    if (!knowledgeBase) {
      setEmbeddingModel(mockEmbeddingModels.find((m) => m.isDefault)?.id || mockEmbeddingModels[0].id)
      setChunkMethod(mockChunkMethods.find((m) => m.isDefault)?.id || mockChunkMethods[0].id)

      // Add current user as owner by default
      setPermissions([
        {
          id: "default-owner",
          userId: "current-user", // In a real app, this would be the current user's ID
          role: "owner",
        },
      ])
    }
  }, [knowledgeBase])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const selectedChunkMethodObj = availableChunkMethods.find((m) => m.id === chunkMethod)

    const data: Partial<KnowledgeBase> = {
      name,
      description,
      embeddingModel,
      chunkMethod,
      permissions,
    }

    // Only include chunk size and overlap if the selected method supports them
    if (selectedChunkMethodObj?.supportsCustomSize) {
      data.chunkSize = chunkSize
    }

    if (selectedChunkMethodObj?.supportsOverlap) {
      data.chunkOverlap = chunkOverlap
    }

    onSubmit(data)
  }

  const handleAddUser = () => {
    if (!newUserEmail.trim()) return

    // In a real app, you would validate the email and fetch the user details
    const newPermission: KnowledgeBasePermission = {
      id: `perm-${Date.now()}`,
      userId: `user-${Date.now()}`, // This would be the actual user ID in a real app
      role: newUserRole,
    }

    setPermissions([...permissions, newPermission])
    setNewUserEmail("")
    setNewUserRole("viewer")
  }

  const handleRemovePermission = (permissionId: string) => {
    setPermissions(permissions.filter((p) => p.id !== permissionId))
  }

  const selectedChunkMethodObj = availableChunkMethods.find((m) => m.id === chunkMethod)

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="embedding">Embedding & Chunking</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="kb-name">Name *</Label>
            <Input
              id="kb-name"
              placeholder="e.g., Product Documentation"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="kb-description">Description</Label>
            <Textarea
              id="kb-description"
              placeholder="Describe the purpose of this knowledge base"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </TabsContent>

        <TabsContent value="embedding" className="space-y-6 pt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="embedding-model">Embedding Model</Label>
              <Select value={embeddingModel} onValueChange={setEmbeddingModel}>
                <SelectTrigger id="embedding-model">
                  <SelectValue placeholder="Select an embedding model" />
                </SelectTrigger>
                <SelectContent>
                  {availableModels.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      <div className="flex flex-col">
                        <span>{model.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {model.provider} - {model.dimensions} dimensions
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                {availableModels.find((m) => m.id === embeddingModel)?.description}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="chunk-method">Chunk Method</Label>
              <Select value={chunkMethod} onValueChange={setChunkMethod}>
                <SelectTrigger id="chunk-method">
                  <SelectValue placeholder="Select a chunk method" />
                </SelectTrigger>
                <SelectContent>
                  {availableChunkMethods.map((method) => (
                    <SelectItem key={method.id} value={method.id}>
                      {method.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                {availableChunkMethods.find((m) => m.id === chunkMethod)?.description}
              </p>
            </div>

            {selectedChunkMethodObj?.supportsCustomSize && (
              <div className="space-y-2">
                <Label htmlFor="chunk-size">Chunk Size (tokens)</Label>
                <Input
                  id="chunk-size"
                  type="number"
                  min={100}
                  max={2000}
                  step={50}
                  value={chunkSize}
                  onChange={(e) => setChunkSize(Number.parseInt(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">
                  Smaller chunks are better for precise answers but may miss context. Larger chunks provide more context
                  but may be less precise.
                </p>
              </div>
            )}

            {selectedChunkMethodObj?.supportsOverlap && (
              <div className="space-y-2">
                <Label htmlFor="chunk-overlap">Chunk Overlap (tokens)</Label>
                <Input
                  id="chunk-overlap"
                  type="number"
                  min={0}
                  max={500}
                  step={10}
                  value={chunkOverlap}
                  onChange={(e) => setChunkOverlap(Number.parseInt(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">
                  Overlap helps maintain context between chunks. Higher overlap improves coherence but increases storage
                  requirements.
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-6 pt-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Users with Access</Label>
              <Badge variant="outline" className="font-normal">
                {permissions.length} {permissions.length === 1 ? "user" : "users"}
              </Badge>
            </div>

            <div className="border rounded-md divide-y">
              {permissions.map((permission) => (
                <div key={permission.id} className="flex items-center justify-between p-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {permission.userId === "current-user" ? "ME" : permission.userId?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">
                        {permission.userId === "current-user" ? "You" : `User ${permission.userId}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {permission.userId === "current-user"
                          ? "your@email.com"
                          : `user${permission.userId}@example.com`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Select
                      value={permission.role}
                      onValueChange={(value: KnowledgeBasePermission["role"]) => {
                        setPermissions(permissions.map((p) => (p.id === permission.id ? { ...p, role: value } : p)))
                      }}
                      disabled={permission.userId === "current-user"} // Can't change your own role
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="owner">Owner</SelectItem>
                        <SelectItem value="editor">Editor</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>

                    {permission.userId !== "current-user" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        type="button"
                        onClick={() => handleRemovePermission(permission.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-end gap-2">
              <div className="flex-1 space-y-2">
                <Label htmlFor="new-user-email">Add User by Email</Label>
                <Input
                  id="new-user-email"
                  type="email"
                  placeholder="user@example.com"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                />
              </div>
              <div className="w-24 space-y-2">
                <Label htmlFor="new-user-role">Role</Label>
                <Select
                  value={newUserRole}
                  onValueChange={(value: KnowledgeBasePermission["role"]) => setNewUserRole(value)}
                >
                  <SelectTrigger id="new-user-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="owner">Owner</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="button" onClick={handleAddUser} className="mb-0.5">
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>

            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-md">
              <Info className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                <strong>Roles:</strong> Owners can edit settings and manage permissions. Editors can add and remove
                files. Viewers can only view and search the knowledge base.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={!name.trim() || isSubmitting}>
          {isSubmitting ? "Saving..." : knowledgeBase ? "Save Changes" : "Create Knowledge Base"}
        </Button>
      </div>
    </form>
  )
}
