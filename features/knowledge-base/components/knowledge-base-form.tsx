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
import { getTeams } from "@/api/teams"
import _ from "lodash"

interface Team {
  id: number;
  name: string;
}

interface TeamPermission {
  id: string;
  team_id: number;
  team_name?: string;
  role: "owner" | "editor" | "viewer";
}

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
  const [teamPermissions, setTeamPermissions] = useState<TeamPermission[]>(knowledgeBase?.permissions?.filter((p): p is TeamPermission => p.team_id !== undefined) || [])
  const [selectedTeam, setSelectedTeam] = useState<Team>()

  useEffect(() => {
    if (knowledgeBase?.permissions) {
     
      const teamPerms = knowledgeBase.permissions
        .filter((p): p is TeamPermission => p.team_id !== undefined)
        .map(p => ({
          id: p.id,
          team_id: p.team_id!,
          team_name: p.team_name,
          role: p.role
        }))
      setTeamPermissions(teamPerms)
    }
  }, [knowledgeBase])

  const [newTeamName, setNewTeamName] = useState("")
  const [newTeamRole, setNewTeamRole] = useState<KnowledgeBasePermission["role"]>("viewer")
  const [teamSuggestions, setTeamSuggestions] = useState<Team[]>([])
  const [isFetchingTeams, setIsFetchingTeams] = useState(false)

  const fetchTeams = async (query: string) => {
    if (!query.trim()) {
      setTeamSuggestions([])
      return
    }

    setIsFetchingTeams(true)
    try {
      const response = await getTeams(1, query.trim())
      setTeamSuggestions(response.results)
    } catch (error) {
      console.error("Failed to fetch team suggestions:", error)
      toast({
        title: "Error",
        description: "Failed to fetch team suggestions",
        variant: "destructive",
      })
    } finally {
      setIsFetchingTeams(false)
    }
  }

  const debouncedFetch = _.debounce((query: string) => {
    fetchTeams(query)
  }, 300)

  // Add useEffect for team suggestions
  useEffect(() => {
    return () => {
      debouncedFetch.cancel()
    }
  }, [toast])

  // Add newTeamName change handler
  const handleNewTeamNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
   
    setNewTeamName(e.target.value)
    debouncedFetch(e.target.value)
  }

  // Add team permission handler
  const handleSelectTeamName = (teamName: string) => {
    if (!teamName.trim()) return

    const selectedTeam = teamSuggestions.find(team => team.name === teamName)
    if (!selectedTeam) {
      toast({
        title: "Error",
        description: "Please select a team from the suggestions",
        variant: "destructive",
      })
      return
    }
    setSelectedTeam(selectedTeam);
    setTeamSuggestions([]);
  }

  const handleAddTeamPermission = () => {
    if (!selectedTeam) return

    const newPermission: TeamPermission = {
      id: `team-perm-${Date.now()}`,
      team_id: selectedTeam.id,
      team_name: selectedTeam.name,
      role: newTeamRole,
    }

    setTeamPermissions([...teamPermissions, newPermission])
    setSelectedTeam(undefined)
    setNewTeamRole("viewer")
    setNewTeamName("");
  }

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

   if(teamPermissions && teamPermissions.length > 0) {
    apiData.permissions_input = teamPermissions
   }

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
        permissions: result.permissions,
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
          <TabsTrigger value="team-permissions" className="w-full">Team Permissions</TabsTrigger>
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

       

        <TabsContent value="team-permissions" className="space-y-6 pt-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Teams with Access</Label>
              <Badge variant="outline" className="font-normal">
                {teamPermissions.length} {teamPermissions.length === 1 ? "team" : "teams"}
              </Badge>
            </div>

            <div className="border rounded-md divide-y">
              {teamPermissions.map((permission) => (
                <div key={permission.id} className="flex items-center justify-between p-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {permission.team_name?.charAt(0).toUpperCase() || "T"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">
                        {permission.team_name || `Team ${permission.team_id}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Select
                      value={permission.role}
                      onValueChange={(value: KnowledgeBasePermission["role"]) => {
                        setTeamPermissions(teamPermissions.map((p) => (p.id === permission.id ? { ...p, role: value } : p)))
                      }}
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

                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      onClick={() => setTeamPermissions(teamPermissions.filter((p) => p.id !== permission.id))}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-end gap-2">
              <div className="flex-1 space-y-2">
                <Label htmlFor="new-team-name">Add Team by Team Name</Label>
                <div className="relative">
                  <Input
                    id="new-team-name"
                    placeholder="Type team name..."
                    value={newTeamName}
                    onChange={handleNewTeamNameChange}
                  />
                  {isFetchingTeams && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <Server className="h-4 w-4 animate-spin" />
                    </div>
                  )}
                  {teamSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-auto">
                      {teamSuggestions.map((team) => (
                        <div
                          key={team.id}
                          className="p-2 hover:bg-muted cursor-pointer"
                          onClick={() => {
                            setNewTeamName(team.name)
                            handleSelectTeamName(team.name)
                          }}
                        >
                          {team.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="w-24 space-y-2">
                <Label htmlFor="new-team-role">Role</Label>
                <Select
                  value={newTeamRole}
                  onValueChange={(value: KnowledgeBasePermission["role"]) => setNewTeamRole(value)}
                >
                  <SelectTrigger id="new-team-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="owner">Owner</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="button" onClick={handleAddTeamPermission} className="mb-0.5">
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
