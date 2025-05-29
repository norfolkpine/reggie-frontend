'use client';

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
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { SettingsDialog } from '@/components/settings-dialog'
import { useState } from 'react'
import { ProfileDialog } from '@/components/profile-dialog'
// Add this import at the top with other imports
import { BillingDialog } from '@/components/billing-dialog'
// Add to imports
import { TeamDialog } from '@/components/team/team-dialog'
// Add to imports
import { ConfirmationDialog } from '@/components/confirmation-dialog'

export function ProfileDropdown() {
  // Add this state
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [showTeam, setShowTeam] = useState(false)
  const [showBilling, setShowBilling] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showProfile, setShowProfile] = useState(false)  // Add this line
  const { user, logout, isAuthenticated } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.push('/sign-in')
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="ghost" asChild>
          <Link href="/sign-in">Sign in</Link>
        </Button>
        <Button asChild>
          <Link href="/sign-up">Sign up</Link>
        </Button>
      </div>
    )
  }

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true)
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='relative h-8 w-8 rounded-full'>
          <Avatar className='h-8 w-8'>
            <AvatarImage src={user?.avatar_url} alt={user?.get_display_name || 'User'} />
            <AvatarFallback>{user?.get_display_name?.slice(0, 2).toUpperCase() || 'U'}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-56' align='end' forceMount>
        <DropdownMenuLabel className='font-normal'>
          <div className='flex flex-col space-y-1'>
            <p className='text-sm font-medium leading-none'>{user?.get_display_name}</p>
            <p className='text-xs leading-none text-muted-foreground'>
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onSelect={(e) => {
            e.preventDefault()
            setShowProfile(true)
          }}>
            Profile
            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={(e) => {
            e.preventDefault()
            setShowBilling(true)
          }}>
            Billing
            <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={(e) => {
            e.preventDefault()
            setShowSettings(true)
          }}>
            Settings
            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={(e) => {
            e.preventDefault()
            setShowTeam(true)
          }}>
            Teams
            <DropdownMenuShortcut>⌘T</DropdownMenuShortcut>
          </DropdownMenuItem>
          <ProfileDialog open={showProfile} onOpenChange={setShowProfile} />
          <SettingsDialog open={showSettings} onOpenChange={setShowSettings} />
          <BillingDialog open={showBilling} onOpenChange={setShowBilling} />
          <TeamDialog open={showTeam} onOpenChange={setShowTeam} />
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogoutClick}>
          Log out
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
      <ConfirmationDialog
        open={showLogoutConfirm}
        onOpenChange={setShowLogoutConfirm}
        title="Confirm Logout"
        description="Are you sure you want to log out? You'll need to sign in again to access your account."
        confirmText="Log out"
        variant="destructive"
        onConfirm={handleLogout}
      />
    </DropdownMenu>
  )
}
