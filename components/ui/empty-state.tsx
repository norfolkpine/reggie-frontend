import { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Button } from "./button"
import { RefreshCw } from "lucide-react"

interface EmptyStateProps {
  title: string
  description?: string
  icon?: ReactNode
  action?: ReactNode
  className?: string
  onRefresh?: () => void
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
  onRefresh,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[300px] md:h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed p-4 md:p-6",
        className
      )}
    >
      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
        {icon && <div className="flex h-16 md:h-20 w-16 md:w-20 items-center justify-center rounded-full bg-muted">{icon}</div>}
        <h3 className="mt-3 md:mt-4 text-base md:text-lg font-semibold">{title}</h3>
        {description && (
          <p className="mb-3 md:mb-4 mt-2 text-sm text-muted-foreground">{description}</p>
        )}
        <div className="mt-2 md:mt-3 flex flex-col gap-2 w-full sm:w-auto">
          {action}
          {onRefresh && (
            <Button
              variant="outline"
              onClick={onRefresh}
              className="gap-2 w-full sm:w-auto"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}