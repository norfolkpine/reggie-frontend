"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MoreVertical, ChevronDown, File, Globe, Lock } from "lucide-react"
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Image from "next/image"
import { ViewToggle } from "./view-toggle"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface Document {
  id: string
  title: string
  lastOpened: string
  thumbnail?: string | null
}

interface RecentDocumentsProps {
  documents: Document[]
}

export function RecentDocuments({ documents }: RecentDocumentsProps) {
  const [currentView, setCurrentView] = useState<"grid" | "list">("grid")
  const [documentType, setDocumentType] = useState<"all" | "public" | "private">("all")

  return (
    <div className="w-full space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight">Documents</h2>
        <div className="flex items-center gap-3">
          <div className="flex rounded-md overflow-hidden border">
            <Button
              variant={documentType === "all" ? "default" : "ghost"}
              size="sm"
              onClick={() => setDocumentType("all")}
              className="rounded-none"
            >
              All
            </Button>
            <Button
              variant={documentType === "public" ? "default" : "ghost"}
              size="sm"
              onClick={() => setDocumentType("public")}
              className="rounded-none flex items-center gap-1"
            >
              <Globe className="h-3.5 w-3.5" /> Public
            </Button>
            <Button
              variant={documentType === "private" ? "default" : "ghost"}
              size="sm"
              onClick={() => setDocumentType("private")}
              className="rounded-none flex items-center gap-1"
            >
              <Lock className="h-3.5 w-3.5" /> Private
            </Button>
          </div>
          <ViewToggle onViewChange={setCurrentView} defaultView="grid" />
        </div>
      </div>

      {/* Grid View */}
      {currentView === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 place-items-start">
          {documents.map((doc) => (
            <Link 
              key={doc.id} 
              href={`/document/${doc.id}`} 
              className="group w-full max-w-[200px]"
            >
              <Card className="flex flex-col overflow-hidden border transition-all hover:border-primary/20 hover:shadow-sm w-full aspect-[3/4]">
                <CardContent className="relative w-full flex-1 p-0">
                  {doc.thumbnail ? (
                    <Image
                      src={doc.thumbnail}
                      alt={doc.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted/30">
                      <div 
                        className="w-16 h-16 rounded-lg bg-gradient-to-br from-muted-foreground/20 to-muted-foreground/10 flex items-center justify-center"
                      >
                        <File className="h-8 w-8 text-muted-foreground/40" />
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="p-3 flex items-center justify-between bg-card/50 backdrop-blur-sm">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-medium truncate group-hover:text-primary transition-colors">{doc.title}</h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <File className="h-3.5 w-3.5 text-muted-foreground/70" />
                      <span className="text-xs text-muted-foreground/70 truncate">Opened {doc.lastOpened}</span>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-all hover:bg-background/80 -mr-1"
                      >
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">More options</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Open</DropdownMenuItem>
                      <DropdownMenuItem>Rename</DropdownMenuItem>
                      <DropdownMenuItem>Make a copy</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Remove</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card className="mt-4">
          <div className="grid grid-cols-12 py-2 px-4 bg-muted/50 text-sm font-medium text-muted-foreground">
            <div className="col-span-6">Name</div>
            <div className="col-span-2">Owner</div>
            <div className="col-span-3">Last opened by me</div>
            <div className="col-span-1"></div>
          </div>
          <Separator />

          {documents.map((doc, index) => (
            <div key={doc.id}>
              <div className="grid grid-cols-12 py-3 px-4 items-center group hover:bg-muted/30">
                <div className="col-span-6">
                  <Link href={`/document/${doc.id}`} className="flex items-center gap-3">
                    <div className="w-8 h-11 overflow-hidden border flex-shrink-0 rounded-sm">
                      <Image
                        src={doc.thumbnail || "/placeholder.svg"}
                        alt={doc.title}
                        width={32}
                        height={45}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <span className="font-medium truncate">{doc.title}</span>
                  </Link>
                </div>
                <div className="col-span-2 text-sm text-muted-foreground">Me</div>
                <div className="col-span-3 text-sm text-muted-foreground line-clamp-2">{doc.lastOpened}</div>
                <div className="col-span-1 flex justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">More options</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Open</DropdownMenuItem>
                      <DropdownMenuItem>Rename</DropdownMenuItem>
                      <DropdownMenuItem>Make a copy</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Remove</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              {index < documents.length - 1 && <Separator />}
            </div>
          ))}
        </Card>
      )}
    </div>
  )
}
