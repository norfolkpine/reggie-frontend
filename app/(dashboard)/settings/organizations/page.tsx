'use client'

import ContentSection from '../components/content-section'
import { Tabs, TabsContent } from '@radix-ui/react-tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import { getTeams } from '@/api/teams'
import { handleApiError } from '@/lib/utils/handle-api-error'
import { Team } from '@/types/api'
import { teamStorage } from '@/lib/utils/team-storage'
import { useToast } from '@/components/ui/use-toast'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useState } from 'react'
import React from 'react'
import { useForm } from 'react-hook-form'

interface Invitation {
  id: string
  team: number
  email: string
  role: string
  invited_by: string
  is_accepted: boolean
}

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000'

export default function SettingsTeams() {
  const [activeTeam, setActiveTeam] = React.useState<Team | null>(() =>
    teamStorage.getActiveTeam()
  )
  const [teams, setTeams] = React.useState<Team[]>([])
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()

  const { register, handleSubmit, reset, setValue, watch } = useForm()

  const fetchTeams = React.useCallback(async () => {
    if (!isAuthenticated) return
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
    }
  }, [activeTeam, toast, isAuthenticated])

  React.useEffect(() => {
    fetchTeams()
  }, [fetchTeams])

  React.useEffect(() => {
    teamStorage.setActiveTeam(activeTeam)
  }, [activeTeam])

  const onSubmit = async (data: any) => {
    try {
      console.log('Submitted Data:', data)
      const response = await fetch(
          `${apiBaseUrl}/a/${activeTeam?.slug}/team/api/invitations/`,
          {
            method: 'POST',
            body: JSON.stringify({
              team: activeTeam?.id,
            email: data.email,
            role: data.role,
            is_accepted: false,
          }),
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log('Invite sent:', result)
      reset()
    } catch (error) {
      console.error('Failed to send invite:', error)
    }
  }

  const [allInvitations, setAllInvitations] = useState<Invitation[]>([])
  const token = localStorage.getItem('accessToken')

  React.useEffect(() => {
    const fetchInvitations = async () => {
      try {
        const response = await fetch(
          `${apiBaseUrl}/a/${activeTeam?.slug}/team/api/invitations/`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        )
        const data = await response.json()

        const invitations = data.results

        if (invitations?.length > 0) {
          setAllInvitations(invitations)
        } else {
          setAllInvitations([])
        }
      } catch (error) {
        console.error('Error fetching members:', error)
      }
    }

    fetchInvitations()
  }, [activeTeam?.slug, token, activeTeam])

  const handleDelete = async (invitationId: string) => {
    try {
      await fetch(
        `${apiBaseUrl}/a/${activeTeam?.slug}/team/api/invitations/${invitationId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      )
    } catch (error) {
      console.error('Error deleting member:', error)
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
        <Tabs orientation='vertical' defaultValue='members' className='space-y-4'>
        <div className='w-full overflow-x-auto pb-2'>
          <TabsList defaultValue='members'>
            <TabsTrigger value='members'>Members</TabsTrigger>
            <TabsTrigger value='general'>General</TabsTrigger>
            <TabsTrigger value='subscription'>Subscription</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value='members' className='space-y-4'>
          <div>
            <p className='text-xl'>Members</p>
            <p className='text-md'>View and manage organization members</p>
          </div>
          <Card className='mb-4'>
            <CardHeader>
              <CardTitle>Invite new Member</CardTitle>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
              <CardContent>
                <div className='w-full grid grid-cols-1 md:grid-cols-4 gap-4'>
                  <Input
                    placeholder='Email'
                    {...register('email', { required: 'Email is required' })}
                  />

                  <Select
                    value={role || ''}
                    onValueChange={(value) => setValue('role', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Role' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='member'>Member</SelectItem>
                      <SelectItem value='admin'>Admin</SelectItem>
                      <SelectItem value='owner'>Owner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className='mt-4'>
                  <Button type='submit'>Invite</Button>
                </div>
              </CardContent>
            </form>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Members</CardTitle>
            </CardHeader>
            <CardContent>
              {allInvitations?.length === 0 ? (
                <p className='text-center'>There are currently no members.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Invitation Accepted</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allInvitations?.map((member, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{member.email}</TableCell>
                        <TableCell>{member.role}</TableCell>
                        <TableCell>
                          <p
                            className={
                              member.is_accepted
                                ? 'text-green-500'
                                : 'text-gray-500'
                            }
                          >
                            {member.is_accepted ? 'Accepted' : 'Pending'}
                          </p>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant='destructive'
                            size='sm'
                            onClick={() => handleDelete(member.id)}
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
        </TabsContent>
        <TabsContent value='general'></TabsContent>
        <TabsContent value='subscription'></TabsContent>
        </Tabs>
      </>
    </ContentSection>
  )
}