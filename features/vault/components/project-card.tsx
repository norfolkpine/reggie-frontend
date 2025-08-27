"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, ArrowRight, LucideIcon, MoreHorizontal, Edit, Trash } from "lucide-react"
import { Project, getProjectId } from "@/types/api"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { updateProject, deleteProject } from "@/api/projects";
import { useToast } from "@/components/ui/use-toast";

interface ProjectCardProps {
  project: Project
  onSelect?: (projectName: string) => void
  onProjectDeleted?: (projectId: string) => void
  onProjectRenamed?: (projectId: string, newName: string) => void
}

export function ProjectCard({ project, onSelect, onProjectDeleted, onProjectRenamed }: ProjectCardProps) {
  const { toast } = useToast();
  const [renameOpen, setRenameOpen] = useState(false);
  const [newName, setNewName] = useState(project.name || "");
  const [isRenaming, setIsRenaming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleRename = async () => {
    const projectId = getProjectId(project);
    if (!projectId) return;
    setIsRenaming(true);
    try {
      await updateProject(projectId, { ...project, name: newName });
      toast({ title: "Project renamed", description: `Project renamed to '${newName}'.` });
      setRenameOpen(false);
      // Notify parent component instead of reloading page
      onProjectRenamed?.(projectId, newName);
    } catch (e) {
      toast({ title: "Error renaming project", description: "Please try again.", variant: "destructive" });
    } finally {
      setIsRenaming(false);
    }
  };

  const handleDelete = async () => {
    const projectId = getProjectId(project);
    if (!projectId) return;
    if (!window.confirm(`Are you sure you want to delete project '${project.name}'? This cannot be undone.`)) return;
    setIsDeleting(true);
    try {
      await deleteProject(projectId);
      toast({ title: "Project deleted", description: `Project '${project.name}' was deleted.` });
      // Notify parent component instead of reloading page
      onProjectDeleted?.(projectId);
    } catch (e) {
      toast({ title: "Error deleting project", description: "Please try again.", variant: "destructive" });
    } finally {
      setIsDeleting(false);
    }
  };

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
          <div className="flex items-center gap-2">
            {project.starred && (
              <Badge variant="default" className="bg-primary/10 text-primary border-primary/20 shrink-0">
                <Star className="h-3 w-3 mr-1 fill-primary" /> Popular
              </Badge>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 p-0" onClick={e => e.stopPropagation()}>
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={e => { e.stopPropagation(); setRenameOpen(true); }}>
                  <Edit className="h-4 w-4 mr-2" />Rename
                </DropdownMenuItem>
                <DropdownMenuItem onClick={e => { e.stopPropagation(); handleDelete(); }} disabled={isDeleting} className="text-destructive focus:text-destructive">
                  <Trash className="h-4 w-4 mr-2" />{isDeleting ? "Deleting..." : "Delete"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
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
      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent onClick={e => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Rename Project</DialogTitle>
          </DialogHeader>
          <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="New project name" />
          <DialogFooter>
            <Button onClick={() => setRenameOpen(false)} variant="outline">Cancel</Button>
            <Button onClick={handleRename} disabled={isRenaming || !newName.trim()}>{isRenaming ? "Renaming..." : "Rename"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
