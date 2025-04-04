import { Button } from "@/components/ui/button"
import { LucideProps } from "lucide-react"
import { cn } from "@/lib/utils"

interface ActionButtonProps {
  icon: React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>
  activeIcon?: React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>
  isActive?: boolean
  onClick?: () => void
  title?: string
  className?: string
  disabled?: boolean
}

export function ActionButton({
  icon: Icon,
  activeIcon: ActiveIcon,
  isActive,
  onClick,
  title,
  className,
  disabled
}: ActionButtonProps) {
  const ButtonIcon = isActive && ActiveIcon ? ActiveIcon : Icon

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      className={cn(
        "h-8 w-8 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100",
        isActive && "text-primary hover:text-primary hover:bg-primary/10",
        className
      )}
      title={title}
      disabled={disabled}
    >
      <ButtonIcon className="h-4 w-4" />
    </Button>
  )
}