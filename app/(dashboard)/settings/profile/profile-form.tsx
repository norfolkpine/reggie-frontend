'use client'

import { z } from 'zod'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { Button } from '@/components/custom/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '@/contexts/auth-context'
import { updateAllauthUser, getProviderAccounts, disconnectProviderAccount, redirectToProvider, ProviderAccount } from '@/api/auth'
import { AllauthUserUpdate } from '@/types/api'
import { IconBrandGoogle } from '@tabler/icons-react'

const profileFormSchema = z.object({
  first_name: z
    .string()
    .min(1, {
      message: 'First name is required.',
    })
    .max(30, {
      message: 'First name must not be longer than 30 characters.',
    })
    .optional(),
  last_name: z
    .string()
    .max(30, {
      message: 'Last name must not be longer than 30 characters.',
    })
    .optional(),
  username: z
    .string()
    .min(2, {
      message: 'Username must be at least 2 characters.',
    })
    .max(30, {
      message: 'Username must not be longer than 30 characters.',
    })
    .optional(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

export default function ProfileForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const [providers, setProviders] = useState<ProviderAccount[] | null>(null)
  const [loadingProviders, setLoadingProviders] = useState(false)

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    mode: 'onChange',
  })

  // Initialize form with auth context user data
  useEffect(() => {
    if (user) {
      form.reset({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        username: '',
      })
    }
  }, [user, form])

  // Load connected provider accounts
  useEffect(() => {
    async function fetchProviders() {
      try {
        setLoadingProviders(true)
        const resp = await getProviderAccounts()
        setProviders(resp.data || [])
      } catch (e) {
        console.error('Failed to load connected accounts', e)
      } finally {
        setLoadingProviders(false)
      }
    }
    fetchProviders()
  }, [])

  function onConnectGoogle() {
    // Start provider connect flow; callback same as login callback path
    redirectToProvider('google', '/account/provider/callback', 'connect')
  }

  async function onDisconnectGoogle(acc: ProviderAccount) {
    try {
      await disconnectProviderAccount('google', acc.uid)
      setProviders((prev) => (prev || []).filter(p => !(p.provider.id === 'google' && p.uid === acc.uid)))
      toast({ title: 'Disconnected', description: 'Google account disconnected.' })
    } catch (e) {
      console.error('Failed to disconnect Google', e)
      toast({ title: 'Error', description: 'Failed to disconnect Google.', variant: 'destructive' })
    }
  }

  async function onSubmit(data: ProfileFormValues) {
    try {
      setIsSubmitting(true)
      setError(null)
      
      const updateData: AllauthUserUpdate = {
        first_name: data.first_name,
        last_name: data.last_name,
        username: data.username,
      }
      
      await updateAllauthUser(updateData)
      
      toast({
        title: 'Profile updated successfully',
        description: 'Your profile information has been saved.',
      })
    } catch (err) {
      console.error('Failed to update profile:', err)
      setError('Failed to update profile. Please try again.')
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) {
    return (
      <div className='flex items-center justify-center p-8'>
        <div className='text-center'>
          <p>Please log in to view your profile.</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='p-4 border border-red-200 rounded-md bg-red-50'>
        <p className='text-red-800'>{error}</p>
        <Button 
          onClick={() => setError(null)} 
          variant='outline' 
          className='mt-2'
        >
          Dismiss
        </Button>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        <div className='space-y-4'>
          <div className='text-sm text-gray-600'>
            <strong>Email:</strong> {user?.email || 'Not available'}
          </div>
          <div className='mt-6'>
            <div className='font-medium mb-2'>Connected accounts</div>
            <div className='border rounded-md p-3 space-y-2'>
              <div className='flex items-center justify-between'>
                <div>
                  <div className='flex items-center gap-2'>
                    <IconBrandGoogle className='h-4 w-4' />
                    <div className='text-sm font-medium'>Google</div>
                  </div>
                  <div className='text-xs text-gray-500'>Use Google to sign in</div>
                </div>
                <div>
                  {loadingProviders
                    ? <span className='text-sm text-gray-500'>Loading…</span>
                    : (() => {
                        const googleAcc = (providers || []).find(p => p.provider.id === 'google')
                        if (googleAcc) {
                          return (
                            <div className='flex items-center gap-3'>
                              <span className='text-sm text-gray-600'>{googleAcc.display}</span>
                              <Button type='button' variant='outline' onClick={() => onDisconnectGoogle(googleAcc)}>
                                Disconnect
                              </Button>
                            </div>
                          )
                        }
                        return (
                          <Button type='button' onClick={onConnectGoogle}>
                            Connect
                          </Button>
                        )
                      })()
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <FormField
          control={form.control}
          name='first_name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input 
                  placeholder='Enter your first name' 
                  disabled={isSubmitting}
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Your first name as it will appear on your profile.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name='last_name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last Name</FormLabel>
              <FormControl>
                <Input 
                  placeholder='Enter your last name' 
                  disabled={isSubmitting}
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Your last name as it will appear on your profile.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name='username'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input 
                  placeholder='Enter your username' 
                  disabled={isSubmitting}
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                This is your public display name. It can be your real name or a
                pseudonym.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type='submit' 
          disabled={isSubmitting}
          className='w-full sm:w-auto'
        >
          {isSubmitting ? 'Updating...' : 'Update profile'}
        </Button>
      </form>
    </Form>
  )
}
