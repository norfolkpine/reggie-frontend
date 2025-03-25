import { HTMLAttributes, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate, useRouter, useRouterState } from '@tanstack/react-router'
import { IconBrandFacebook, IconBrandGithub, IconBrandGoogle, IconMail } from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/context/auth-context'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/password-input'
import { LinkButton } from '@/components/ui/link-button'
import { handleApiError } from '@/utils/handle-api-error'
import { Route } from '@/routes/(auth)/sign-in'
import { sleep } from '@/utils/commons'

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
  const { login } = useAuth()
  const navigate = Route.useNavigate()
  const router = useRouter()
  const { toast } = useToast()
  const search = Route.useSearch()
  const pageLoading = useRouterState({ select: (s) => s.isLoading })


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
      await login({
        email: data.email,
        password: data.password,
      })
      toast({
        title: 'Success',
        description: 'You have successfully logged in',
      })

      navigate({ to: search.redirect || '/', replace: true  })
    } catch (error: any) {
      const { hasFieldErrors, message } = handleApiError(error, form.setError)
      
      if (!hasFieldErrors) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: message || 'Failed to login',
      })
    }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('grid gap-6', className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
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
                  <div className='flex items-center justify-between'>
                    <FormLabel>Password</FormLabel>
                    <Link
                      to='/forgot-password'
                      className='text-sm font-medium text-muted-foreground hover:opacity-75'
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <FormControl>
                    <PasswordInput placeholder='********' {...field} />
                  </FormControl>
                  <FormMessage />
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
                disabled={pageLoading}
              >
                <IconBrandGoogle className='h-4 w-4' /> Google
              </Button>
              <LinkButton
                variant='outline'
                type='button'
                to='/sign-up'
                className='w-full'
                loading={pageLoading}
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
