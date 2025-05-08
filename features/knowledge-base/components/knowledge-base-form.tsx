"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Info, Plus, X, Server } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import type { KnowledgeBase, ChunkMethod, KnowledgeBasePermission } from "@/types/knowledge-base"
import { getModelProviders, ModelProvider } from "@/api/agent-providers"
import { createKnowledgeBase, updateKnowledgeBase } from "@/api/knowledge-bases"
import { KnowledgeBase as ApiKnowledgeBase } from "@/types/api"

interface KnowledgeBaseFormProps {
  knowledgeBase?: KnowledgeBase
  onSubmit: (data: Partial<KnowledgeBase>) => void
  onCancel: () => void
  isSubmitting: boolean
}

export function KnowledgeBaseForm({ knowledgeBase, onSubmit, onCancel, isSubmitting: isSubmittingProp }: KnowledgeBaseFormProps) {
  const [name, setName] = useState(knowledgeBase?.name || "")
  const [description, setDescription] = useState(knowledgeBase?.description || "")
  const [modelProvider, setModelProvider] = useState<number | undefined>(knowledgeBase?.model_provider)
  const [activeTab, setActiveTab] = useState("general")
  const [modelProviders, setModelProviders] = useState<ModelProvider[]>([])
  const [isLoadingModels, setIsLoadingModels] = useState(false)
  const [modelError, setModelError] = useState<string | null>(null)
  const [newUserEmail, setNewUserEmail] = useState("")
  const [newUserRole, setNewUserRole] = useState<KnowledgeBasePermission["role"]>("viewer")
  const [isSubmitting, setIsSubmitting] = useState(isSubmittingProp)
  const { toast } = useToast()
  const [permissions, setPermissions] = useState<KnowledgeBasePermission[]>(knowledgeBase?.permissions || [])

  useEffect(() => {
    const fetchModelProviders = async () => {
      setIsLoadingModels(true)
      setModelError(null)
      try {
        const response = await getModelProviders()
        setModelProviders(response.results)
        
        // Set default model if not editing
        if (!knowledgeBase && response.results.length > 0) {
          const defaultModel = response.results.find(m => m.is_enabled) || response.results[0]
          setModelProvider(defaultModel.id)
        }
      } catch (error) {
        console.error("Failed to fetch model providers:", error)
        setModelError("Failed to load model providers")
        toast({
          title: "Error",
          description: "Failed to load model providers",
          variant: "destructive",
        })
      } finally {
        setIsLoadingModels(false)
      }
    }

    fetchModelProviders()
    
    if (!knowledgeBase) {
      
      // Add current user as owner by default
      setPermissions([
        {
          id: "default-owner",
          userId: "current-user", // In a real app, this would be the current user's ID
          role: "owner",
        },
      ])
    }
  }, [knowledgeBase, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Ensure required fields are present
    if (!name) {
      toast({
        title: "Validation Error",
        description: "Knowledge base name is required",
        variant: "destructive",
      })
      return
    }

    // Convert to API format
    const apiData = {
      name,
      description: description || "",
      model_provider: modelProvider,
    } as Omit<ApiKnowledgeBase, 'id' | 'created_at' | 'updated_at'>

    setIsSubmitting(true)
    try {
      let result
      if (knowledgeBase?.id) {
        result = await updateKnowledgeBase(knowledgeBase.id, apiData)
      } else {
        result = await createKnowledgeBase(apiData)
      }
      
      // Convert API result back to local format
      const localFormatResult: Partial<KnowledgeBase> = {
        id: result.id,
        name: result.name,
        description: result.description,
        model_provider: modelProvider,
        created_at: result.created_at,
        updated_at: result.updated_at,
      }
      
      toast({
        title: knowledgeBase ? "Knowledge base updated" : "Knowledge base created",
        description: `Successfully ${knowledgeBase ? "updated" : "created"} knowledge base "${name}"`,
      })
      
      onSubmit(localFormatResult)
    } catch (error) {
      console.error("Failed to save knowledge base:", error)
      toast({
        title: "Error",
        description: `Failed to ${knowledgeBase ? "update" : "create"} knowledge base`,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
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


  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full">
          <TabsTrigger value="general" className="w-full">General</TabsTrigger>
          <TabsTrigger value="embedding" className="w-full">Embedding & Chunking</TabsTrigger>
          <TabsTrigger value="permissions" className="w-full">Permissions</TabsTrigger>
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
              {isLoadingModels ? (
                <div className="flex items-center space-x-2 p-2">
                  <Server className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Loading models...</span>
                </div>
              ) : modelError ? (
                <div className="text-destructive text-sm p-2">{modelError}</div>
              ) : (
                <Select 
                  value={modelProvider?.toString()} 
                  onValueChange={(value) => setModelProvider(value ? parseInt(value, 10) : undefined)}
                >
                  <SelectTrigger id="embedding-model">
                    <SelectValue placeholder="Select an embedding model" />
                  </SelectTrigger>
                  <SelectContent>
                    {modelProviders.map((model) => (
                      <SelectItem 
                        key={model.model_name} 
                        value={model.id.toString()}
                        disabled={!model.is_enabled}
                      >
                        <div className="flex flex-col">
                          <span>{model.model_name}</span>
                          <span className="text-xs text-muted-foreground">
                            {model.provider} {!model.is_enabled && " (Currently unavailable)"}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {modelProvider && !isLoadingModels && (
                <p className="text-xs text-muted-foreground mt-1">
                  {modelProviders.find(m => m.id === modelProvider)?.description}
                </p>
              )}
            </div>
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
