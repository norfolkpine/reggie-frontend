import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";

interface PromptSuggestionsProps {
  label: string
  append: (message: { role: "user"; content: string }) => void
  suggestions: string[]
}

export function PromptSuggestions({
  label,
  append,
  suggestions,
}: PromptSuggestionsProps) {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <div className="flex items-center justify-center gap-3 mb-2">
          
          <h2 className="text-3xl font-heading font-bold bg-gradient-to-r from-opie-purple to-opie-teal bg-clip-text text-transparent">
            {label} 🚀
          </h2>
        </div>
        <p className="text-muted-foreground text-lg font-sans">
          Click on any suggestion below to get started
        </p>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="space-y-3"
      >
        {suggestions.map((suggestion, index) => (
          <motion.button
            key={suggestion}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ 
              duration: 0.5, 
              delay: 0.3 + index * 0.1,
              x: { duration: 0.2, ease: "easeOut" }
            }}
            whileHover={{ 
              x: 4
            }}
            whileTap={{ scale: 0.98 }}
            onClick={() => append({ role: "user", content: suggestion })}
            className="group relative flex items-center justify-between w-full p-4 rounded-xl border border-opie-purple-medium bg-gradient-to-r from-opie-purple-light to-opie-teal-light hover:border-opie-purple-dark hover:shadow-md hover:shadow-opie-purple-medium transition-all duration-300 text-left min-h-[60px]"
          >
            <div className="flex-1 pr-4">
              <p className="text-foreground font-sans font-medium text-base leading-relaxed transition-colors group-hover:text-opie-purple">
                {suggestion}
              </p>
            </div>
            <div className="flex-shrink-0">
              <div className="w-7 h-7 rounded-full bg-opie-purple-light group-hover:bg-opie-purple-medium flex items-center justify-center transition-colors duration-300">
                <ArrowRight className="w-3.5 h-3.5 text-opie-purple-text group-hover:text-opie-purple group-hover:translate-x-0.5 transition-all duration-300" />
              </div>
            </div>
            
            {/* Subtle gradient overlay on hover */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent to-transparent group-hover:from-opie-purple-medium group-hover:to-opie-teal-medium transition-all duration-300 pointer-events-none" />
          </motion.button>
        ))}
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="text-center"
      >
        <p className="text-sm text-muted-foreground font-sans">
          Or type your own question in the input below
        </p>
      </motion.div>
    </div>
  )
}
