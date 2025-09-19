import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ApiError {
  message: string
  code: string
  param?: string
}

export interface ErrorListProps {
  errors: ApiError[]
  className?: string
  variant?: 'default' | 'destructive'
}

export function ErrorList({ errors, className, variant = 'destructive' }: ErrorListProps) {
  if (!errors || errors.length === 0) {
    return null
  }

  return (
    <Alert variant={variant} className={cn('mb-4', className)}>
    
      <AlertDescription className="space-y-2">
        
        <ul className="space-y-1">
          {errors.map((error, index) => (
            <li key={index} className="flex items-start gap-2">
              <XCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
              <span className="text-sm">{error.message}</span>
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  )
}
