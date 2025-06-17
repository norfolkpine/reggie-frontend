"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Database,
  Plus,
  Search,
  MoreHorizontal,
  FileText,
  Calendar,
  Info,
  Trash2,
  Edit,
  Loader,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { KnowledgeBaseDetail } from "./knowledge-base-detail";
import { KnowledgeBaseForm } from "./knowledge-base-form";
import type { KnowledgeBase, KnowledgeTypeEnum } from "@/types/knowledge-base";
import { useToast } from "@/components/ui/use-toast";
import {
  getKnowledgeBases,
  createKnowledgeBase,
  updateKnowledgeBase,
  deleteKnowledgeBase,
} from "@/api/knowledge-bases";
import { KnowledgeBase as ApiKnowledgeBase } from "@/types/api";

// Helper function to convert API KnowledgeBase to local KnowledgeBase format
const apiToLocalKnowledgeBase = (apiKB: ApiKnowledgeBase): KnowledgeBase => {
  return {
    id: apiKB.id,
    name: apiKB.name,
    description: apiKB.description || "",
    knowledge_type: apiKB.knowledge_type as KnowledgeTypeEnum,
    path: apiKB.path,
    unique_code: apiKB.unique_code,
    knowledgebase_id: apiKB.knowledgebase_id,
    vector_table_name: apiKB.vector_table_name,
    chunk_size: apiKB.chunk_size,
    chunk_overlap: apiKB.chunk_overlap,
    created_at: apiKB.created_at,
    updated_at: apiKB.updated_at,
    model_provider: apiKB.model_provider
  }
}

interface KnowledgeBaseCardProps {
  kb: KnowledgeBase
  onView: (id: string) => void
  onEdit: (kb: KnowledgeBase) => void
  onDelete: (id: number) => void
}

function KnowledgeBaseCard({ kb, onView, onEdit, onDelete }: KnowledgeBaseCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <Card key={kb.id} className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle>{kb.name}</CardTitle>
        <CardDescription>{kb.description || ""}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center text-sm text-muted-foreground">
          <FileText className="h-4 w-4 mr-1" />
          <span>Type: {kb.knowledge_type}</span>
        </div>
        <div className="flex items-center text-sm text-muted-foreground mt-1">
          <Calendar className="h-4 w-4 mr-1" />
          <span>Updated {formatDate(kb.updated_at)}</span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm" onClick={() => onView(kb.id.toString())}>
          <Info className="h-4 w-4 mr-2" />
          View Details
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(kb)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(kb.id)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  )
}

export function KnowledgeBaseManager() {
  const { toast } = useToast();
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedKnowledgeBaseId, setSelectedKnowledgeBaseId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('kb_selected_kb_id') || null;
    }
    return null;
  });
  const [knowledgeBaseToEdit, setKnowledgeBaseToEdit] =
    useState<KnowledgeBase | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMorePages, setHasMorePages] = useState(true);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const fetchKnowledgeBases = useCallback(
    async (page: number, append: boolean = false) => {
      if (page === 1) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      setError(null);

      try {
        const response = await getKnowledgeBases(page);
        const localKBs = response.results.map(apiToLocalKnowledgeBase);

        setKnowledgeBases((prev) => {
          if (append) {
            return [...prev, ...localKBs];
          }
          return localKBs;
        });

        setHasMorePages(!!response.next);
      } catch (error) {
        console.error("Failed to fetch knowledge bases:", error);
        setError("Failed to fetch knowledge bases");
        toast({
          title: "Error",
          description: "Failed to fetch knowledge bases",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [toast]
  );

  // Set up intersection observer for infinite scrolling
  useEffect(() => {
    if (!searchQuery) {
      // Don't use infinite scroll when searching
      const observer = new IntersectionObserver(
        (entries) => {
          if (
            entries[0].isIntersecting &&
            hasMorePages &&
            !isLoadingMore &&
            !isLoading
          ) {
            setCurrentPage((prevPage) => prevPage + 1);
          }
        },
        { threshold: 0.5 }
      );

      observerRef.current = observer;

      if (loadMoreRef.current) {
        observer.observe(loadMoreRef.current);
      }

      return () => {
        if (observerRef.current) {
          observerRef.current.disconnect();
        }
      };
    }
  }, [hasMorePages, isLoadingMore, isLoading, searchQuery]);

  // Fetch knowledge bases when page changes
  useEffect(() => {
    if (currentPage === 1) {
      fetchKnowledgeBases(1, false);
    } else {
      fetchKnowledgeBases(currentPage, true);
    }
  }, [currentPage, fetchKnowledgeBases]);

  // Reset pagination when search query changes
  useEffect(() => {
    setCurrentPage(1);
    // Only fetch if we're not in search mode - search is handled by the filtered array
    if (searchQuery) {
      fetchKnowledgeBases(1, false);
    }
  }, [searchQuery]);

  const refreshData = useCallback(() => {
    setCurrentPage(1);
    fetchKnowledgeBases(1, false);
  }, [fetchKnowledgeBases]);

  const handleCreateKnowledgeBase = async (data: Partial<KnowledgeBase>) => {
    setIsSubmitting(true);
    try {
    
      // Close dialog first to prevent UI jumps during refresh
      setIsCreateDialogOpen(false);

      toast({
        title: "Success",
        description: "Knowledge base created successfully",
      });

      // Refresh the entire list to get the latest data
      refreshData();
    } catch (error) {
      console.error("Failed to create knowledge base:", error);
      toast({
        title: "Error",
        description: "Failed to create knowledge base",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditKnowledgeBase = async (data: Partial<KnowledgeBase>) => {
    if (!knowledgeBaseToEdit) return

    setIsSubmitting(true)
    try {
      // Convert local format to API format
      const apiData = {
        name: data.name,
        description: data.description,
        model_provider: data.model_provider,
      } as Omit<ApiKnowledgeBase, "id" | "created_at" | "updated_at">

      const response = await updateKnowledgeBase(knowledgeBaseToEdit.id, apiData)

      setIsEditDialogOpen(false)
      setKnowledgeBaseToEdit(null)

      toast({
        title: "Success",
        description: "Knowledge base updated successfully",
      })

      // If we're in detail view and the edited KB is the currently selected one,
      // we need to refresh to see the changes
      if (selectedKnowledgeBaseId === knowledgeBaseToEdit.id.toString()) {
        refreshData()
      } else {
        // Otherwise just update the knowledge base in the list
        const updatedKb = apiToLocalKnowledgeBase(response)
        setKnowledgeBases((prevKbs) =>
          prevKbs.map((kb) =>
            kb.id === knowledgeBaseToEdit.id ? updatedKb : kb
          )
        )
      }
    } catch (error) {
      console.error("Failed to update knowledge base:", error)
      toast({
        title: "Error",
        description: "Failed to update knowledge base",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteKnowledgeBase = async (kbId: number) => {
    try {
      await deleteKnowledgeBase(kbId)

      // If the deleted KB was selected, clear the selection
      if (selectedKnowledgeBaseId === kbId.toString()) {
        setSelectedKnowledgeBaseId(null)
      }

      toast({
        title: "Success",
        description: "Knowledge base deleted successfully",
      })

      // Refresh the data after deletion
      refreshData()
    } catch (error) {
      console.error("Failed to delete knowledge base:", error)
      toast({
        title: "Error",
        description: "Failed to delete knowledge base",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (kb: KnowledgeBase) => {
    setKnowledgeBaseToEdit(kb);
    setIsEditDialogOpen(true);
  };

  const filteredKnowledgeBases = knowledgeBases.filter(
    (kb) =>
      kb.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (kb.description || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Persist selectedKnowledgeBaseId in localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (selectedKnowledgeBaseId) {
        localStorage.setItem('kb_selected_kb_id', selectedKnowledgeBaseId);
      } else {
        localStorage.removeItem('kb_selected_kb_id');
      }
    }
  }, [selectedKnowledgeBaseId]);

  // If a knowledge base is selected, show its detail view
  if (selectedKnowledgeBaseId) {
    const selectedKb =
      knowledgeBases.find((kb) => kb.id.toString() === selectedKnowledgeBaseId) || null;

    return (
      <>
        <KnowledgeBaseDetail
          knowledgeBaseId={selectedKnowledgeBaseId}
          knowledgeBaseCode={selectedKb?.knowledgebase_id!}
          knowledgeBase={selectedKb}
          onBack={() => setSelectedKnowledgeBaseId(null)}
          onEdit={() => {
            if (selectedKb) {
              openEditDialog(selectedKb);
            }
          }}
        />
        {/* Edit Knowledge Base Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Knowledge Base</DialogTitle>
            </DialogHeader>
            {knowledgeBaseToEdit && (
              <KnowledgeBaseForm
                knowledgeBase={knowledgeBaseToEdit}
                onSubmit={handleEditKnowledgeBase}
                onCancel={() => {
                  setIsEditDialogOpen(false);
                  setKnowledgeBaseToEdit(null);
                }}
                isSubmitting={isSubmitting}
              />
            )}
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Knowledge Bases</h2>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Knowledge Base
        </Button>
      </div>

      <div className="relative">
        <Input
          placeholder="Search knowledge bases..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {error ? (
        <div className="text-center py-10">
          <Database className="h-12 w-12 mx-auto text-destructive opacity-50" />
          <h3 className="mt-4 text-lg font-medium text-destructive">{error}</h3>
          <Button className="mt-4" onClick={() => refreshData()}>
            Retry
          </Button>
        </div>
      ) : isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-5 bg-muted rounded w-1/2"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-muted rounded w-full mb-2"></div>
                <div className="h-4 bg-muted rounded w-5/6"></div>
              </CardContent>
              <CardFooter>
                <div className="h-4 bg-muted rounded w-1/3"></div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : filteredKnowledgeBases.length === 0 ? (
        <div className="text-center py-10">
          <Database className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
          <h3 className="mt-4 text-lg font-medium">No knowledge bases found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {searchQuery
              ? "Try a different search term"
              : "Create your first knowledge base to get started"}
          </p>
          {!searchQuery && (
            <Button
              className="mt-4"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Knowledge Base
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredKnowledgeBases.map((kb) => (
              <KnowledgeBaseCard
                key={kb.id}
                kb={kb}
                onView={setSelectedKnowledgeBaseId}
                onEdit={openEditDialog}
                onDelete={handleDeleteKnowledgeBase}
              />
            ))}
          </div>

          {/* Load more section */}
          {!searchQuery && hasMorePages && (
            <div ref={loadMoreRef} className="flex justify-center py-4">
              {isLoadingMore ? (
                <div className="flex items-center space-x-2">
                  <Loader className="h-4 w-4 animate-spin" />
                  <span>Loading more...</span>
                </div>
              ) : (
                <div className="h-4" />
              )}
            </div>
          )}
        </div>
      )}

      {/* Create Knowledge Base Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:min-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Knowledge Base</DialogTitle>
          </DialogHeader>
          <KnowledgeBaseForm
            onSubmit={handleCreateKnowledgeBase}
            onCancel={() => setIsCreateDialogOpen(false)}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
