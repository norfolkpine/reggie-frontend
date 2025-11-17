import { Folder, Share2, FileText, Globe, Lock, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Collection } from "../types"

interface CollectionCardProps {
  collection: Collection
}

export function CollectionCard({ collection }: CollectionCardProps) {
  const isPublic = collection.access === "public"

  return (
    <Card className="h-full w-full aspect-[4/5]">
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <span className="text-xl">{collection.icon}</span>
            <CardTitle className="text-lg">{collection.name}</CardTitle>
          </div>
          {isPublic ? (
            <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
              Public
            </Badge>
          ) : collection.access === "private" ? (
            <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
              Private
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">
              Team
            </Badge>
          )}
        </div>
        <CardDescription>
          {collection.count} documents
          {!isPublic && collection.team && ` • ${collection.team}`}
          {!isPublic && collection.owner && ` • ${collection.owner}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex items-center text-sm text-muted-foreground">
          <Folder className="h-4 w-4 mr-1" />
          <span>Collection</span>
        </div>
      </CardContent>
      <CardFooter className="p-2 bg-muted/50 flex justify-between">
        <Button variant="ghost" size="sm" className="h-8 px-2">
          <FileText className="h-4 w-4 mr-1" />
          <span className="text-xs">Open</span>
        </Button>
        {!isPublic && (
          <Button variant="ghost" size="sm" className="h-8 px-2">
            <Share2 className="h-4 w-4 mr-1" />
            <span className="text-xs">Share</span>
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}