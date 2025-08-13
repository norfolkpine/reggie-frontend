'use client'

import { HTMLAttributes, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconBrandFacebook, IconBrandGithub, IconBrandGoogle, IconMail } from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { handleApiError } from '@/lib/utils/handle-api-error'
import { PasswordInput } from '@/components/password-input'
import { LinkButton } from '@/components/link-button'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/components/ui/use-toast'
import { AuthErrorResponse } from '@/types/api'

type UserAuthFormProps = HTMLAttributes<HTMLDivElement>

const formSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Please enter your email' })
    .email({ message: 'Invalid email address' }),
  password: z
    .string()
    .min(1, {
      message: 'Please enter your password',
    })
    .min(7, {
      message: 'Password must be at least 7 characters long',
    }),
})

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [generalError, setGeneralError] = useState<string | null>(null)
  const { login } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const search = useSearchParams()


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true)
      setGeneralError(null) // Clear any previous general errors
      form.clearErrors() // Clear any previous form errors
      
      await login({
        email: data.email,
        password: data.password,
      })
      toast({
        title: 'Success',
        description: 'You have successfully logged in',
      })

      router.replace(search.get('redirect') || '/')
    } catch (error: any) {
      // Handle the specific error structure
      if (error.errors && Array.isArray(error.errors)) {
        let hasFieldErrors = false
        
        error.errors.forEach((err: AuthErrorResponse['errors'][0]) => {
          if (err.param && err.message) {
            // Map the param to the form field name
            const fieldName = err.param === 'password' ? 'password' : 
                            err.param === 'email' ? 'email' : err.param
            form.setError(fieldName as any, { 
              message: err.message 
            })
            hasFieldErrors = true
          }
        })
        
        // If no field-specific errors, show as general error
        if (!hasFieldErrors) {
          const firstError = error.errors[0]
          if (firstError && firstError.message) {
            setGeneralError(firstError.message)
          }
        }
        
        // Show toast with the first error message
        const firstError = error.errors[0]
        if (firstError && firstError.message) {
          toast({
            variant: 'destructive',
            title: 'Login Failed',
            description: firstError.message,
          })
        }
      } else {
        // Fallback to existing error handling
        const { hasFieldErrors, message } = handleApiError(error, form.setError)
        
        if (!hasFieldErrors) {
          setGeneralError(message || 'Failed to login')
          toast({
            variant: 'destructive',
            title: 'Error',
            description: message || 'Failed to login',
          })
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('grid gap-6', className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {/* General Error Display */}
          {generalError && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{generalError}</AlertDescription>
            </Alert>
          )}
          
          <div className='grid gap-2'>
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder='name@example.com' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <PasswordInput placeholder='********' {...field} />
                  </FormControl>
                  <FormMessage />
                  <div className='flex justify-end'>
                    <Link
                      href='/forgot-password'
                      className='text-sm font-medium text-muted-foreground hover:opacity-75'
                    >
                      Forgot password?
                    </Link>
                  </div>
                </FormItem>
              )}
            />
            <Button className='mt-2' disabled={isLoading}>
              Login
            </Button>

            <div className='relative my-2'>
              <div className='absolute inset-0 flex items-center'>
                <span className='w-full border-t' />
              </div>
              <div className='relative flex justify-center text-xs uppercase'>
                <span className='bg-background px-2 text-muted-foreground'>
                  Or continue with
                </span>
              </div>
            </div>

            <div className='flex items-center gap-2'>
              <Button
                variant='outline'
                className='w-full'
                type='button'
                disabled={isLoading}
              >
                <IconBrandGoogle className='h-4 w-4' /> Google
              </Button>
              <LinkButton
                variant='outline'
                type='button'
                href='/sign-up'
                className='w-full'
                loading={isLoading}
              >
                <IconMail className='h-4 w-4' /> Email
              </LinkButton>
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}
