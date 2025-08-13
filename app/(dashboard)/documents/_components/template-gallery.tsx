"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { createDocumentWithTitleOnly } from "@/api/documents"

export function TemplateGallery() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

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
      <div className="flex items-center justify-center">
        <Button
          onClick={saveDocument}
          disabled={isLoading}
          size="lg"
          className="px-8 py-6 text-lg font-medium"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
          ) : null}
          Create a new document
        </Button>
      </div>
    </div>
  )
}
