
import { AutoResizeTextarea } from '@/components/autoresize-textarea'
import { Loading } from '@/components/loading'
import { Button } from '@/components/ui/button'
import { Toggle } from '@/components/ui/toggle'
import { Plus, Search, Lightbulb, ArrowUpIcon, Mic } from 'lucide-react'
import { useState } from 'react'

interface InputMessageProps {
    onSubmit: (value: string) => void
    loading: boolean
    className?: string
}
export function InputMessage({ onSubmit, loading, className }: InputMessageProps) {
    const [textInput, setTextInput] = useState<string>('')
    
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      if (!textInput.trim()) {
        // Prevent new line and submission if input is empty
        e.preventDefault();
        return;
      }
      e.preventDefault();
      handleSubmit();
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(textInput)
    setTextInput("")
  }


  return (
    <div className={className}>
      <form
        onSubmit={handleSubmit}
        className='relative flex w-full flex-col rounded-lg border border-gray-200 bg-background p-4 shadow-lg'
      >
        <AutoResizeTextarea
          placeholder='Ask me anything'
          className='min-h-[50px] w-full outline-none ring-0 focus:outline-none focus:ring-transparent border-0 bg-transparent shadow-none'
          onKeyDown={handleKeyDown}
          value={textInput}
          onChange={(v) => setTextInput(v)}
        />
        <div className='mt-4 flex items-center gap-2'>
          <Button type='button' size='icon' variant='outline' className='rounded-full p-2 '>
            <Plus className='h-5 w-5' />
          </Button>

          <Toggle
            variant='outline'
            className='flex items-center gap-2 rounded-full px-4 py-2 '
          >
            <Search className='h-4 w-4' />
            <span>Search</span>
          </Toggle>

          <Toggle
            variant='outline'
            className='flex items-center gap-2 rounded-full px-4 py-2'
          >
            <Lightbulb className='h-4 w-4' />
            <span>Thinking</span>
          </Toggle>

          <div className='ml-auto'>
            <Button
              variant={textInput ? 'default' : 'outline'}
              size='icon'
              className='ml-1 shrink-0 rounded-full'
            >
              {loading && <Loading />}
              {textInput && !loading && (
                <ArrowUpIcon className='h-5 w-5' />
              )}{' '}
              {!textInput && !loading && <Mic className='h-5 w-5' />}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
