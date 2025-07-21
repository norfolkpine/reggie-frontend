"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MoreVertical, ChevronDown, Loader2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { createDocumentWithTitleOnly } from "@/api/documents"

interface Template {
  id: string
  title: string
  category: string
  thumbnail: string
}

interface TemplateGalleryProps {
  templates: Template[]
}

export function TemplateGallery({ templates }: TemplateGalleryProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [collapsed, setCollapsed] = useState(true)

  const saveDocument = async () => {
    setIsLoading(true)
    try {
      const savedDoc = await createDocumentWithTitleOnly('New Document')
      if (savedDoc) {
        router.push(`/documents/${savedDoc.id}`)
      }
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <div className="rounded-lg bg-muted/50 p-6">
      <div className={`flex items-center justify-between ${collapsed ? 'mb-0' : 'mb-6'}`}>
        <div className="flex items-center gap-2">
          {collapsed ? (
            <button
              className="text-lg font-medium text-primary underline hover:opacity-80 transition-opacity cursor-pointer bg-transparent border-0 p-0"
              onClick={saveDocument}
              disabled={isLoading}
              style={{ background: 'none' }}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin inline-block mr-2 align-middle" /> : null}
              Create a new document
            </button>
          ) : (
            <h2 className="text-lg font-medium">Create a new document</h2>
          )}
        </div>
        <Button variant="ghost" size="icon" onClick={() => setCollapsed(c => !c)} aria-label={collapsed ? 'Expand' : 'Collapse'}>
          <ChevronDown className={`transition-transform ${collapsed ? 'rotate-180' : ''}`} />
        </Button>
      </div>

      {!collapsed && (
        <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4 lg:grid-cols-7">
            {templates.map((template) => (
              <div key={template.id} className="flex flex-col">
                <Link 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault()
                    if (template.id === "blank") {
                      saveDocument()
                    } else {
                      router.push(`/templates/${template.id}`)
                    }
                  }} 
                  className="group"
                >
                  <Card className="flex flex-col overflow-hidden border transition-all hover:border-primary/20 hover:shadow-sm w-full max-w-xs max-h-xs aspect-[3/4]">
                    <CardContent className="relative w-full flex-1 p-0 bg-background flex items-center justify-center overflow-hidden">
                      <div 
                        className={`w-full h-full flex items-center justify-center ${template.id === "blank" ? "bg-background" : "bg-muted"}`}
                      >
                        {template.id === "blank" ? (
                          <div className="w-12 h-12 flex items-center justify-center">
                            {isLoading ? (
                              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            ) : (
                            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M18 7.5V28.5" stroke="#4285F4" strokeWidth="3" strokeLinecap="round" />
                              <path d="M28.5 18L7.5 18" stroke="#EA4335" strokeWidth="3" strokeLinecap="round" />
                              <path d="M28.5 18L7.5 18" stroke="#FBBC05" strokeWidth="3" strokeLinecap="round" />
                              <path d="M28.5 18L7.5 18" stroke="#34A853" strokeWidth="3" strokeLinecap="round" />
                            </svg>
                            )}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center space-y-2">
                            <div className="w-16 h-1 bg-primary/20 rounded" />
                            <div className="w-12 h-1 bg-primary/20 rounded" />
                            <div className="w-14 h-1 bg-primary/20 rounded" />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  <div className="mt-2 text-center">
                    <h3 className="text-sm font-medium">{template.title}</h3>
                    {template.category && <p className="text-xs text-muted-foreground">{template.category}</p>}
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
