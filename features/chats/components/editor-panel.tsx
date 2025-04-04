'use client'

import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Highlight from '@tiptap/extension-highlight'
import CharacterCount from '@tiptap/extension-character-count'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import TextStyle from '@tiptap/extension-text-style'
import FontFamily from '@tiptap/extension-font-family'
import Typography from '@tiptap/extension-typography'
import Color from '@tiptap/extension-color'
import Focus from '@tiptap/extension-focus'
import Dropcursor from '@tiptap/extension-dropcursor'
import CollaborationCursor from '@tiptap/extension-collaboration-cursor'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import Paragraph from '@tiptap/extension-paragraph'
import BulletList from '@tiptap/extension-bullet-list'
import OrderedList from '@tiptap/extension-ordered-list'
import Collaboration from '@tiptap/extension-collaboration'
import TaskItem from '@tiptap/extension-task-item'
import TaskList from '@tiptap/extension-task-list'
import { useEffect, useState } from 'react'
import { ArrowLeft, BookOpen, Check, Copy, RefreshCw, Volume2, Undo, Redo, Square } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import '@/styles/editor.css'
import { Message } from '@/types/message'
import { useToast } from '@/components/ui/use-toast'
import { useSpeechSynthesis } from '@/hooks/use-speech-synthesis'
import { ActionButton } from './action-button'
import TiptapTable from '@tiptap/extension-table'
import TiptapTableRow from '@tiptap/extension-table-row'
import { TableCell, TableHeader } from './Table'
import { Link } from './Link'
import { BlockquoteFigure } from './BlockquoteFigure'
import { HorizontalRule } from './HorizontalRule'
import { Markdown } from 'tiptap-markdown';
import MarkdownIt from 'markdown-it'


interface EditorPanelProps {
  onClose?: () => void
  onSave?: (content: string) => void
  title?: string
  show?: boolean
  content: Message | null
}

export function EditorPanel({ 
  onClose, 
  title = 'Document Preview',
  show = false, 
  onSave,
  content
}: EditorPanelProps) {
  const [isCopied, setIsCopied] = useState(false)
  const [isJournalSaved, setIsJournalSaved] = useState(false)
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
      }),
      Markdown.configure({
        html: true,
        tightLists: true,
      }),
      Highlight.configure({}),
      CharacterCount.configure({}),
      Underline.configure({}),
      TextAlign.configure({
        types: ['heading', 'paragraph', 'table'],
      }),
      Link,
      HorizontalRule,
      BlockquoteFigure,
      TextStyle.configure({}),
      FontFamily.configure({}),
      Typography.configure({}),
      Color.configure({}),
      Focus.configure({}),
      TiptapTable.configure({
        resizable: true,
        lastColumnResizable: true,
        HTMLAttributes: {
          class: 'table',
        },
      }),
      TiptapTableRow,
      TableCell.configure({
        HTMLAttributes: {
          class: 'table-cell',
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: 'table-header',
        }
      }),
      Subscript,
      Superscript,
      Paragraph,
      BulletList,
      OrderedList,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
    ]
  })

  const { isPlaying, play, stop } = useSpeechSynthesis({})

  const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true
  })

  useEffect(() => {
    if (editor && content) {
      try {
        const htmlContent = md.render(content?.content)
        const sanitizedContent = htmlContent
          .replace(/<li>\s*<>([^<]*)<\/>/g, '<li>$1')
          .replace(/<li>\s*<p>([^<]*)<\/p>/g, '<li>$1')
          .replace(/<\/li>\s*<\/li>/g, '</li>')
        editor.commands.setContent(sanitizedContent, false, {
          preserveWhitespace: 'full'
        })
      } catch (error) {
        console.error('Error rendering markdown:', error)
        editor.commands.setContent(content?.content, false)
      }
    }
  }, [editor, content])

  const handleSendToJournal = async () => {
    
  }

  if(!show){
    return null
  }

  return (
    <div className={cn(
      'w-[50vw] border-l border-border',
      'transform transition-transform duration-300 ease-in-out',
      'flex flex-col h-full bg-black',
      show ? 'translate-x-0' : 'translate-x-full'
    )}>
      <div className="px-4 py-2 border-b flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            if (onClose) {
              onClose()
              
            }
            if(onSave){
              onSave(editor?.storage.markdown.getMarkdown() ?? '')
            }
          }}
          className="h-9 w-9"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-medium">{title}</h2>
      </div>
      <div className="flex-1 px-4 pt-4 overflow-y-auto">
      <EditorContent
              editor={editor}
              className='p-8 w-full flex-1'
            />
      </div>
      <div className="flex items-center gap-2 py-2 px-8 2xl:py-4">
        <ActionButton
          icon={Copy}
          activeIcon={Check}
          isActive={isCopied}
          onClick={() => {
            if (editor) {
              navigator.clipboard.writeText(editor.getText())
              setIsCopied(true)
              setTimeout(() => setIsCopied(false), 2000)
            }
          }}
          title="Copy to clipboard"
        />
        <ActionButton
          icon={Volume2}
          activeIcon={Square}
          isActive={isPlaying}
          onClick={() => {
            if (editor) {
              const text = editor.getText()
              if (isPlaying) {
                stop()
              } else {
                play(text)
              }
            }
          }}
          title={isPlaying ? "Stop reading" : "Read aloud"}
        />
        <ActionButton
          icon={RefreshCw}
          onClick={() => {
            if (editor && content?.content) {
              editor.commands.setContent(content.content)
            }
          }}
          title="Reset"
        />
        <ActionButton
          icon={BookOpen}
          activeIcon={Check}
          isActive={isJournalSaved}
          onClick={handleSendToJournal}
          title="Send to journal"
        />
        {/* <ActionButton
          icon={Undo}
          onClick={() => editor?.chain().focus().undo().run()}
          disabled={!editor?.can().undo()}
          title="Undo"
        />
        <ActionButton
          icon={Redo}
          onClick={() => editor?.chain().focus().redo().run()}
          disabled={!editor?.can().redo()}
          title="Redo"
        /> */}
      </div>
    </div>
  )
}