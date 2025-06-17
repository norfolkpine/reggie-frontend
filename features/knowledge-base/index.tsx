"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileManager } from "./components/file-manager"
import { KnowledgeBaseManager } from "./components/knowledge-base-manager"
import type { File, KnowledgeBase } from "@/types/knowledge-base"

export default function KnowledgeManagement() {
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('kb_active_tab') || 'files';
    }
    return 'files';
  })
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([])
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([])

  useEffect(() => {
    fetchData();
  }, []);

  // Persist activeTab in localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('kb_active_tab', activeTab);
    }
  }, [activeTab]);

  const fetchData = async () => {
    try {
      // In a real implementation, these would be actual API calls
      // const fetchedFiles = await knowledgeBaseService.getFiles()
      // const fetchedKbs = await knowledgeBaseService.getKnowledgeBases()

      // Simulate API calls
      await Promise.all([
        new Promise((resolve) => setTimeout(resolve, 1000)),
        new Promise((resolve) => setTimeout(resolve, 1000)),
      ])

      // Sample data is now handled in the individual components
    } catch (error) {
      console.error("Failed to fetch data:", error)
    }
  }

  const handleLinkFiles = (fileIds: string[], knowledgeBaseId: string) => {
    // This is now handled in the FileManager component
    setIsLinkModalOpen(false)
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="p-4 border-b flex items-center justify-between">
        <h1 className="text-xl font-medium">Knowledge Management</h1>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <Tabs defaultValue="files" value={activeTab} onValueChange={(value) => {
          setActiveTab(value);
          if (typeof window !== 'undefined') {
            localStorage.setItem('kb_active_tab', value);
          }
        }}>
          <TabsList>
            <TabsTrigger value="files">Files</TabsTrigger>
            <TabsTrigger value="knowledge-bases">Knowledge Bases</TabsTrigger>
          </TabsList>
          <TabsContent value="files" className="mt-4">
            <FileManager />
          </TabsContent>
          <TabsContent value="knowledge-bases" className="mt-4">
            <KnowledgeBaseManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
