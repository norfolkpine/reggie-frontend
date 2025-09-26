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
// Tabs removed - using unified layout instead
import { useToast } from '@/components/ui/use-toast'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'

export default function SettingsTeams() {
  const [activeTeam, setActiveTeam] = React.useState<Team | null>(() =>
    teamStorage.getActiveTeam()
  )
  const [teams, setTeams] = React.useState<Team[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()

  const { register, handleSubmit, reset, setValue, watch } = useForm()

  const fetchTeams = React.useCallback(async () => {
    if (!isAuthenticated) return
    setIsLoading(true)
    try {
      const teamList = await getTeams()
      setTeams(teamList.results)

      if (!activeTeam && teamList.results.length > 0) {
        const firstTeam = teamList.results[0]
        setActiveTeam(firstTeam)
        teamStorage.setActiveTeam(firstTeam)
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
  }, [activeTeam, toast, isAuthenticated])

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

  // Get current team's members and invitations from the team data
  const currentMembers = activeTeam?.members || []
  const currentInvitations = activeTeam?.invitations || []

  const handleDelete = async (invitationId: string) => {
    if (!activeTeam) return
    
    try {
      await api.delete(`/a/${activeTeam.slug}/team/api/invitations/${invitationId}`)
      
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
    <ContentSection title='Team Settings' desc='Manage your teams'>
      <>
        {teams.length > 1 && (
          <Card className='mb-4'>
            <CardHeader>
              <CardTitle>Select Team</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={activeTeam?.id?.toString() || ''}
                onValueChange={(value) => {
                  const selectedTeam = teams.find(team => team.id.toString() === value)
                  if (selectedTeam) {
                    setActiveTeam(selectedTeam)
                    teamStorage.setActiveTeam(selectedTeam)
                  }
                }}
              >
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='Select a team' />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id.toString()}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        )}
        {/* Two-column layout: Teams on left, Member management on right */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {/* Left Column - Teams List */}
          <div className='space-y-4'>
            <div>
              <h2 className='text-xl font-semibold'>Teams</h2>
              <p className='text-sm text-gray-600'>Select a team to manage its members</p>
            </div>
            
            <div className='space-y-3'>
              {isLoading ? (
                <Card>
                  <CardContent className='p-6'>
                    <p className='text-center text-gray-500'>Loading teams...</p>
                  </CardContent>
                </Card>
              ) : teams.length === 0 ? (
                <Card>
                  <CardContent className='p-6'>
                    <p className='text-center text-gray-500'>No teams found.</p>
                  </CardContent>
                </Card>
              ) : (
                teams.map((team) => (
                  <Card 
                    key={team.id} 
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      activeTeam?.id === team.id 
                        ? 'ring-2 ring-blue-500 bg-blue-50' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      setActiveTeam(team)
                      teamStorage.setActiveTeam(team)
                    }}
                  >
                    <CardHeader className='pb-3'>
                      <div className='flex items-center justify-between'>
                        <div>
                          <CardTitle className='flex items-center gap-2 text-lg'>
                            {team.name}
                            {team.is_admin && (
                              <span className='px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full'>
                                Admin
                              </span>
                            )}
                            {activeTeam?.id === team.id && (
                              <span className='px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full'>
                                Selected
                              </span>
                            )}
                          </CardTitle>
                          <p className='text-sm text-gray-600'>/{team.slug}</p>
                        </div>
                        <div className='text-right'>
                          {team.has_active_subscription ? (
                            <span className='px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full'>
                              Active
                            </span>
                          ) : (
                            <span className='px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full'>
                              Inactive
                            </span>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className='pt-0'>
                      <div className='grid grid-cols-2 gap-3 mb-3'>
                        <div className='text-center p-2 bg-blue-50 rounded-lg'>
                          <p className='text-lg font-bold text-blue-600'>{team.members?.length || 0}</p>
                          <p className='text-xs text-gray-600'>Members</p>
                        </div>
                        <div className='text-center p-2 bg-yellow-50 rounded-lg'>
                          <p className='text-lg font-bold text-yellow-600'>{team.invitations?.length || 0}</p>
                          <p className='text-xs text-gray-600'>Invitations</p>
                        </div>
                      </div>
                      
                      {team.subscription && (
                        <div className='mt-3 p-3 bg-gray-50 rounded-lg'>
                          <div className='flex justify-between items-center'>
                            <div>
                              <p className='text-sm font-medium'>{team.subscription.display_name}</p>
                              <p className='text-xs text-gray-600 capitalize'>{team.subscription.status}</p>
                            </div>
                            <div className='text-right'>
                              <p className='text-xs text-gray-600'>Billing: {team.subscription.billing_interval}</p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Right Column - Member Management */}
          <div className='space-y-4'>
            <div>
              <h2 className='text-xl font-semibold'>
                {activeTeam ? `${activeTeam.name} Members` : 'Select a Team'}
              </h2>
              <p className='text-sm text-gray-600'>
                {activeTeam ? 'Manage team members and invitations' : 'Choose a team from the left to manage its members'}
              </p>
            </div>

            {activeTeam ? (
              <>
                {/* Invite Form */}
                <Card>
                  <CardHeader>
                    <CardTitle>Invite New Member</CardTitle>
                  </CardHeader>
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <CardContent>
                      <div className='space-y-4'>
                        <Input
                          placeholder='Email address'
                          {...register('email', { required: 'Email is required' })}
                        />
                        <Select
                          value={role || ''}
                          onValueChange={(value) => setValue('role', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder='Select role' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='member'>Member</SelectItem>
                            <SelectItem value='admin'>Admin</SelectItem>
                            <SelectItem value='owner'>Owner</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button type='submit' className='w-full'>Send Invitation</Button>
                      </div>
                    </CardContent>
                  </form>
                </Card>

                {/* Members and Invitations */}
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
                            <TableRow key={`invitation-${invitation.id}`} className='bg-yellow-50'>
                              <TableCell className='font-medium'>{invitation.email}</TableCell>
                              <TableCell>
                                <span className='px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full'>
                                  {invitation.role}
                                </span>
                              </TableCell>
                              <TableCell>
                                <span className={`font-medium ${
                                  invitation.is_accepted ? 'text-green-600' : 'text-yellow-600'
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
              </>
            ) : (
              <Card>
                <CardContent className='p-12 text-center'>
                  <div className='text-gray-400 mb-4'>
                    <svg className='mx-auto h-12 w-12' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1} d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' />
                    </svg>
                  </div>
                  <h3 className='text-lg font-medium text-gray-900 mb-2'>No Team Selected</h3>
                  <p className='text-gray-500'>Select a team from the left panel to view and manage its members.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </>
    </ContentSection>
  )
}