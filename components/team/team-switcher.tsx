"use client";

import * as React from "react";
import { ChevronsUpDown, LogIn, UserPlus } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { ProfileDialog } from "@/components/profile-dialog";
import { BillingDialog } from "@/components/billing-dialog";
import { TeamDialog } from "@/components/team/team-dialog";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { getTeams } from "@/api/teams";
import { handleApiError } from "@/lib/utils/handle-api-error";
import { Team } from "@/types/api";
import { teamStorage } from "@/lib/utils/team-storage";
import { useToast } from "../ui/use-toast";
import { TeamList } from "./team-list";
import { UserMenu } from "./user-menu";
import { UserInfo } from "./user-info";
import { MenuItem } from "@/types/menu";

const MENU_ITEMS: MenuItem[] = [
  { key: "profile", label: "Profile", shortcut: "⇧⌘P" },
  { key: "billing", label: "Billing", shortcut: "⌘B" },
  { key: "settings", label: "Settings", shortcut: "⌘S" },
  { key: "team", label: "Teams", shortcut: "⌘T" },
];

interface TeamSwitcherProps {
  isCollapsed?: boolean;
}

export function TeamSwitcher({ isCollapsed = false }: TeamSwitcherProps) {
  const [activeTeam, setActiveTeam] = React.useState<Team | null>(() =>
    teamStorage.getActiveTeam()
  );
  const [showTeamList, setShowTeamList] = React.useState(false);
  const [teams, setTeams] = React.useState<Team[]>([]);
  const [dialogStates, setDialogStates] = React.useState({
    profile: false,
    billing: false,
    team: false,
    logoutConfirm: false,
  });

  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const setDialogState = React.useCallback(
    (key: keyof typeof dialogStates) => (value: boolean) => {
      setDialogStates((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const fetchTeams = React.useCallback(async () => {
    if(!isAuthenticated) return
    try {
      const teamList = await getTeams();
      setTeams(teamList.results);

      if (!activeTeam && teamList.results.length > 0) {
        const firstTeam = teamList.results[0];
        setActiveTeam(firstTeam);
        teamStorage.setActiveTeam(firstTeam);
      }
    } catch (err) {
      const { message } = handleApiError(err);
      if (message) {
        toast({
          title: message,
          description: "Failed to fetch teams. Please try again.",
          variant: "destructive",
        });
      }
    }
  }, [activeTeam, toast]);

  React.useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  React.useEffect(() => {
    if (showTeamList) {
      fetchTeams();
    }
  }, [showTeamList, fetchTeams]);

  React.useEffect(() => {
    teamStorage.setActiveTeam(activeTeam);
  }, [activeTeam]);

  const handleLogout = React.useCallback(async () => {
    await logout();
    router.push("/sign-in");
  }, [logout, router]);

  const handleTeamSelect = React.useCallback((team: Team) => {
    setActiveTeam(team);
    teamStorage.setActiveTeam(team);
    setShowTeamList(false);
  }, []);

  const handleMenuItemSelect = React.useCallback(
    (key: string) => {
      switch (key) {
        case 'profile':
          router.push('/settings/profile');
          break;
        case 'billing':
          router.push('/settings/billing');
          break;
        case 'settings':
          router.push('/settings');
          break;
        case 'team':
          router.push('/settings/organizations');
          break;
        default:
          setDialogState(key as keyof typeof dialogStates)(true);
      }
    },
    [setDialogState, router]
  );

  const renderDialogs = React.useCallback(
    () => (
      <>
        <ProfileDialog
          open={dialogStates.profile}
          onOpenChange={setDialogState("profile")}
        />
        <BillingDialog
          open={dialogStates.billing}
          onOpenChange={setDialogState("billing")}
        />
        <TeamDialog
          open={dialogStates.team}
          onOpenChange={setDialogState("team")}
        />
        <ConfirmationDialog
          open={dialogStates.logoutConfirm}
          onOpenChange={setDialogState("logoutConfirm")}
          title="Confirm Logout"
          description="Are you sure you want to log out? You'll need to sign in again to access your account."
          confirmText="Log out"
          variant="destructive"
          onConfirm={handleLogout}
        />
      </>
    ),
    [dialogStates, setDialogState, handleLogout]
  );

  if (!user) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3 px-2 py-1.5">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary/10 text-primary">
              R
            </AvatarFallback>
          </Avatar>
          <div className="grid flex-1">
            <span className="font-medium text-sm">Reggie</span>
            <span className="text-xs text-muted-foreground">
              Team Collaboration
            </span>
          </div>
        </div>
        <div className="px-2 space-y-1">
          <Button
            variant="default"
            className="w-full justify-start h-9"
            onClick={() => router.push("/sign-in")}
          >
            <div className="flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center">
                <LogIn className="h-4 w-4 mr-2" />
              </div>
              <span className="text-sm">Sign in</span>
            </div>
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start h-9"
            onClick={() => router.push("/sign-up")}
          >
            <div className="flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center">
                <UserPlus className="h-4 w-4 mr-2" />
              </div>
              <span className="text-sm">Create account</span>
            </div>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {isCollapsed ? (
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10">
              {activeTeam?.name.charAt(0).toUpperCase()}
            </div>
          </Button>
        ) : (
          <Button variant="ghost" className="w-full justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10">
                {activeTeam?.name.charAt(0).toUpperCase()}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="font-semibold truncate">
                  {activeTeam?.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {activeTeam?.subscription?.display_name ?? "Free Plan"}
                </span>
              </div>
            </div>
            <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={isCollapsed ? "center" : "end"}
        side={isCollapsed ? "right" : "bottom"}
        className="w-64"
      >
        <div className="sticky top-0 bg-popover z-10">
          <UserInfo user={user} />
          <DropdownMenuSeparator />
        </div>
        <div className="h-[300px] overflow-y-auto">
          <DropdownMenuItem
            className="py-2"
            onSelect={(e) => {
              e.preventDefault();
              setShowTeamList(!showTeamList);
            }}
          >
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 w-full"
            >
              <span className="text-sm">{showTeamList ? 'Back' : 'Switch Team'}</span>
            </Button>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {showTeamList ? (
            <TeamList
              teams={teams}
              activeTeam={activeTeam}
              onTeamSelect={handleTeamSelect}
              onBack={() => setShowTeamList(false)}
            />
          ) : (
            <UserMenu
              menuItems={MENU_ITEMS}
              onItemSelect={handleMenuItemSelect}
              onLogout={() => setDialogState("logoutConfirm")(true)}
            />
          )}
        </div>
      </DropdownMenuContent>
      {renderDialogs()}
    </DropdownMenu>
  );
}
