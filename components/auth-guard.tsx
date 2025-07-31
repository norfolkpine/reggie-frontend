'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { TracingLogo } from '@/components/ui/tracing-logo'

interface AuthGuardProps {
  children: React.ReactNode
  allowedRoutes?: string[]
}

const AuthGuard = ({ children, allowedRoutes = [] }: AuthGuardProps) => {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      const currentPath = window.location.pathname
      const authRoutes = ['/sign-in', '/sign-up', '/forgot-password', '/otp']
      const protectedRoutes = ['/agents', '/projects']
      const publicRoutes = ['/', ...allowedRoutes]
      
      const isApiRoute = currentPath.startsWith('/api/')
      
      if (isAuthenticated && authRoutes.includes(currentPath)) {
        router.push('/')
      } 
      else if (!isAuthenticated && 
        !isApiRoute && 
        !publicRoutes.includes(currentPath) && 
        !allowedRoutes.includes(currentPath)
      ) {
        router.push('/sign-in')
      }
    }
  }, [isAuthenticated, loading, router, allowedRoutes])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <TracingLogo size={80} duration={3} strokeColor="#513379" />
      </div>
    )
  }

  return children
}


export default AuthGuard