import { useState } from "react"
import { Star, FileText, Download, Share2, Globe, Lock, Users, Clock, Building, User, MoreHorizontal } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Document } from "../types"

interface DocumentCardProps {
  document: Document
}

export function DocumentCard({ document }: DocumentCardProps) {
  const isPublic = document.access === "public"
  const [isStarred, setIsStarred] = useState(document.starred)

  const toggleStar = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsStarred(!isStarred)
    // In a real app, this would call an API to update the star status
  }

  return (
    <Card className={`overflow-hidden ${isStarred ? "border-yellow-300" : ""} hover:shadow-md transition-all`}>
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{document.title}</CardTitle>
          <div className="flex items-center gap-1">
            {isPublic ? (
              <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
                <Globe className="h-3 w-3 mr-1" /> Public
              </Badge>
            ) : document.access === "private" ? (
              <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
                <Lock className="h-3 w-3 mr-1" /> Private
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">
                <Users className="h-3 w-3 mr-1" /> Team
              </Badge>
            )}
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CardDescription className="line-clamp-2">{document.description}</CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline" className="bg-blue-50">
            {document.type}
          </Badge>
          <Badge variant="outline" className="bg-gray-50">
            {document.category}
          </Badge>
        </div>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            <span>{document.date}</span>
          </div>
          {isPublic ? (
            <div className="flex items-center">
              <Building className="h-4 w-4 mr-1" />
              <span>{(document as any).source}</span>
            </div>
          ) : (
            <div className="flex items-center">
              <User className="h-4 w-4 mr-1" />
              <span>{(document as any).owner}</span>
            </div>
          )}
        </div>

        {/* Shared with section for private documents */}
        {!isPublic && (document as any).sharedWith && (
          <div className="mt-3 flex items-center gap-1">
            <span className="text-xs text-muted-foreground">Shared with:</span>
            <div className="flex -space-x-2">
              {(document as any).sharedWith.slice(0, 3).map((shared: string, index: number) => (
                <Avatar key={index} className="h-6 w-6 border-2 border-background">
                  <AvatarFallback className="text-[10px]">
                    {shared
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
              ))}
              {(document as any).sharedWith.length > 3 && (
                <Avatar className="h-6 w-6 border-2 border-background">
                  <AvatarFallback className="text-[10px]">+{(document as any).sharedWith.length - 3}</AvatarFallback>
                </Avatar>
              )}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-2 bg-muted/50 flex justify-between">
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" className="h-8 px-2">
            <FileText className="h-4 w-4 mr-1" />
            <span className="text-xs">View</span>
          </Button>
          <Button variant="ghost" size="sm" className="h-8 px-2">
            <Download className="h-4 w-4 mr-1" />
            <span className="text-xs">Download</span>
          </Button>
        </div>
        <div className="flex gap-1">
          {!isPublic && (
            <Button variant="ghost" size="sm" className="h-8 px-2">
              <Share2 className="h-4 w-4 mr-1" />
              <span className="text-xs">Share</span>
            </Button>
          )}
          <Button
            variant={isStarred ? "default" : "ghost"}
            size="icon"
            className={`h-8 w-8 ${isStarred ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200" : ""}`}
            onClick={toggleStar}
          >
            <Star className={`h-4 w-4 ${isStarred ? "fill-yellow-500 text-yellow-500" : ""}`} />
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}