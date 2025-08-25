"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, Search, Loader2, Plus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { RecentDocuments } from "./_components/recent-documents";
import { CreateDocumentDialog } from "./_components/create-document-dialog";
import { getPaginatedDocuments } from "@/api/documents";
import { Document } from "@/types/api";
import { useCreateDoc } from "@/features/docs/doc-management/api/useCreateDoc";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import SearchInput from "@/components/ui/search-input";
import { useHeader } from "@/contexts/header-context";

export default function DocumentListPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [createDocumentOpen, setCreateDocumentOpen] = useState(false);
  
  const router = useRouter();
  const { toast } = useToast();
  const { setHeaderActions, setHeaderCustomContent } = useHeader();

  // Set header actions and custom content
  useEffect(() => {
    // Set the "New Document" button as a header action
    setHeaderActions([
      {
        label: "New Document",
        onClick: () => setCreateDocumentOpen(true),
        icon: <Plus className="h-4 w-4" />,
        variant: "default",
        size: "sm"
      }
    ]);

    // Set loading indicator as custom content next to the title
    setHeaderCustomContent(
      isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : null
    );

    // Cleanup when component unmounts
    return () => {
      setHeaderActions([]);
      setHeaderCustomContent(null);
    };
  }, [setHeaderActions, setHeaderCustomContent, isLoading]);

  // Create document mutation
  const createDocMutation = useCreateDoc({
    onSuccess: (doc) => {
      setCreateDocumentOpen(false);
      toast({
        title: "Success",
        description: "Document created successfully"
      });
      // Refresh the documents list
      loadDocuments();
    },
  });

  const loadDocuments = async () => {
    try {
      setIsLoading(true);
      const response = await getPaginatedDocuments({
        page,
        title: searchQuery || undefined,
      });
      setDocuments(response.results);
      setHasMore(!!response.next);
    } catch (err) {
      setError("Failed to load documents");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [page, searchQuery]);

  const handleCreateDocument = async (title: string, description?: string) => {
    try {
      await createDocMutation.mutateAsync();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create document. Please try again later.",
        variant: "destructive"
      });
    }
  };

  // Convert API documents to the format expected by RecentDocuments component
  const recentDocuments = documents.map(doc => (
    {
      id: doc.id.toString(),
      title: doc.title,
      lastOpened: new Date(doc.updated_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }),
    }
  ))

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header removed - now handled by layout */}

      {/* Search and create */}
      <div className="p-4 border-b">
        <div className="flex gap-2">
          <SearchInput 
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {/* <Button onClick={() => setCreateDocumentOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Document
          </Button> */}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-8">
          {/* Recent Documents Section */}
          <section className="bg-card rounded-lg shadow-sm">
            <div className="p-6">
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : error ? (
                <div className="text-center py-8 text-destructive">{error}</div>
              ) : documents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No documents found
                </div>
              ) : (
                <>
                  <RecentDocuments documents={recentDocuments} />
                  {hasMore && (
                    <div className="mt-4 flex justify-center">
                      <Button
                        variant="outline"
                        onClick={() => setPage(p => p + 1)}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : null}
                        Load more
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </section>
        </div>
      </div>

      <CreateDocumentDialog
        open={createDocumentOpen}
        onOpenChange={setCreateDocumentOpen}
        onCreateDocument={handleCreateDocument}
      />
    </div>
  )
}
