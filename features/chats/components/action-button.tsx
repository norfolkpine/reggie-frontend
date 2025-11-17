import { Button } from "@/components/ui/button"
import { LucideProps } from "lucide-react"
import { cn } from "@/lib/utils"
import React from "react"

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>
  activeIcon?: React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>
  isActive?: boolean
  onClick?: () => void
  title?: string
  className?: string
  disabled?: boolean
}

export const ActionButton = React.forwardRef<HTMLButtonElement, ActionButtonProps>((
  {
    icon: Icon,
    activeIcon: ActiveIcon,
    isActive,
    onClick,
    title,
    className,
    disabled,
    ...props
  }, ref) => {
  const ButtonIcon = isActive && ActiveIcon ? ActiveIcon : Icon

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      onClick={onClick}
      className={cn(
        "h-8 w-8 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 relative z-10",
        isActive && "text-primary hover:text-primary hover:bg-primary/10",
        className
      )}
      title={title}
      disabled={disabled}
      {...props}
    >
      <ButtonIcon className="h-4 w-4" />
    </Button>
  )
})

ActionButton.displayName = "ActionButton"