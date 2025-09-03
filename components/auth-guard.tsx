'use client'

import { useAuth } from '@/contexts/auth-context'
import { TracingLogo } from '@/components/ui/tracing-logo'

interface AuthGuardProps {
  children: React.ReactNode
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  const { loading } = useAuth()

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