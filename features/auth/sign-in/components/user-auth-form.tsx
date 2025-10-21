'use client'

import { HTMLAttributes, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconBrandFacebook, IconBrandWindows, IconBrandGoogle, IconMail } from '@tabler/icons-react'
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
import { ErrorList, ApiError } from '@/components/ui/error-list'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/components/ui/use-toast'
import { AuthErrorResponse } from '@/types/api'
import { redirectToProvider } from '@/api/auth'

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
  const [apiErrors, setApiErrors] = useState<ApiError[]>([])
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
      setApiErrors([]) // Clear any previous API errors
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
      // The API client throws the parsed JSON directly, so error should be the response data
      const responseData = error
      
      // Handle the specific error structure with status and errors array
      if (responseData.status && responseData.errors && Array.isArray(responseData.errors)) {
        
        // Convert API errors to our ApiError format
        const apiErrorList: ApiError[] = responseData.errors.map((err: AuthErrorResponse['errors'][0]) => ({
          message: err.message,
          code: err.code,
          param: err.param
        }))
        
        setApiErrors(apiErrorList)
        
        // Also set field-specific errors for form validation
        let hasFieldErrors = false
        responseData.errors.forEach((err: AuthErrorResponse['errors'][0]) => {
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
        
        // Show toast with the first error message
        const firstError = responseData.errors[0]
        if (firstError && firstError.message) {
          toast({
            variant: 'destructive',
            title: 'Login Failed',
            description: firstError.message,
          })
        }
      } else if (responseData.errors && Array.isArray(responseData.errors)) {
        // Handle case where errors array exists but no status
        const apiErrorList: ApiError[] = responseData.errors.map((err: any) => ({
          message: err.message || err.detail || 'Unknown error',
          code: err.code || 'unknown',
          param: err.param
        }))
        
        setApiErrors(apiErrorList)
        
        // Set field-specific errors
        let hasFieldErrors = false
        responseData.errors.forEach((err: any) => {
          if (err.param && (err.message || err.detail)) {
            const fieldName = err.param === 'password' ? 'password' : 
                            err.param === 'email' ? 'email' : err.param
            form.setError(fieldName as any, { 
              message: err.message || err.detail
            })
            hasFieldErrors = true
          }
        })
        
        // Show toast with the first error message
        const firstError = responseData.errors[0]
        if (firstError && (firstError.message || firstError.detail)) {
          toast({
            variant: 'destructive',
            title: 'Login Failed',
            description: firstError.message || firstError.detail,
          })
        }
      } else if (responseData.message) {
        // Handle case where response has a direct message property
        setGeneralError(responseData.message)
        setApiErrors([{
          message: responseData.message,
          code: 'unknown',
          param: undefined
        }])
        toast({
          variant: 'destructive',
          title: 'Login Failed',
          description: responseData.message,
        })
      } else if (responseData.detail) {
        // Handle case where response has a detail property
        setGeneralError(responseData.detail)
        setApiErrors([{
          message: responseData.detail,
          code: 'unknown',
          param: undefined
        }])
        toast({
          variant: 'destructive',
          title: 'Login Failed',
          description: responseData.detail,
        })
      } else if (typeof responseData === 'string') {
        // Handle case where response data is a string
        setApiErrors([{
          message: responseData,
          code: 'unknown',
          param: undefined
        }])
        toast({
          variant: 'destructive',
          title: 'Login Failed',
          description: responseData,
        })
      } else if (responseData.message && !responseData.message.includes('HTTP')) {
        // Handle case where error has a message but it's not an HTTP error
        setApiErrors([{
          message: responseData.message,
          code: 'unknown',
          param: undefined
        }])
        toast({
          variant: 'destructive',
          title: 'Login Failed',
          description: responseData.message,
        })
      } else if (responseData.message && responseData.message.includes('HTTP')) {
        // Handle case where we get a generic HTTP error
        setApiErrors([{
          message: responseData.message,
          code: 'http_error',
          param: undefined
        }])
        toast({
          variant: 'destructive',
          title: 'Login Failed',
          description: responseData.message,
        })
      } else {
        // Fallback to existing error handling
        const { hasFieldErrors, message } = handleApiError(error, form.setError)
        
        if (!hasFieldErrors) {
          const errorMessage = message || 'Failed to login'
          setGeneralError(errorMessage)
          setApiErrors([{
            message: errorMessage,
            code: 'unknown',
            param: undefined
          }])
          toast({
            variant: 'destructive',
            title: 'Error',
            description: errorMessage,
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
          {/* API Errors Display */}
          <ErrorList errors={apiErrors} />
          
          {/* General Error Display (fallback) */}
          {generalError && apiErrors.length === 0 && (
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

            <div className='flex flex-col items-center gap-2'>
              <Button
                variant='outline'
                className='w-full'
                type='button'
                disabled={isLoading}
                onClick={() => {
                  // Redirect to Google via allauth headless endpoint
                  redirectToProvider('google', '/account/provider/callback')
                }}
              >
                <IconBrandGoogle className='h-4 w-4' /> Google
              </Button>
              <Button
                variant='outline'
                className='w-full'
                type='button'
                disabled={isLoading}
                onClick={() => {
                  // Redirect to Microsoft via allauth headless endpoint
                  redirectToProvider('microsoft', '/account/provider/callback')
                }}
              >
                <IconBrandWindows className='h-4 w-4' /> Microsoft
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
