"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Info, Upload, X, FileText, File, Globe, Plus, Database, ChevronDown } from "lucide-react"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { AgentForm, UploadedFile, UrlResource } from "./types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getKnowledgeBases } from "@/api/knowledge-bases"
import { KnowledgeBase } from "@/types/api"
import { Skeleton } from "@/components/ui/skeleton"
import { useAgent } from "../context/agent-context";

interface AgentResourcesProps {
  onChange: (agentData: AgentForm) => void
}

export default function AgentResources({ onChange }: AgentResourcesProps) {
  const { agentData } = useAgent();
 
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [urls, setUrls] = useState<UrlResource[]>([])
  const [newUrl, setNewUrl] = useState("")
  const [urlError, setUrlError] = useState("")
  const [citeResources, setCiteResources] = useState(false)
  const [knowledgeBaseId, setKnowledgeBaseId] = useState<string | null>(null)
  const [searchKnowledge, setSearchKnowledge] = useState(false)
  const [citeKnowledge, setCiteKnowledge] = useState(false)
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([])
  const [isLoadingKnowledgeBases, setIsLoadingKnowledgeBases] = useState(false)

  // Sync local knowledgeBaseId with agentData.knowledgeBaseId only on mount
  useEffect(() => {
    setKnowledgeBaseId(agentData.knowledgeBaseId ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    onChange({
      files: files,
      urls: urls,
      isCite: citeResources,
      knowledgeBaseId: knowledgeBaseId,
      searchKnowledge: searchKnowledge,
      citeKnowledge: citeKnowledge
    })
  }, [files, urls, citeResources, knowledgeBaseId, searchKnowledge, citeKnowledge])

  useEffect(() => {
    const fetchKnowledgeBases = async () => {
      setIsLoadingKnowledgeBases(true)
      try {
        const response = await getKnowledgeBases()
        console.log(response.results)
        setKnowledgeBases(response.results)
      } catch (error) {
        console.error("Failed to fetch knowledge bases:", error)
      } finally {
        setIsLoadingKnowledgeBases(false)
      }
    }

    fetchKnowledgeBases()
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map((file) => ({
        id: Math.random().toString(36).substring(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
      }))

      setFiles((prev) => [...prev, ...newFiles])
    }
  }

  const removeFile = (id: string) => {
    setFiles(files.filter((file) => file.id !== id))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " bytes"
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB"
    else return (bytes / 1048576).toFixed(1) + " MB"
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return "🖼️"
    if (type.startsWith("text/")) return <FileText className="h-4 w-4" />
    if (type.includes("pdf")) return "📄"
    if (type.includes("spreadsheet") || type.includes("excel")) return "📊"
    if (type.includes("document") || type.includes("word")) return "📝"
    return <File className="h-4 w-4" />
  }

  const validateUrl = (url: string) => {
    try {
      new URL(url)
      return true
    } catch (e) {
      return false
    }
  }

  const addUrl = () => {
    if (!newUrl.trim()) {
      setUrlError("URL cannot be empty")
      return
    }

    if (!validateUrl(newUrl)) {
      setUrlError("Please enter a valid URL (e.g., https://example.com)")
      return
    }

    const newUrlResource = {
      id: Math.random().toString(36).substring(2, 9),
      url: newUrl,
      status: "pending" as const,
      addedAt: new Date(),
    }

    setUrls((prev) => [...prev, newUrlResource])
    setNewUrl("")
    setUrlError("")
  }

  const removeUrl = (id: string) => {
    setUrls(urls.filter((url) => url.id !== id))
  }

  const formatTimestamp = (date: Date) => {
    return date.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusBadge = (status: UrlResource["status"]) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
            Pending
          </span>
        )
      case "scraped":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
            Scraped
          </span>
        )
      case "error":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
            Error
          </span>
        )
      default:
        return null
    }
  }

  const handleKnowledgeBaseChange = (value: string) => {
    if (value === "none") {
      setKnowledgeBaseId(null)
      return
    }
    
    setKnowledgeBaseId(value)
    if (value) {
      setSearchKnowledge(true)
    }
  }

  const getSelectValue = () => {
    if (knowledgeBaseId === null) return "none"
    return knowledgeBaseId.toString()
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Knowledge Base</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Knowledge Base Dropdown */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Label className="text-sm font-medium">Choose a Knowledge Base</Label>
              <HoverCard>
                <HoverCardTrigger asChild>
                  <Info className="h-4 w-4 ml-2 text-muted-foreground cursor-help" />
                </HoverCardTrigger>
                <HoverCardContent className="w-80">
                  <p className="text-sm">
                    Select a knowledge base for the agent to use when answering questions.
                  </p>
                </HoverCardContent>
              </HoverCard>
            </div>
            <Button
              variant="link"
              size="sm"
              className="text-xs"
              onClick={() => window.open("/knowledge-base", "_blank")}
            >
              Manage knowledge bases
            </Button>
          </div>

          {isLoadingKnowledgeBases ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Select 
              value={getSelectValue()} 
              onValueChange={handleKnowledgeBaseChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a knowledge base" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {knowledgeBases.map((kb) => (
                  <SelectItem key={kb.knowledgebase_id} value={kb.knowledgebase_id}>
                    <div className="flex items-center">
                      <Database className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{kb.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* {knowledgeBaseId && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="search-knowledge" 
                  checked={searchKnowledge} 
                  onCheckedChange={setSearchKnowledge} 
                />
                <Label htmlFor="search-knowledge" className="text-sm font-medium">
                  Search knowledge base for answers
                </Label>
              </div>

              {searchKnowledge && (
                <div className="flex items-center space-x-2 ml-6">
                  <Switch 
                    id="cite-knowledge" 
                    checked={citeKnowledge} 
                    onCheckedChange={setCiteKnowledge}
                  />
                  <Label htmlFor="cite-knowledge" className="text-sm font-medium">
                    Cite knowledge base sources
                  </Label>
                </div>
              )}
            </div>
          )} */}
        </div>

        {/* <div className="flex items-center space-x-2">
          <Switch id="cite-resources" checked={citeResources} onCheckedChange={setCiteResources} />
          <div className="flex items-center">
            <Label htmlFor="cite-resources" className="text-sm font-medium">
              Agent should cite any resource(s) that it uses
            </Label>
            <HoverCard>
              <HoverCardTrigger asChild>
                <Info className="h-4 w-4 ml-2 text-muted-foreground cursor-help" />
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <p className="text-sm">When enabled, the agent will cite the resources it uses in its responses.</p>
              </HoverCardContent>
            </HoverCard>
          </div>
        </div> */}

        {/* <Tabs defaultValue="files" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="files">Upload Files</TabsTrigger>
            <TabsTrigger value="urls">Web URLs</TabsTrigger>
          </TabsList>

          <TabsContent value="files" className="space-y-4 mt-4">
            <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-muted/50 transition-colors">
              <input type="file" id="file-upload" className="sr-only" multiple onChange={handleFileChange} />
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                <span className="text-sm font-medium mb-1">Drag and drop files here or click to browse</span>
                <span className="text-xs text-muted-foreground">Maximum file size: 50MB</span>
              </label>
            </div>

            {files.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium">Uploaded files ({files.length})</div>
                <div className="border rounded-md divide-y">
                  {files.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-3">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          {typeof getFileIcon(file.type) === "string" ? (
                            <span className="text-lg">{getFileIcon(file.type)}</span>
                          ) : (
                            getFileIcon(file.type)
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{file.name}</p>
                          <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFile(file.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Remove file</span>
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end">
                  <Button variant="outline" size="sm" onClick={() => setFiles([])}>
                    Clear all
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="urls" className="space-y-4 mt-4">
            <div className="space-y-2">
              <div className="flex items-center">
                <label className="text-sm font-medium">Add URLs for scraping</label>
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <Info className="h-4 w-4 ml-2 text-muted-foreground cursor-help" />
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <p className="text-sm">
                      Enter web URLs that the agent can scrape for information. The content will be processed and made
                      available as a resource.
                    </p>
                  </HoverCardContent>
                </HoverCard>
              </div>

              <div className="flex space-x-2">
                <div className="flex-1">
                  <Input
                    value={newUrl}
                    onChange={(e) => {
                      setNewUrl(e.target.value)
                      if (urlError) setUrlError("")
                    }}
                    placeholder="https://example.com"
                    className={cn(urlError && "border-red-500")}
                  />
                  {urlError && <p className="text-xs text-red-500 mt-1">{urlError}</p>}
                </div>
                <Button type="button" onClick={addUrl}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
            </div>

            {urls.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium">Added URLs ({urls.length})</div>
                <div className="border rounded-md divide-y">
                  {urls.map((url) => (
                    <div key={url.id} className="flex items-center justify-between p-3">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{url.url}</p>
                          <div className="flex items-center text-xs text-muted-foreground mt-1">
                            <span>Added: {formatTimestamp(url.addedAt)}</span>
                            <span className="mx-2">•</span>
                            <span>Status: {getStatusBadge(url.status)}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => removeUrl(url.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Remove URL</span>
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end">
                  <Button variant="outline" size="sm" onClick={() => setUrls([])}>
                    Clear all
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs> */}
      </CardContent>
    </Card>
  )
}

