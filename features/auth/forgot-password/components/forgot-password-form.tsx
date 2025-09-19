"use client"

import { HTMLAttributes, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
import { ErrorList, ApiError } from '@/components/ui/error-list'
import { forgotPassword } from '@/api/auth'
import { useToast } from '@/components/ui/use-toast'
import { handleApiError } from '@/lib/utils/handle-api-error'
import { AuthErrorResponse } from '@/types/api'

type ForgotFormProps = HTMLAttributes<HTMLDivElement>

const formSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Please enter your email' })
    .email({ message: 'Invalid email address' }),
})

export function ForgotForm({ className, ...props }: ForgotFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [apiErrors, setApiErrors] = useState<ApiError[]>([])
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '' },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true)
      setApiErrors([]) // Clear any previous API errors
      form.clearErrors() // Clear any previous form errors
      
      await forgotPassword(data.email)
      
      toast({
        title: 'Success',
        description: 'Password reset link has been sent to your email',
      })
      
      // Reset form after successful submission
      form.reset()
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
        responseData.errors.forEach((err: AuthErrorResponse['errors'][0]) => {
          if (err.param && err.message) {
            form.setError(err.param as any, { 
              message: err.message 
            });
          }
        });
        
        // Show toast with the first error message
        const firstError = responseData.errors[0];
        if (firstError && firstError.message) {
          toast({
            variant: 'destructive',
            title: 'Password Reset Failed',
            description: firstError.message,
          });
        }
      } else if (responseData.errors && Array.isArray(responseData.errors)) {
        // Handle case where errors array exists but no status
        const apiErrorList: ApiError[] = responseData.errors.map((err: any) => ({
          message: err.message || err.detail || 'Unknown error',
          code: err.code || 'unknown',
          param: err.param
        }));
        
        setApiErrors(apiErrorList);
        
        // Set field-specific errors
        responseData.errors.forEach((err: any) => {
          if (err.param && (err.message || err.detail)) {
            form.setError(err.param as any, { 
              message: err.message || err.detail
            });
          }
        });
        
        // Show toast with the first error message
        const firstError = responseData.errors[0];
        if (firstError && (firstError.message || firstError.detail)) {
          toast({
            variant: 'destructive',
            title: 'Password Reset Failed',
            description: firstError.message || firstError.detail,
          });
        }
      } else if (responseData.message) {
        // Handle case where response has a direct message property
        setApiErrors([{
          message: responseData.message,
          code: 'unknown',
          param: undefined
        }])
        toast({
          variant: 'destructive',
          title: 'Password Reset Failed',
          description: responseData.message,
        });
      } else if (responseData.detail) {
        // Handle case where response has a detail property
        setApiErrors([{
          message: responseData.detail,
          code: 'unknown',
          param: undefined
        }])
        toast({
          variant: 'destructive',
          title: 'Password Reset Failed',
          description: responseData.detail,
        });
      } else {
        // Fallback to existing error handling
        const { hasFieldErrors, message } = handleApiError(error, form.setError)
        
        if (!hasFieldErrors) {
          const errorMessage = message || 'Failed to send password reset email';
          setApiErrors([{
            message: errorMessage,
            code: 'unknown',
            param: undefined
          }]);
          toast({
            variant: 'destructive',
            title: 'Error',
            description: errorMessage,
          });
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
            <Button className='mt-2' disabled={isLoading}>
              Continue
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
