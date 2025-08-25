"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  Trash2,
  Search,
  MoreHorizontal,
  Download,
  Eye,
  Link as LinkIcon,
  Plus,
  Filter,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

interface FileItem {
  id: string;
  name: string;
  type: string;
  size: number;
  updatedAt: string;
  url: string;
}

interface FileManagerProps {
  projectId?: string;
  onFileSelect?: (file: FileItem) => void;
  showUpload?: boolean;
}

export function FileManager({
  projectId,
  onFileSelect,
  showUpload = true,
}: FileManagerProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Define table columns for colspan
  const columns = [
    { key: 'name', label: 'Name', width: 'w-[300px]' },
    { key: 'type', label: 'Type', width: '' },
    { key: 'size', label: 'Size', width: '' },
    { key: 'lastModified', label: 'Last Modified', width: '' },
    { key: 'actions', label: '', width: 'w-[100px]' }
  ];

  useEffect(() => {
    // TODO: Replace with actual API call to fetch files
    const fetchFiles = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock data - replace with actual API call
        const mockFiles: FileItem[] = [
          {
            id: '1',
            name: 'Document.pdf',
            type: 'pdf',
            size: 1024 * 1024 * 2.5, // 2.5MB
            updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
            url: '#',
          },
          // Add more mock files as needed
        ];
        
        setFiles(mockFiles);
      } catch (error) {
        console.error('Error fetching files:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, [projectId]);

  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handlePreview = (file: FileItem) => {
    if (onFileSelect) {
      onFileSelect(file);
    }
    // TODO: Implement file preview logic
    console.log('Preview file:', file);
  };

  const handleDownload = (file: FileItem) => {
    // TODO: Implement download logic
    console.log('Download file:', file);
  };

  const handleDelete = (fileId: string) => {
    // TODO: Implement delete logic
    console.log('Delete file:', fileId);
    setFiles(files.filter((file) => file.id !== fileId));
  };

  const handleUpload = () => {
    // TODO: Implement upload logic
    console.log('Upload files');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search files..."
              className="w-full pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" /> Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuCheckboxItem 
                checked={true}
                onCheckedChange={() => {}}
              >
                Show all files
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem 
                checked={true}
                onCheckedChange={() => {}}
              >
                PDF files
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem 
                checked={true}
                onCheckedChange={() => {}}
              >
                Documents
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem 
                checked={true}
                onCheckedChange={() => {}}
              >
                Images
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center gap-2">
          {showUpload && (
            <Button onClick={handleUpload}>
              <Plus className="mr-2 h-4 w-4" /> Upload
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Last Modified</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredFiles.length > 0 ? (
              filteredFiles.map((file) => (
                <TableRow key={file.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <span>{file.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{file.type.toUpperCase()}</Badge>
                  </TableCell>
                  <TableCell>{formatFileSize(file.size)}</TableCell>
                  <TableCell>
                    {formatDistanceToNow(new Date(file.updatedAt), { addSuffix: true })}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handlePreview(file)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDownload(file)}>
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <LinkIcon className="mr-2 h-4 w-4" />
                          Copy Link
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDelete(file.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No files found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
