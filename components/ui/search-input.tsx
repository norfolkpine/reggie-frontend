import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string
  inputClassName?: string
}

export default function SearchInput({ className, inputClassName, ...props }: SearchInputProps) {
  return (
    <div className={cn(
      "flex items-center w-full space-x-2 rounded-lg border border-gray-300 px-3.5 ",
      className
    )}>
      <SearchIcon className="h-4 w-4" />
      <Input 
        type="search" 
        placeholder="Search" 
        className={cn("w-full border-0 ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-10 md:h-9", inputClassName)}
        {...props}
      />
    </div>
  )
}

function SearchIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  )
}