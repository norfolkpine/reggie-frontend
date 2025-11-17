'use client'

import { getTeams } from '@/api/teams'
import { api } from '@/lib/api-client'
import { handleApiError } from '@/lib/utils/handle-api-error'
import { teamStorage } from '@/lib/utils/team-storage'
import { useAuth } from '@/contexts/auth-context'
import { Team, TeamMember, TeamInvitation } from '@/types/api'
import ContentSection from '../components/content-section'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useToast } from '@/components/ui/use-toast'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { createTeam } from '@/api/teams'
import { Plus, UserPlus } from 'lucide-react'

export default function SettingsTeams() {
  const [activeTeam, setActiveTeam] = React.useState<Team | null>(() =>
    teamStorage.getActiveTeam()
  )
  const [teams, setTeams] = React.useState<Team[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false)
  const [isInviteModalOpen, setIsInviteModalOpen] = React.useState(false)
  const [isCreating, setIsCreating] = React.useState(false)
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()

  const { register, handleSubmit, reset, setValue, watch } = useForm()
  const createTeamForm = useForm({
    defaultValues: {
      name: ''
    }
  })

  // Use ref to track activeTeam ID to avoid circular dependencies
  const activeTeamIdRef = React.useRef<number | null>(activeTeam?.id || null)
  
  // Update ref when activeTeam changes
  React.useEffect(() => {
    activeTeamIdRef.current = activeTeam?.id || null
  }, [activeTeam])

  const fetchTeams = React.useCallback(async () => {
    if (!isAuthenticated) return
    setIsLoading(true)
    try {
      const teamList = await getTeams()
      setTeams(teamList.results)

      const currentActiveTeamId = activeTeamIdRef.current
      
      if (!currentActiveTeamId && teamList.results.length > 0) {
        // No active team set, set the first one
        const firstTeam = teamList.results[0]
        setActiveTeam(firstTeam)
        teamStorage.setActiveTeam(firstTeam)
        activeTeamIdRef.current = firstTeam.id
      } else if (currentActiveTeamId) {
        // Update activeTeam with fresh data from the API if it still exists
        const updatedTeam = teamList.results.find(team => team.id === currentActiveTeamId)
        if (updatedTeam) {
          // Always update with fresh data - ref prevents infinite loop
          setActiveTeam(updatedTeam)
          teamStorage.setActiveTeam(updatedTeam)
        }
      }
    } catch (err) {
      const { message } = handleApiError(err)
      if (message) {
        toast({
          title: message,
          description: 'Failed to fetch teams. Please try again.',
          variant: 'destructive',
        })
      }
    } finally {
      setIsLoading(false)
    }
  }, [toast, isAuthenticated])

  React.useEffect(() => {
    fetchTeams()
  }, [fetchTeams])

  React.useEffect(() => {
    teamStorage.setActiveTeam(activeTeam)
  }, [activeTeam])

  const onSubmit = async (data: any) => {
    if (!activeTeam) return
    
    try {
      console.log('Submitted Data:', data)
      const response = await api.post(`/a/${activeTeam.slug}/team/api/invitations/`, {
        team: activeTeam.id,
        email: data.email,
        role: data.role,
        is_accepted: false,
      })

      console.log('Invite sent:', response)
      toast({
        title: 'Success',
        description: 'Invitation sent successfully.',
      })
      reset()
      setIsInviteModalOpen(false)
      // Refresh teams to get updated invitations
      fetchTeams()
    } catch (err) {
      const { message } = handleApiError(err)
      toast({
        title: 'Error',
        description: message || 'Failed to send invitation. Please try again.',
        variant: 'destructive',
      })
      console.error('Failed to send invite:', err)
    }
  }

  const onCreateTeam = async (data: { name: string }) => {
    setIsCreating(true)
    try {
      const newTeam = await createTeam({
        name: data.name
      })

      toast({
        title: 'Success',
        description: 'Team created successfully.',
      })

      createTeamForm.reset()
      setIsCreateModalOpen(false)

      // Set the new team as active first
      setActiveTeam(newTeam)
      teamStorage.setActiveTeam(newTeam)
      activeTeamIdRef.current = newTeam.id

      // Refresh teams to include the new team
      fetchTeams()
    } catch (err) {
      const { message } = handleApiError(err)
      toast({
        title: 'Error',
        description: message || 'Failed to create team. Please try again.',
        variant: 'destructive',
      })
      console.error('Failed to create team:', err)
    } finally {
      setIsCreating(false)
    }
  }


  // Get current team's members and invitations from the team data
  const currentMembers = activeTeam?.members || []
  const currentInvitations = activeTeam?.invitations || []

  const handleDelete = async (invitationId: string) => {
    if (!activeTeam) return
    
    try {
      await api.delete(`/a/${activeTeam.slug}/team/api/invitations/${invitationId}/`)
      
      toast({
        title: 'Success',
        description: 'Invitation deleted successfully.',
      })
      
      // Refresh teams to get updated data
      fetchTeams()
    } catch (err) {
      const { message } = handleApiError(err)
      toast({
        title: 'Error',
        description: message || 'Failed to delete invitation. Please try again.',
        variant: 'destructive',
      })
      console.error('Error deleting invitation:', err)
    }
  }

  const role = watch('role')

  return (
    <ContentSection title='Team Settings' desc='Manage your teams' 
    actions={
      <div className='flex items-center gap-2'>
        <Button
          onClick={() => setIsInviteModalOpen(true)}
          variant='outline'
          disabled={!activeTeam}
        >
          <UserPlus className='mr-2 h-4 w-4' />
          Invite Member
        </Button>
      </div>
    }>
      <div className='space-y-6'>

       

        {/* Member Management - Only shown when team is selected */}
        <div className='space-y-6 mt-8'>
            <div className='flex flex-row justify-between items-center'>
            <div>
              <h2 className='text-xl font-semibold'>Members</h2>
              <p className='text-sm text-gray-600'>Manage team members and invitations</p>
            </div>
             {/* Team Selector */}
             <Select
              value={activeTeam?.id?.toString() || ''}
              onValueChange={(value) => {
                if (value === 'create-new-team') {
                  setIsCreateModalOpen(true)
                } else {
                  const selectedTeam = teams.find(team => team.id.toString() === value)
                  if (selectedTeam) {
                    setActiveTeam(selectedTeam)
                    teamStorage.setActiveTeam(selectedTeam)
                    activeTeamIdRef.current = selectedTeam.id
                  }
                }
              }}
            >
              <SelectTrigger id='team-select' className='w-[300px]'>
                <SelectValue placeholder='Select a team' />
              </SelectTrigger>
              <SelectContent>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={team.id.toString()}>
                    {team.name}
                  </SelectItem>
                ))}
                <SelectItem value='create-new-team' className='text-primary'>
                  <div className='flex items-center'>
                    <Plus className='mr-2 h-4 w-4' />
                    Create New Team
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
              </div>


            {/* Members and Invitations Table */}
            <Card>
              <CardHeader>
                <CardTitle>Team Members & Invitations</CardTitle>
              </CardHeader>
              <CardContent>
                {currentMembers.length === 0 && currentInvitations.length === 0 ? (
                  <p className='text-center text-gray-500 py-8'>No members or pending invitations.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name/Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* Active Members */}
                      {currentMembers.map((member) => (
                        <TableRow key={`member-${member.id}`}>
                          <TableCell className='font-medium'>
                            {member.display_name || `${member.first_name} ${member.last_name}`.trim()}
                          </TableCell>
                          <TableCell>
                            <span className='px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full'>
                              {member.role}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className='text-green-600 font-medium'>Active</span>
                          </TableCell>
                          <TableCell>
                            <span className='text-gray-400 text-sm'>Member</span>
                          </TableCell>
                        </TableRow>
                      ))}
                      {/* Pending Invitations */}
                      {currentInvitations.map((invitation) => (
                        <TableRow key={`invitation-${invitation.id}`} className='bg-yellow-50 dark:bg-yellow-900/20'>
                          <TableCell className='font-medium'>{invitation.email}</TableCell>
                          <TableCell>
                            <span className='px-2 py-1 text-xs bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300 rounded-full'>
                              {invitation.role}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className={`font-medium ${
                              invitation.is_accepted 
                                ? 'text-green-600 dark:text-green-400' 
                                : 'text-yellow-600 dark:text-yellow-400'
                            }`}>
                              {invitation.is_accepted ? 'Accepted' : 'Pending'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant='destructive'
                              size='sm'
                              onClick={() => handleDelete(invitation.id)}
                            >
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>

        {/* Empty State when no team selected */}
        {!activeTeam && teams.length > 0 && (
          <Card className='mt-8'>
            <CardContent className='p-12 text-center'>
              <div className='text-gray-400 mb-4'>
                <svg className='mx-auto h-12 w-12' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1} d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' />
                </svg>
              </div>
              <h3 className='text-lg font-medium text-gray-900 mb-2'>No Team Selected</h3>
              <p className='text-gray-500'>Select a team from above to view and manage its members.</p>
            </CardContent>
          </Card>
        )}

        {/* Invite Member Modal */}
        <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
          <DialogContent className='sm:max-w-[425px]'>
            <DialogHeader>
              <DialogTitle>Invite New Member</DialogTitle>
              <DialogDescription>
                Send an invitation to add a new member to your team.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className='grid gap-4 py-4'>
                <div className='grid grid-cols-4 items-center gap-4'>
                  <Label htmlFor='email' className='text-right'>
                    Email
                  </Label>
                  <Input
                    id='email'
                    placeholder='Email address'
                    {...register('email', { required: 'Email is required' })}
                    className='col-span-3'
                  />
                </div>
                <div className='grid grid-cols-4 items-center gap-4'>
                  <Label htmlFor='role' className='text-right'>
                    Role
                  </Label>
                  <Select
                    value={role || ''}
                    onValueChange={(value) => setValue('role', value)}
                  >
                    <SelectTrigger className='col-span-3'>
                      <SelectValue placeholder='Select role' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='member'>Member</SelectItem>
                      <SelectItem value='admin'>Admin</SelectItem>
                      <SelectItem value='owner'>Owner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setIsInviteModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type='submit'>Send Invitation</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Create Team Modal */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent className='sm:max-w-[425px]'>
            <DialogHeader>
              <DialogTitle>Create New Team</DialogTitle>
              <DialogDescription>
                Create a new team to organize your projects and collaborators.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={createTeamForm.handleSubmit(onCreateTeam)}>
              <div className='grid gap-4 py-4'>
                <div className='grid grid-cols-4 items-center gap-4'>
                  <Label htmlFor='name' className='text-right'>
                    Name
                  </Label>
                  <Input
                    id='name'
                    {...createTeamForm.register('name', { required: 'Team name is required' })}
                    className='col-span-3'
                    placeholder='Enter team name'
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type='submit' disabled={isCreating}>
                  {isCreating ? 'Creating...' : 'Create Team'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </ContentSection>
  )
}