'use client'

import { useAuth } from '@/contexts/auth-context'
import { TracingLogo } from '@/components/ui/tracing-logo'

interface AuthGuardProps {
  children: React.ReactNode
  allowedRoutes?: string[]
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  const { loading } = useAuth()

  // Only show loading state during initial auth check
  // Route protection is handled by middleware
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center space-y-4">
          <TracingLogo size={60} duration={2} strokeColor="#513379" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

export default AuthGuard