"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, ArrowRight, LucideIcon } from "lucide-react"
import { Project } from "@/types/api"

interface ProjectCardProps {
  project: Project
  onSelect?: (projectName: string) => void
}

export function ProjectCard({ project, onSelect }: ProjectCardProps) {
  return (
    <Card 
      className={`overflow-hidden flex flex-col h-full w-full aspect-[4/5] ${project.starred ? "border-yellow-300" : ""} hover:shadow-md transition-all cursor-pointer`}
      onClick={() => onSelect?.(project.name ?? '')}
    >
      <CardHeader className={`p-4 pb-2 flex-1 ${project.color || 'bg-muted'}`}>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-white">
              {project.icon && <project.icon className="h-5 w-5" />}
            </div>
            <CardTitle className="text-lg line-clamp-2">{project.name}</CardTitle>
          </div>
          {project.starred && (
            <Badge variant="default" className="bg-primary/10 text-primary border-primary/20 shrink-0">
              <Star className="h-3 w-3 mr-1 fill-primary" /> Popular
            </Badge>
          )}
        </div>
        <CardDescription className="mt-2 line-clamp-3 h-12">{project.description}</CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex flex-wrap gap-2 mt-2">
          {project.tags?.map((tag, index) => (
            <Badge key={index} variant="outline" className="bg-white">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="p-2 bg-muted/50 flex justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{project.lastUpdated}</span>
          {project.teamSize && (
            <span className="text-sm text-muted-foreground">{project.teamSize} members</span>
          )}
          {project.chatCount !== undefined && (
            <span className="text-sm text-muted-foreground">
              {project.chatCount} chats
            </span>
          )}
        </div>
        <Button variant="ghost" size="sm" className="gap-1">
          View <ArrowRight className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}
