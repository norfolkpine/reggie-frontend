"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, ArrowRight, LucideIcon, MoreHorizontal, Edit, Trash, User, MessageSquare } from "lucide-react"
import { Project, getProjectId } from "@/types/api"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState, useCallback, memo } from "react";
import { updateProject, deleteProject } from "@/api/projects";
import { useToast } from "@/components/ui/use-toast";
import { DeleteProjectDialog } from "./delete-project-dialog";

interface ProjectCardProps {
  project: Project
  onSelect?: (projectName: string) => void
  onProjectDeleted?: (projectId: string) => void
  onProjectRenamed?: (projectId: string, newName: string) => void
}

export const ProjectCard = memo(function ProjectCard({ project, onSelect, onProjectDeleted, onProjectRenamed }: ProjectCardProps) {
  const { toast } = useToast();
  const [renameOpen, setRenameOpen] = useState(false);
  const [newName, setNewName] = useState(project.name || "");
  const [isRenaming, setIsRenaming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteProjectOpen, setDeleteProjectOpen] = useState(false);

  const handleRename = useCallback(async () => {
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
  }, [project, newName, toast, onProjectRenamed]);

  const handleDelete = useCallback(() => {
    setDeleteProjectOpen(true);
  }, []);

  const handleCardClick = useCallback((e: React.MouseEvent) => {
    // Don't navigate if clicking on buttons, dropdowns, or interactive elements
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('[role="menuitem"]') || target.closest('.dropdown-menu')) {
      return;
    }
    
    // Only navigate if clicking on the card content
    onSelect?.(project.name ?? '');
  }, [onSelect, project.name]);

  const handleRenameClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setRenameOpen(true);
  }, []);

  const handleDeleteClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    handleDelete();
  }, [handleDelete]);

  const handleMoreClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  return (
    <Card 
      className={`overflow-hidden flex flex-col h-full w-full aspect-[4/5] ${project.starred ? "border-yellow-300" : ""} hover:shadow-md transition-all cursor-pointer`}
      onClick={handleCardClick}
    >
      <CardHeader className={`p-4 pb-2 flex-1 bg-muted`}>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-background">
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
                <Button variant="ghost" size="icon" className="h-8 w-8 p-0" onClick={handleMoreClick}>
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleRenameClick}>
                  <Edit className="h-4 w-4 mr-2" />Rename
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDeleteClick} disabled={isDeleting} className="text-destructive focus:text-destructive">
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
            <Badge key={index} variant="outline" className="bg-background">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 mt-auto">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <span>{project.teamSize} member{project.teamSize !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MessageSquare className="h-4 w-4" />
            <span>{project.chatCount} chat{project.chatCount !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </CardFooter>

      {/* Rename Dialog */}
      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Enter new project name"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRename} disabled={isRenaming}>
              {isRenaming ? "Renaming..." : "Rename"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Project Dialog */}
      <DeleteProjectDialog
        open={deleteProjectOpen}
        onOpenChange={setDeleteProjectOpen}
        projectId={getProjectId(project) || null}
        projectName={project.name || null}
        onProjectDeleted={onProjectDeleted}
      />
    </Card>
  )
});
