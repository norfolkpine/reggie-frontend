"use client"

import * as React from "react"
import { ChevronsUpDown, LogIn, UserPlus } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { SettingsDialog } from '@/components/settings-dialog'
import { ProfileDialog } from '@/components/profile-dialog'
import { BillingDialog } from '@/components/billing-dialog'
import { TeamDialog } from '@/components/team-dialog'
import { ConfirmationDialog } from '@/components/confirmation-dialog'
import { IconSwitch, IconSwitch2 } from "@tabler/icons-react"

interface Team {
  name: string
  logo: string
  plan: string
}

const teams: Team[] = [
  {
    name: "Acme Inc",
    logo: "🏢",
    plan: "Pro Plan",
  },
  {
    name: "Personal",
    logo: "👤",
    plan: "Free Plan",
  },
  {
    name: "Startup Co",
    logo: "🚀",
    plan: "Team Plan",
  },
]

const MENU_ITEMS = [
  { key: 'profile', label: 'Profile', shortcut: '⇧⌘P' },
  { key: 'billing', label: 'Billing', shortcut: '⌘B' },
  { key: 'settings', label: 'Settings', shortcut: '⌘S' },
  { key: 'team', label: 'Teams', shortcut: '⌘T' },
] as const

const useDialogStates = () => {
  const [states, setStates] = React.useState({
    profile: false,
    billing: false,
    settings: false,
    team: false,
    logoutConfirm: false,
  })

  const setDialogState = (key: keyof typeof states) => (value: boolean) => {
    setStates(prev => ({ ...prev, [key]: value }))
  }

  return { states, setDialogState }
}

interface TeamSwitcherProps {
  isCollapsed?: boolean
}

export function TeamSwitcher({ isCollapsed = false }: TeamSwitcherProps) {
  const [activeTeam, setActiveTeam] = React.useState<Team>(teams[0])
  const [showTeamList, setShowTeamList] = React.useState(false)
  const { states, setDialogState } = useDialogStates()
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = React.useCallback(async () => {
    await logout()
    router.push('/sign-in')
  }, [logout, router])

  const renderDialogs = () => (
    <>
      <ProfileDialog open={states.profile} onOpenChange={setDialogState('profile')} />
      <SettingsDialog open={states.settings} onOpenChange={setDialogState('settings')} />
      <BillingDialog open={states.billing} onOpenChange={setDialogState('billing')} />
      <TeamDialog open={states.team} onOpenChange={setDialogState('team')} />
      <ConfirmationDialog
        open={states.logoutConfirm}
        onOpenChange={setDialogState('logoutConfirm')}
        title="Confirm Logout"
        description="Are you sure you want to log out? You'll need to sign in again to access your account."
        confirmText="Log out"
        variant="destructive"
        onConfirm={handleLogout}
      />
    </>
  )

  const renderMenuItems = () => (
    <DropdownMenuGroup>
      {MENU_ITEMS.map(({ key, label, shortcut }) => (
        <DropdownMenuItem
          key={key}
          onSelect={(e) => {
            e.preventDefault()
            setDialogState(key)(true)
          }}
          className="py-2"
        >
          {label}
          <DropdownMenuShortcut>{shortcut}</DropdownMenuShortcut>
        </DropdownMenuItem>
      ))}
    </DropdownMenuGroup>
  )

  const renderUserInfo = () => (
    <DropdownMenuLabel className='font-normal p-4'>
      <div className='flex flex-col space-y-1'>
        <p className='text-sm font-medium leading-none'>{user?.get_display_name}</p>
        <p className='text-xs leading-none text-muted-foreground'>{user?.email}</p>
      </div>
    </DropdownMenuLabel>
  )

  const renderTeamList = () => (
    <>
      <DropdownMenuItem
        className="py-2"
        onSelect={(e) => {
          e.preventDefault()
          setShowTeamList(false)
        }}
      >
        <Button variant='outline' size='sm' className="flex items-center gap-2 w-full">
          <span className="text-sm">← Back</span>
        </Button>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      {teams.map((team) => (
        <DropdownMenuItem
          key={team.name}
          className="py-2"
          onSelect={() => {
            setActiveTeam(team)
            setShowTeamList(false)
          }}
        >
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10">
              {team.logo}
            </div>
            <div className="grid flex-1">
              <span className="font-medium">{team.name}</span>
              <span className="text-xs text-muted-foreground">{team.plan}</span>
            </div>
            {activeTeam.name === team.name && (
              <span className="ml-auto text-primary">✓</span>
            )}
          </div>
        </DropdownMenuItem>
      ))}
    </>
  )

  if (!user) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3 px-2 py-1.5">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary/10 text-primary">R</AvatarFallback>
          </Avatar>
          <div className="grid flex-1">
            <span className="font-medium text-sm">Reggie</span>
            <span className="text-xs text-muted-foreground">Team Collaboration</span>
          </div>
        </div>
        <div className="px-2 space-y-1">
          <Button
            variant="default"
            className="w-full justify-start h-9"
            onClick={() => router.push('/sign-in')}
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
            onClick={() => router.push('/sign-up')}
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
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {isCollapsed ? (
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-primary/10 text-primary text-xs">
              {activeTeam.logo}
            </div>
          </Button>
        ) : (
          <Button variant="ghost" className="w-full justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary">
                {activeTeam.logo}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="font-semibold">{activeTeam.name}</span>
                <span className="text-xs text-muted-foreground">{activeTeam.plan}</span>
              </div>
            </div>
            <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align={isCollapsed ? "center" : "end"} side={isCollapsed ? "right" : "bottom"} className="w-64">
        {renderUserInfo()}
        <DropdownMenuSeparator />
        {showTeamList ? (
          renderTeamList()
        ) : (
          <>
            <DropdownMenuItem
              className="py-2"
              onSelect={(e) => {
                e.preventDefault()
                setShowTeamList(true)
              }}
            >
               <Button variant='outline' size='sm' className="flex items-center gap-2 w-full">
          <span className="text-sm">Switch Team</span>
        </Button>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {renderMenuItems()}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="py-2" onClick={() => setDialogState('logoutConfirm')(true)}>
              Log out
              <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="cursor-pointer focus:bg-accent focus:text-accent-foreground hover:bg-accent hover:text-accent-foreground p-3" 
              onSelect={() => router.push('/pricing')}
            >
              <div className="flex flex-col">
                <span className="font-medium">Upgrade to Premium</span>
                <span className="text-xs text-muted-foreground">Get more features and benefits</span>
              </div>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
      {renderDialogs()}
    </DropdownMenu>
  )
}

