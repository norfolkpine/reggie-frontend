"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Loader2, Folder, File, Plus, Move, Upload, Trash2, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

// Types based on the API documentation
interface Collection {
  id: number;
  name: string;
  description?: string;
  collection_type: 'folder' | 'regulation' | 'act' | 'guideline' | 'manual';
  jurisdiction?: string;
  regulation_number?: string;
  effective_date?: string;
  sort_order: number;
  children: Collection[];
  full_path: string;
  created_at: string;
}

interface FileItem {
  uuid: string;
  title: string;
  description?: string;
  file_type: string;
  collection_order: number;
  volume_number?: number;
  part_number?: string;
}

interface CreateCollectionRequest {
  name: string;
  description?: string;
  parent_id?: number;
  collection_type: 'folder' | 'regulation' | 'act' | 'guideline' | 'manual';
  jurisdiction?: string;
  regulation_number?: string;
  effective_date?: string;
  sort_order?: number;
}

export default function CollectionsTestPage() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  
  // API Configuration - Update this to match your backend URL
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';
  const API_ENDPOINT = `${API_BASE_URL}/reggie/api/v1`;
  
  // State
  const [collections, setCollections] = useState<Collection[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [loadingData, setLoadingData] = useState(false);
  
  // Form states
  const [newCollection, setNewCollection] = useState<CreateCollectionRequest>({
    name: '',
    description: '',
    collection_type: 'folder',
    jurisdiction: '',
    regulation_number: '',
    effective_date: '',
    sort_order: 0
  });
  
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [moveTargetId, setMoveTargetId] = useState<number | null>(null);

  // Check authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Authentication Required</h1>
          <p className="text-muted-foreground">Please sign in to access this page.</p>
        </div>
      </div>
    );
  }

  // API Functions
  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    try {
      const response = await fetch(`${API_ENDPOINT}${endpoint}`, {
        ...options,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      toast({
        title: "API Error",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
      throw error;
    }
  };

  const loadCollections = async () => {
    setLoadingData(true);
    try {
      const data = await apiCall('/collections/');
      setCollections(data);
    } catch (error) {
      // Error already handled by apiCall
    } finally {
      setLoadingData(false);
    }
  };

  const loadFiles = async () => {
    setLoadingData(true);
    try {
      const data = await apiCall('/files/');
      setFiles(data);
    } catch (error) {
      // Error already handled by apiCall
    } finally {
      setLoadingData(false);
    }
  };

  const createCollection = async () => {
    try {
      const data = await apiCall('/collections/create-folder/', {
        method: 'POST',
        body: JSON.stringify(newCollection),
      });
      
      toast({
        title: "Success",
        description: `Collection "${data.name}" created successfully`,
      });
      
      setNewCollection({
        name: '',
        description: '',
        collection_type: 'folder',
        jurisdiction: '',
        regulation_number: '',
        effective_date: '',
        sort_order: 0
      });
      
      await loadCollections();
    } catch (error) {
      // Error already handled by apiCall
    }
  };

  const moveCollection = async (collectionId: number, newParentId: number | null) => {
    try {
      const data = await apiCall(`/collections/${collectionId}/move-to/`, {
        method: 'POST',
        body: JSON.stringify({ new_parent_id: newParentId }),
      });
      
      toast({
        title: "Success",
        description: data.message,
      });
      
      await loadCollections();
    } catch (error) {
      // Error already handled by apiCall
    }
  };

  const addFilesToCollection = async (collectionId: number, fileIds: string[]) => {
    try {
      const data = await apiCall(`/collections/${collectionId}/add-files/`, {
        method: 'POST',
        body: JSON.stringify({ file_ids: fileIds }),
      });
      
      toast({
        title: "Success",
        description: data.message,
      });
      
      setSelectedFiles([]);
      await loadFiles();
    } catch (error) {
      // Error already handled by apiCall
    }
  };

  const reorderFiles = async (collectionId: number, fileOrders: { file_id: string; order: number }[]) => {
    try {
      const data = await apiCall(`/collections/${collectionId}/reorder-files/`, {
        method: 'POST',
        body: JSON.stringify({ file_orders: fileOrders }),
      });
      
      toast({
        title: "Success",
        description: data.message,
      });
      
      await loadFiles();
    } catch (error) {
      // Error already handled by apiCall
    }
  };

  const uploadFilesToCollection = async () => {
    if (uploadFiles.length === 0) return;
    
    try {
      const formData = new FormData();
      uploadFiles.forEach(file => {
        formData.append('files', file);
      });
      
      if (newCollection.name) {
        formData.append('collection_name', newCollection.name);
        formData.append('collection_description', newCollection.description || '');
        formData.append('collection_type', newCollection.collection_type);
        if (newCollection.jurisdiction) formData.append('jurisdiction', newCollection.jurisdiction);
        if (newCollection.regulation_number) formData.append('regulation_number', newCollection.regulation_number);
      }
      
      const response = await fetch(`${API_ENDPOINT}/files/`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      toast({
        title: "Success",
        description: data.message,
      });
      
      setUploadFiles([]);
      await loadFiles();
      await loadCollections();
    } catch (error) {
      toast({
        title: "Upload Error",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  };

  const moveFilesToCollection = async (fileIds: string[], targetCollectionId: number | null) => {
    try {
      const data = await apiCall('/files/move-to-collection/', {
        method: 'POST',
        body: JSON.stringify({ 
          file_ids: fileIds, 
          target_collection_id: targetCollectionId 
        }),
      });
      
      toast({
        title: "Success",
        description: data.message,
      });
      
      setSelectedFiles([]);
      await loadFiles();
    } catch (error) {
      // Error already handled by apiCall
    }
  };

  // Load data on mount
  useEffect(() => {
    loadCollections();
    loadFiles();
  }, []);

  const renderCollectionTree = (collections: Collection[], level = 0) => {
    return collections.map(collection => (
      <div key={collection.id} className="ml-4">
        <div className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
          <Folder className="h-4 w-4 text-blue-500" />
          <span className="font-medium">{collection.name}</span>
          <Badge variant="outline">{collection.collection_type}</Badge>
          {collection.jurisdiction && (
            <Badge variant="secondary">{collection.jurisdiction}</Badge>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setSelectedCollection(collection)}
          >
            View
          </Button>
        </div>
        {collection.children.length > 0 && (
          <div className="ml-4 border-l-2 border-gray-200 pl-4">
            {renderCollectionTree(collection.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Hierarchical Collections API Test</h1>
        <p className="text-muted-foreground mt-2">
          Test the collections and files management API endpoints
        </p>
        <div className="mt-2 space-y-2">
          <Badge variant="outline">Authenticated as: {user.email}</Badge>
          <div className="text-xs text-muted-foreground">
            <p>API Base URL: {API_BASE_URL}</p>
            <p>API Endpoint: {API_ENDPOINT}</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="collections" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="collections">Collections</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
        </TabsList>

        <TabsContent value="collections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create New Collection</CardTitle>
              <CardDescription>Create a new folder or collection</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="Collection Name"
                  value={newCollection.name}
                  onChange={(e) => setNewCollection(prev => ({ ...prev, name: e.target.value }))}
                />
                <Select
                  value={newCollection.collection_type}
                  onValueChange={(value: any) => setNewCollection(prev => ({ ...prev, collection_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="folder">Folder</SelectItem>
                    <SelectItem value="regulation">Regulation</SelectItem>
                    <SelectItem value="act">Act</SelectItem>
                    <SelectItem value="guideline">Guideline</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Textarea
                placeholder="Description (optional)"
                value={newCollection.description}
                onChange={(e) => setNewCollection(prev => ({ ...prev, description: e.target.value }))}
              />
              <div className="grid grid-cols-3 gap-4">
                <Input
                  placeholder="Jurisdiction (optional)"
                  value={newCollection.jurisdiction}
                  onChange={(e) => setNewCollection(prev => ({ ...prev, jurisdiction: e.target.value }))}
                />
                <Input
                  placeholder="Regulation Number (optional)"
                  value={newCollection.regulation_number}
                  onChange={(e) => setNewCollection(prev => ({ ...prev, regulation_number: e.target.value }))}
                />
                <Input
                  type="date"
                  value={newCollection.effective_date}
                  onChange={(e) => setNewCollection(prev => ({ ...prev, effective_date: e.target.value }))}
                />
              </div>
              <Button onClick={createCollection} disabled={!newCollection.name}>
                <Plus className="h-4 w-4 mr-2" />
                Create Collection
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Collections Tree</CardTitle>
              <CardDescription>Hierarchical view of all collections</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingData ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <div className="space-y-2">
                  {renderCollectionTree(collections)}
                </div>
              )}
              <Button onClick={loadCollections} variant="outline" className="mt-4">
                Refresh Collections
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="files" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Files Management</CardTitle>
              <CardDescription>View and manage files</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingData ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <div className="space-y-2">
                  {files.map(file => (
                    <div key={file.uuid} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                      <input
                        type="checkbox"
                        checked={selectedFiles.includes(file.uuid)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedFiles(prev => [...prev, file.uuid]);
                          } else {
                            setSelectedFiles(prev => prev.filter(id => id !== file.uuid));
                          }
                        }}
                      />
                      <File className="h-4 w-4 text-green-500" />
                      <span className="font-medium">{file.title}</span>
                      <Badge variant="outline">{file.file_type}</Badge>
                      {file.volume_number && (
                        <Badge variant="secondary">Vol {file.volume_number}</Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <Button onClick={loadFiles} variant="outline" className="mt-4">
                Refresh Files
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload Files</CardTitle>
              <CardDescription>Upload files with optional collection creation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="Collection Name (optional)"
                  value={newCollection.name}
                  onChange={(e) => setNewCollection(prev => ({ ...prev, name: e.target.value }))}
                />
                <Select
                  value={newCollection.collection_type}
                  onValueChange={(value: any) => setNewCollection(prev => ({ ...prev, collection_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="folder">Folder</SelectItem>
                    <SelectItem value="regulation">Regulation</SelectItem>
                    <SelectItem value="act">Act</SelectItem>
                    <SelectItem value="guideline">Guideline</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Textarea
                placeholder="Collection Description (optional)"
                value={newCollection.description}
                onChange={(e) => setNewCollection(prev => ({ ...prev, description: e.target.value }))}
              />
              <div className="grid grid-cols-3 gap-4">
                <Input
                  placeholder="Jurisdiction (optional)"
                  value={newCollection.jurisdiction}
                  onChange={(e) => setNewCollection(prev => ({ ...prev, jurisdiction: e.target.value }))}
                />
                <Input
                  placeholder="Regulation Number (optional)"
                  value={newCollection.regulation_number}
                  onChange={(e) => setNewCollection(prev => ({ ...prev, regulation_number: e.target.value }))}
                />
                <Input
                  type="date"
                  value={newCollection.effective_date}
                  onChange={(e) => setNewCollection(prev => ({ ...prev, effective_date: e.target.value }))}
                />
              </div>
              <Input
                type="file"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  setUploadFiles(files);
                }}
              />
              <Button onClick={uploadFilesToCollection} disabled={uploadFiles.length === 0}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Files
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="operations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Collection Operations</CardTitle>
              <CardDescription>Move collections and manage files</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Move Collection</h4>
                  <div className="flex gap-2">
                    <Select
                      value={moveTargetId?.toString() || ''}
                      onValueChange={(value) => setMoveTargetId(value ? parseInt(value) : null)}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Select target collection" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Root Level</SelectItem>
                        {collections.map(collection => (
                          <SelectItem key={collection.id} value={collection.id.toString()}>
                            {collection.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (selectedCollection) {
                          moveCollection(selectedCollection.id, moveTargetId);
                        }
                      }}
                      disabled={!selectedCollection}
                    >
                      <Move className="h-4 w-4 mr-2" />
                      Move Collection
                    </Button>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-2">Add Files to Collection</h4>
                  <div className="flex gap-2">
                    <Select
                      value={moveTargetId?.toString() || ''}
                      onValueChange={(value) => setMoveTargetId(value ? parseInt(value) : null)}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Select target collection" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Root Level</SelectItem>
                        {collections.map(collection => (
                          <SelectItem key={collection.id} value={collection.id.toString()}>
                            {collection.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (moveTargetId && selectedFiles.length > 0) {
                          addFilesToCollection(moveTargetId, selectedFiles);
                        }
                      }}
                      disabled={!moveTargetId || selectedFiles.length === 0}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Files
                    </Button>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-2">Move Files Between Collections</h4>
                  <div className="flex gap-2">
                    <Select
                      value={moveTargetId?.toString() || ''}
                      onValueChange={(value) => setMoveTargetId(value ? parseInt(value) : null)}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Select target collection" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Root Level</SelectItem>
                        {collections.map(collection => (
                          <SelectItem key={collection.id} value={collection.id.toString()}>
                            {collection.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (selectedFiles.length > 0) {
                          moveFilesToCollection(selectedFiles, moveTargetId);
                        }
                      }}
                      disabled={selectedFiles.length === 0}
                    >
                      <Move className="h-4 w-4 mr-2" />
                      Move Files
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {selectedCollection && (
            <Card>
              <CardHeader>
                <CardTitle>Selected Collection: {selectedCollection.name}</CardTitle>
                <CardDescription>Collection details and operations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p><strong>Type:</strong> {selectedCollection.collection_type}</p>
                  <p><strong>Path:</strong> {selectedCollection.full_path}</p>
                  {selectedCollection.jurisdiction && (
                    <p><strong>Jurisdiction:</strong> {selectedCollection.jurisdiction}</p>
                  )}
                  {selectedCollection.regulation_number && (
                    <p><strong>Regulation Number:</strong> {selectedCollection.regulation_number}</p>
                  )}
                  {selectedCollection.effective_date && (
                    <p><strong>Effective Date:</strong> {selectedCollection.effective_date}</p>
                  )}
                  <p><strong>Children:</strong> {selectedCollection.children.length}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <div className="text-center text-sm text-muted-foreground">
        <p>This page demonstrates the Hierarchical Collections API endpoints</p>
        <p>All operations require authentication and proper permissions</p>
        <div className="mt-2 p-4 bg-gray-50 rounded-lg">
          <p className="font-medium">API Configuration Notes:</p>
          <ul className="text-xs space-y-1 mt-1">
            <li>• Update NEXT_PUBLIC_API_BASE_URL environment variable to match your backend</li>
            <li>• Default backend URL: http://127.0.0.1:8000</li>
            <li>• API endpoints: /reggie/api/v1/collections/ and /reggie/api/v1/files/</li>
            <li>• Ensure your backend has the collections API endpoints implemented</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
