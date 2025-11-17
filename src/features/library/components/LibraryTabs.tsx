import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Globe, Lock } from "lucide-react"
import { Document, Collection } from "../types"
import { DocumentCard } from "./DocumentCard"
import { CollectionCard } from "./CollectionCard"

interface LibraryTabsProps {
  activeTab: string
  setActiveTab: (value: string) => void
  documentType: string
  setDocumentType: (type: string) => void
  filteredDocuments: Document[]
  filteredCollections: Collection[]
}

export function LibraryTabs({
  activeTab,
  setActiveTab,
  documentType,
  setDocumentType,
  filteredDocuments,
  filteredCollections,
}: LibraryTabsProps) {
  return (
    <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
      <div className="flex justify-between items-center mb-4">
        <TabsList>
          <TabsTrigger value="all">All Documents</TabsTrigger>
          <TabsTrigger value="legislation">Legislation</TabsTrigger>
          <TabsTrigger value="taxation">Taxation</TabsTrigger>
          <TabsTrigger value="starred">Starred</TabsTrigger>
          <TabsTrigger value="collections">Collections</TabsTrigger>
        </TabsList>

        {/* Document type selector */}
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
      </div>

      <TabsContent value="all" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 justify-items-stretch items-stretch">
          {filteredDocuments.map((doc) => (
            <DocumentCard key={doc.id} document={doc} />
          ))}
        </div>
      </TabsContent>

      <TabsContent value="legislation" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments
            .filter((doc) => doc.type === "Legislation")
            .map((doc) => (
              <DocumentCard key={doc.id} document={doc} />
            ))}
        </div>
      </TabsContent>

      <TabsContent value="taxation" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments
            .filter((doc) => doc.category === "Taxation")
            .map((doc) => (
              <DocumentCard key={doc.id} document={doc} />
            ))}
        </div>
      </TabsContent>

      <TabsContent value="starred" className="space-y-6">
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Starred Documents</h2>
            <span className="text-sm text-muted-foreground">
              {filteredDocuments.filter((doc) => doc.starred).length} documents
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocuments
              .filter((doc) => doc.starred)
              .map((doc) => (
                <DocumentCard key={doc.id} document={doc} />
              ))}
          </div>
        </div>
      </TabsContent>

      <TabsContent value="collections" className="space-y-6">
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Collections</h2>
            <span className="text-sm text-muted-foreground">{filteredCollections.length} collections</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCollections.map((collection) => (
              <CollectionCard key={collection.id} collection={collection} />
            ))}
          </div>
        </div>
      </TabsContent>
    </Tabs>
  )
}