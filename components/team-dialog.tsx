"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronLeft } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

// Add to imports
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown } from "lucide-react"

interface TeamDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function TeamDialog({ open, onOpenChange }: TeamDialogProps) {
  const [selectedTeam, setSelectedTeam] = React.useState<string | null>(null)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {selectedTeam ? (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setSelectedTeam(null)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {selectedTeam}
              </div>
            ) : (
              "Teams"
            )}
          </DialogTitle>
          <DialogDescription>
            {selectedTeam ? "Manage team members and settings" : "Manage your teams and team members"}
          </DialogDescription>
        </DialogHeader>

        {selectedTeam ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Input 
                defaultValue={selectedTeam} 
                className="max-w-[200px]"
              />
              <Button variant="destructive" size="sm">Delete Team</Button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium">Members</h3>
                  <span className="text-xs text-muted-foreground">(12)</span>
                </div>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Add member email" 
                    className="h-8 w-[200px]" 
                    
                  />
                  <Button size="sm" className="h-8">Invite</Button>
                </div>
              </div>
              
              <ScrollArea className="h-[320px] rounded-md border">
                <div className="p-3 space-y-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback>M{i}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm">Member {i}</p>
                          <p className="text-xs text-muted-foreground">member{i}@example.com</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                              Admin <ChevronDown className="ml-1 h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-[120px]">
                            <DropdownMenuItem className="text-xs">
                              Admin
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-xs">
                              Member
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-xs">
                              Viewer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-destructive">
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        ) : (
          <Tabs defaultValue="my-teams">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="my-teams">My Teams</TabsTrigger>
              <TabsTrigger value="create">Create Team</TabsTrigger>
            </TabsList>
            <TabsContent value="my-teams" className="mt-4">
              <ScrollArea className="h-[300px]">
                <div className="space-y-4">
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Development Team</h4>
                        <p className="text-sm text-muted-foreground">8 members</p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setSelectedTeam("Development Team")}
                      >
                        Manage
                      </Button>
                  </div>
                  <div className="mt-4">
                    <div className="flex -space-x-2">
                      {[1, 2, 3, 4].map((i) => (
                        <Avatar key={i} className="h-8 w-8 border-2 border-background">
                          <AvatarFallback>M{i}</AvatarFallback>
                        </Avatar>
                      ))}
                      <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-muted">
                        <span className="text-xs font-medium">+4</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Design Team</h4>
                      <p className="text-sm text-muted-foreground">4 members</p>
                    </div>
                    <Button variant="outline" size="sm">Manage</Button>
                  </div>
                  <div className="mt-4">
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map((i) => (
                        <Avatar key={i} className="h-8 w-8 border-2 border-background">
                          <AvatarFallback>D{i}</AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
          <TabsContent value="create" className="mt-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="team-name">Team Name</Label>
                <Input id="team-name" placeholder="Enter team name" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="team-description">Description</Label>
                <Input id="team-description" placeholder="Brief description of your team" />
              </div>
              <div className="grid gap-2">
                <Label>Invite Members</Label>
                <div className="flex gap-2">
                  <Input placeholder="Enter email address" />
                  <Button variant="secondary">Invite</Button>
                </div>
              </div>
              <Button className="mt-4">Create Team</Button>
            </div>
          </TabsContent>
        </Tabs>
        )}
      </DialogContent>
    </Dialog>
  )
}