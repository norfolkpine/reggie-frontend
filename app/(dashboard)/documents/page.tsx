"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, Search, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { RecentDocuments } from "./_components/recent-documents";
import { TemplateGallery } from "./_components/template-gallery";
import { getPaginatedDocuments } from "@/api/documents";
import { Document } from "@/types/api";

export default function DocumentListPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  // Mock data for templates
  const templates = [
    {
      id: "blank",
      title: "Blank document",
      category: "",
      thumbnail: "",
    },
    {
      id: "letter",
      title: "Letter",
      category: "Spearmint",
      thumbnail: "",
    },
    {
      id: "resume-serif",
      title: "Resume",
      category: "Serif",
      thumbnail: "",
    },
    {
      id: "resume-coral",
      title: "Resume",
      category: "Coral",
      thumbnail: "",
    },
    {
      id: "project-proposal",
      title: "Project proposal",
      category: "Tropic",
      thumbnail: "",
    },
    {
      id: "brochure",
      title: "Brochure",
      category: "Geometric",
      thumbnail: "",
    },
    {
      id: "report",
      title: "Report",
      category: "Luxe",
      thumbnail: ""
    },
  ]

  useEffect(() => {
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

    loadDocuments();
  }, [page, searchQuery]);

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
      {/* Header */}
      <div className="p-4 border-b flex justify-between items-center">
        <h1 className="text-xl font-medium">Documents</h1>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-8">
          {/* Template Gallery Section */}
          <section className="space-y-4">
            <TemplateGallery templates={templates} />
          </section>

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
    </div>
  )
}
