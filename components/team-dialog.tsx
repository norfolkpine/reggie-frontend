"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft } from "lucide-react";

// Add to imports
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

import {
  getTeams,
  getTeam,
  createTeam,
  updateTeam,
  deleteTeam,
} from "@/api/teams";
import { Team } from "@/types/api";

import { ConfirmationDialog } from "@/components/confirmation-dialog";

import { teamStorage } from "@/lib/utils/team-storage";

interface TeamDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

import {
  createTeamInvitation,
  deleteTeamInvitation,
} from "@/api/team-invitations";
import { handleApiError } from "@/lib/utils/handle-api-error";
import { Badge } from "./ui/badge";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "./ui/use-toast";

export function TeamDialog({ open, onOpenChange }: TeamDialogProps) {
  const [teamToDelete, setTeamToDelete] = React.useState<Team | null>(null);
  const [selectedTeam, setSelectedTeam] = React.useState<Team | null>(null);
  const [teams, setTeams] = React.useState<Team[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [inviteEmail, setInviteEmail] = React.useState("");
  const { toast } = useToast();
  const [activeTab, setActiveTab] = React.useState("my-teams");
  const { user } = useAuth()

  const fetchTeams = async () => {
    if (!open) return;

    setLoading(true);
    try {
      const currentTeam = teamStorage.getActiveTeam();
      const teamList = await getTeams();
      setTeams(
        teamList.results.map((e) => {
          return {
            ...e,
            is_current: e.id === currentTeam?.id,
          };
        })
      );
    } catch (err) {
      const { message } = handleApiError(err);
      if (message) {
        toast({
          title: message,
          description: "Failed to fetch teams. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchTeams();
  }, [open, toast]);

  const handleCreateTeam = async (teamName: string) => {
    setLoading(true);
    try {
      const newTeam = await createTeam({ name: teamName });
      setTeams((prevTeams) => [...prevTeams, newTeam]);
      fetchTeams();
    } catch (err) {
      const { message } = handleApiError(err);
      if (message) {
        toast({
          title: message,
          description: "Failed to create team. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTeam = async (teamId: number, teamName: string) => {
    setLoading(true);
    try {
      const updatedTeam = await updateTeam(teamId, { name: teamName });
      setTeams((prevTeams) =>
        prevTeams.map((team) => (team.id === teamId ? updatedTeam : team))
      );
      fetchTeams();
    } catch (err) {
      const { message } = handleApiError(err);
      if (message) {
        toast({
          title: message,
          description: "Failed to update team. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeam = async (teamId: number) => {
    setLoading(true);
    try {
      await deleteTeam(teamId);
      setTeams((prevTeams) =>
        prevTeams.filter((team) => team.id !== teamId)
      );
      
    } catch (err) {
      
    } finally {
      setLoading(false);
      fetchTeams();
      setSelectedTeam(null);
    }
  };

  const handleInviteMember = async (
    teamId: number,
    teamSlug: string,
    email: string
  ) => {
    setLoading(true);
    try {
      await createTeamInvitation(teamSlug.toString(), {
        email,
        role: "member",
        team: teamId,
      });
      setInviteEmail("");
      const updatedTeam = await getTeam(teamId);
      setSelectedTeam(updatedTeam);
      setTeams((prevTeams) =>
        prevTeams.map((team) =>
          team.id === teamId? updatedTeam : team
        )
      );
    } catch (err) {
      const { message } = handleApiError(err);

      if (message) {
        toast({
          title: message,
          description: "Please check the email address and try again.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveInvitation = async (
    teamSlug: string,
    teamId: number,
    invitationId: string
  ) => {
    setLoading(true);
    try {
      await deleteTeamInvitation(teamSlug.toString(), invitationId);
      
    } catch (err) {
      
    } finally {
      const updatedTeam = await getTeam(teamId);
      setSelectedTeam(updatedTeam);
      setTeams((prevTeams) =>
        prevTeams.map((team) =>
          team.id === teamId? updatedTeam : team
        )
      );
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {selectedTeam ? (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedTeam(null)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="truncate max-w-[200px]">
                    {selectedTeam.name}
                  </span>
                </div>
              ) : (
                "Teams"
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedTeam
                ? "Manage team members and settings"
                : "Manage your teams and team members"}
            </DialogDescription>
          </DialogHeader>

          {loading && <p>Loading...</p>}

          {selectedTeam ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Input
                    defaultValue={selectedTeam.name}
                    className="w-[200px] h-9"
                    onChange={(e) =>
                      setSelectedTeam({ ...selectedTeam, name: e.target.value })
                    }
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleUpdateTeam(selectedTeam.id, selectedTeam.name)
                    }
                  >
                    Edit
                  </Button>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={selectedTeam.is_current}
                  onClick={() => setTeamToDelete(selectedTeam)}
                >
                  Delete Team
                </Button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium">Members</h3>
                    <span className="text-xs text-muted-foreground">
                      ({selectedTeam.members.length})
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add member email"
                      className="h-8 w-[200px]"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                    <Button
                      size="sm"
                      className="h-8"
                      onClick={() => {
                        handleInviteMember(
                          selectedTeam.id,
                          selectedTeam.slug,
                          inviteEmail
                        );
                      }}
                    >
                      Invite
                    </Button>
                  </div>
                </div>

                <ScrollArea className="h-[320px] rounded-md border">
                  <div className="p-3 space-y-2">
                    {selectedTeam.members.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between py-1"
                      >
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7">
                            <AvatarFallback>
                              {member.display_name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm">{member.display_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {member.display_name}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={member.user_id === user?.id}
                                className="h-7 px-2 text-xs"
                              >
                                {member.role}{" "}
                                <ChevronDown className="ml-1 h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="w-[120px]"
                            >
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
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={member.user_id === user?.id}
                            className="h-7 px-2 text-xs text-destructive"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-medium">Invitations</h3>
                        <span className="text-xs text-muted-foreground">
                          ({selectedTeam.invitations.length})
                        </span>
                      </div>
                    </div>
                    {selectedTeam.invitations.map((invitation) => (
                      <div
                        key={invitation.id}
                        className="flex items-center justify-between py-1"
                      >
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7">
                            <AvatarFallback>
                              {invitation.email.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm">{invitation.email}</p>
                            <p className="text-xs text-muted-foreground">
                              {invitation.role}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs text-destructive"
                            onClick={() =>
                              handleRemoveInvitation(
                                selectedTeam.slug,
                                selectedTeam.id,
                                invitation.id
                              )
                            }
                          >
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
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="my-teams">My Teams</TabsTrigger>
                <TabsTrigger value="create">Create Team</TabsTrigger>
              </TabsList>
              <TabsContent value="my-teams" className="mt-4">
                <ScrollArea className="h-[300px]">
                  <div className="space-y-4">
                    {teams.map((team) => (
                      <div key={team.id} className="rounded-lg border p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{team.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {team.members.length} members
                            </p>
                            {team.is_current && (
                              <Badge>{team.is_current ? "Current" : ""}</Badge>
                            )}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedTeam(team)}
                          >
                            Manage
                          </Button>
                        </div>
                        <div className="mt-4">
                          <div className="flex -space-x-2">
                            {team.members.slice(0, 4).map((member, index) => (
                              <Avatar
                                key={index}
                                className="h-8 w-8 border-2 border-background"
                              >
                                <AvatarFallback>
                                  {member.display_name
                                    .slice(0, 2)
                                    .toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            ))}
                            {team.members.length > 4 && (
                              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-muted">
                                <span className="text-xs font-medium">
                                  +{team.members.length - 4}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
              <TabsContent value="create" className="mt-4">
                <form
                  className="grid gap-4"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const teamName = formData.get("team-name") as string;
                    await handleCreateTeam(teamName);
                    // Clear form and switch tab
                    (e.target as HTMLFormElement).reset();
                    setActiveTab("my-teams");
                  }}
                >
                  <div className="grid gap-2">
                    <Label htmlFor="team-name">Team Name</Label>
                    <Input
                      id="team-name"
                      name="team-name"
                      placeholder="Enter team name"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="team-guide">How team work?</Label>
                    <p className="text-sm text-muted-foreground">
                      Teams allow you to collaborate with others by sharing
                      access to projects, resources and settings. Create a team
                      to start inviting members and managing permissions
                      together.
                    </p>
                  </div>

                  <Button className="mt-4" type="submit">
                    Create Team
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        open={!!teamToDelete && !teamToDelete.is_current}
        onOpenChange={(open) => !open && setTeamToDelete(null)}
        title="Delete Team"
        description="Are you sure you want to delete this team? This action cannot be undone and all team data will be permanently lost."
        confirmText="Delete"
        variant="destructive"
        onConfirm={() => {
          if (teamToDelete) {
            handleDeleteTeam(teamToDelete.id);
          }
          setTeamToDelete(null);
        }}
      />
    </>
  );
}
