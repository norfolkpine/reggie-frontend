import { Dot } from "lucide-react"

export function TypingIndicator() {
  return (
    <div className="flex -space-x-2.5">
      <Dot className="h-4 w-4 animate-typing-dot-bounce" />
      <Dot className="h-4 w-4 animate-typing-dot-bounce [animation-delay:90ms]" />
      <Dot className="h-4 w-4 animate-typing-dot-bounce [animation-delay:180ms]" />
    </div>
  )
}
