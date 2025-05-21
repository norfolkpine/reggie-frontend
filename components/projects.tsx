"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { FolderGit2, Plus, MoreHorizontal, Calendar, MessageSquare } from "lucide-react"
import { CreateProjectDialog } from "@/components/create-project-dialog"
import ProjectView from "./project-view"

// Sample projects data
const sampleProjects = [
  {
    id: 1,
    name: "Databricks",
    description: "Machine learning and data analytics project",
    lastUpdated: "Updated 2 days ago",
    chatCount: 12,
  },
  {
    id: 2,
    name: "Website Redesign",
    description: "Company website redesign project",
    lastUpdated: "Updated yesterday",
    chatCount: 8,
  },
  {
    id: 3,
    name: "Marketing Campaign",
    description: "Q2 marketing campaign planning",
    lastUpdated: "Updated 5 days ago",
    chatCount: 5,
  },
]

export default function Projects() {
  const [createProjectOpen, setCreateProjectOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<string | null>(null)

  const handleCreateProject = (name: string) => {
    // In a real app, this would make an API call
    console.log("Creating project:", name)
  }

  // If a project is selected, show the ProjectView
  if (selectedProject) {
    return <ProjectView projectName={selectedProject} onBack={() => setSelectedProject(null)} />
  }

  // Otherwise, show the projects list
  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <h1 className="text-xl font-medium">Vault</h1>
        <Button onClick={() => setCreateProjectOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sampleProjects.map((project) => (
            <Card key={project.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <FolderGit2 className="h-5 w-5 text-primary" />
                    <CardTitle>{project.name}</CardTitle>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
                <CardDescription>{project.description}</CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{project.lastUpdated}</span>
                </div>
              </CardContent>
              <CardFooter className="pt-0 flex justify-between">
                <div className="flex items-center text-sm text-muted-foreground">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  <span>{project.chatCount} chats</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedProject(project.name)}>
                  Open
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      <CreateProjectDialog
        open={createProjectOpen}
        onOpenChange={setCreateProjectOpen}
        onCreateProject={handleCreateProject}
      />
    </div>
  )
}

