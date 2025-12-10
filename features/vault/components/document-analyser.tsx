"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { faker } from "@faker-js/faker";
import { COLUMN_SIZE } from "./lib/data-grid-constants";
import { DataGrid } from "./data-grid/data-grid";
import { useDataGrid } from "./hooks/use-data-grid";
import { AddColumnMenu } from "./AddColumnMenu";
import type { ColumnType, ExtractionCell } from "../types";
import type { FileCellData } from "./types/data-grid";
import { Table, ChevronDown, ChevronLeft, ChevronRight, Square, Play, Zap, Cpu, Brain, Download, Upload, Loader2, AlertCircle, CheckCircle2, X, FileText, Eye, Quote } from "./Icons";
import { TabsContent } from "@/components/ui/tabs";

import { processDocumentFiles } from "./services/documentProcessingService";
import { extractColumnData } from "./services/geminiService";
import { uploadFiles } from "@/api/vault";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/components/ui/use-toast";
import { useParams } from "next/navigation";

// Column type definition

// Row data interface
interface RowData {
  id: string;
  content?: FileCellData[];
  [key: string]: any;
}

const MIN_COLUMN_SIZE = 60;
const MAX_COLUMN_SIZE = 800;

// Analysis results with quotes and reasoning
type AnalysisResults = {
  [rowId: string]: {
    [columnId: string]: ExtractionCell;
  };
};
// Processing status for each row
type ProcessingStatus = 'pending' | 'processing' | 'completed' | 'error';

interface AnalyserTabContentProps {
  projectId?: string;
  teamId?: number;
}

export function AnalyserTabContent({ projectId, teamId }: AnalyserTabContentProps = {}) {
  const params = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const currentProjectId = projectId || (params?.uuid as string);
  const [data, setData] = React.useState<RowData[]>([{ id: crypto.randomUUID() }]);
  const [isDraggingOver, setIsDraggingOver] = React.useState(false);
  const [isConverting, setIsConverting] = React.useState(false);
  const [addColumnAnchor, setAddColumnAnchor] = React.useState<DOMRect | null>(null);
  const [editingColumnId, setEditingColumnId] = React.useState<string | null>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);
  type SidebarMode = 'none' | 'document' | 'cell';
  const [sidebarMode, setSidebarMode] = React.useState<SidebarMode>('none');
  const [selectedRowId, setSelectedRowId] = React.useState<string | null>(null);
  const [selectedCell, setSelectedCell] = React.useState<{ rowIndex: number; columnId: string } | null>(null);
  const [isSidebarExpanded, setIsSidebarExpanded] = React.useState(false);  // Analysis results with quotes and reasoning
  const [analysisResults, setAnalysisResults] = React.useState<AnalysisResults>({});
  const [columns, setColumns] = React.useState<ColumnDef<RowData>[]>([]);
  const [columnMetadata, setColumnMetadata] = React.useState<Record<string, { type: ColumnType; prompt: string }>>({
    content: { type: 'short-text', prompt: '' },
  });
  
  const selectedRow = React.useMemo(() => data.find(r => r.id === selectedRowId), [data, selectedRowId]);

  // Helper function to download file from vault URL and convert to File object
  const downloadFileFromVault = React.useCallback(async (fileUrl: string, filename: string): Promise<File> => {
    try {
      const response = await fetch(fileUrl, {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error(`Failed to download file: ${response.statusText}`);
      }
      const blob = await response.blob();
      return new File([blob], filename, { type: blob.type });
    } catch (error) {
      throw new Error(`Error downloading file from vault: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, []);

  // Helper function to upload file to vault
  const uploadFileToVault = React.useCallback(async (file: File): Promise<void> => {
    if (!currentProjectId || !user) {
      console.warn('Cannot upload to vault: missing projectId or user');
      return;
    }

    try {
      await uploadFiles({
        file,
        project_uuid: currentProjectId,
        uploaded_by: user.id,
        team: teamId,
        parent_id: 0, // Upload to root folder
      });
    } catch (error) {
      console.error('Failed to upload file to vault:', error);
      toast({
        title: "Vault Upload Warning",
        description: "File added to analyzer but failed to upload to vault. You can manually upload it later.",
        variant: "default",
      });
    }
  }, [currentProjectId, user, teamId, toast]);

  // Listen for files sent from vault
  React.useEffect(() => {
    const handleVaultFileAnalyze = async (event: CustomEvent<{ file: any; projectId: string }>) => {
      const { file } = event.detail;
      
      if (!file || !file.file) {
        toast({
          title: "Error",
          description: "Invalid file data",
          variant: "destructive",
        });
        return;
      }

      try {
        // Download the file from vault
        const downloadedFile = await downloadFileFromVault(file.file, file.original_filename || file.filename || 'document');
        
        // Add to analyzer
        const fileData: FileCellData = {
          id: crypto.randomUUID(),
          name: downloadedFile.name,
          size: downloadedFile.size,
          type: downloadedFile.type,
          url: URL.createObjectURL(downloadedFile),
        };

        const newRow: RowData = {
          id: faker.string.nanoid(),
          content: [fileData],
          processingStatus: 'pending' as ProcessingStatus,
        };

        setData((prev) => {
          const hasOnlyEmptyRows = prev.every(row => {
            const content = row.content;
            return !content || (Array.isArray(content) && content.length === 0);
          });
          if (hasOnlyEmptyRows) {
            return [newRow];
          }
          return [...prev, newRow];
        });

        // Process the file
        setIsConverting(true);
        setData((prev) => prev.map((row) => 
          row.id === newRow.id 
            ? { ...row, processingStatus: 'processing' as ProcessingStatus }
            : row
        ));

        try {
          const result = await processDocumentFiles([downloadedFile]);
          if (result.success.length > 0) {
            const processedFile = result.success[0];
            setData((prev) => prev.map((row) => 
              row.id === newRow.id 
                ? { 
                    ...row, 
                    processedContent: processedFile.content,
                    processingStatus: 'completed' as ProcessingStatus,
                  }
                : row
            ));
          } else if (result.errors.length > 0) {
            setData((prev) => prev.map((row) => 
              row.id === newRow.id 
                ? { 
                    ...row, 
                    processingStatus: 'error' as ProcessingStatus,
                    errorMessage: result.errors[0].error,
                  }
                : row
            ));
          }
        } catch (error) {
          setData((prev) => prev.map((row) => 
            row.id === newRow.id 
              ? { 
                  ...row, 
                  processingStatus: 'error' as ProcessingStatus,
                  errorMessage: error instanceof Error ? error.message : 'Unknown error',
                }
              : row
          ));
        } finally {
          setIsConverting(false);
        }

        // Switch to analyser tab (triggered by parent)
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('switch-to-analyser-tab'));
        }
      } catch (error) {
        toast({
          title: "Error",
          description: `Failed to load file from vault: ${error instanceof Error ? error.message : 'Unknown error'}`,
          variant: "destructive",
        });
      }
    };

    const eventHandler = (event: Event) => {
      handleVaultFileAnalyze(event as CustomEvent<{ file: any; projectId: string }>);
    };
    window.addEventListener('vault-file-analyze', eventHandler);
    return () => {
      window.removeEventListener('vault-file-analyze', eventHandler);
    };
  }, [downloadFileFromVault, toast]);
  
  const defaultColumns = React.useMemo<ColumnDef<Record<string, any>>[]>(
    () => [
      {
        id: "content",
        accessorKey: "content" as any,
        header: "Content",
        enableResizing: true,
        meta: {
          cell: {
            variant: "auto", // Auto-detects: shows file badge for files, text input for text
            multiple: false,
          },
        },
        size: 200, // Wider to fit file badge with view/delete icons
        minSize: COLUMN_SIZE.MIN,
        maxSize: COLUMN_SIZE.MAX,
      },
    ],
    [],
  );
  
  // Get the ExtractionCell for the selected cell with additional context
  const selectedCellData = React.useMemo(() => {
    if (!selectedCell || !selectedRowId || !selectedRow) return null;
    
    const extractionCell = analysisResults[selectedRowId]?.[selectedCell.columnId];
    const metadata = columnMetadata[selectedCell.columnId];
    const column = columns.find(c => c.id === selectedCell.columnId);
    
    // Get source file name from the row's content
    const sourceFileName = Array.isArray(selectedRow.content) && selectedRow.content[0] 
      ? selectedRow.content[0].name 
      : 'Unknown document';
    
    // Get column name from the column definition
    const columnName = column && typeof column.header === 'string' 
      ? column.header 
      : selectedCell.columnId;
    
    return {
      // ExtractionCell fields
      value: extractionCell?.value || (selectedRow[selectedCell.columnId] as string) || '',
      confidence: extractionCell?.confidence || 'Medium',
      quote: extractionCell?.quote || '',
      page: extractionCell?.page || 1,
      reasoning: extractionCell?.reasoning || '',
      status: extractionCell?.status || 'needs_review',
      // Additional context
      columnName,
      sourceFileName,
      prompt: metadata?.prompt || '',
      columnId: selectedCell.columnId,
    };
  }, [selectedCell, selectedRowId, selectedRow, analysisResults, columnMetadata, columns]);

  React.useEffect(() => {
    if (columns.length === 0) {
      setColumns(defaultColumns as ColumnDef<RowData>[]);
    }
  }, [columns.length, defaultColumns]);

  const onRowAdd = React.useCallback(() => {
    setData((prev) => [...prev, { id: crypto.randomUUID() }]);
    return {
      rowIndex: data.length,
      columnId: "content",
    };
  }, [data.length]);

  const onRowsDelete = React.useCallback(async (rows: RowData[], rowIndices: number[]) => {
    setData((prev) => prev.filter((_, index) => !rowIndices.includes(index)));
  }, []);

  // Handle file uploads within cells
  const onFilesUpload = React.useCallback(async ({ files, rowIndex, columnId }: {
    files: File[];
    rowIndex: number;
    columnId: string;
  }): Promise<FileCellData[]> => {
    // Upload files to vault first (if project context is available)
    if (currentProjectId && user) {
      try {
        await Promise.all(files.map(file => uploadFileToVault(file)));
      } catch (error) {
        // Continue processing even if vault upload fails
        console.warn('Some files failed to upload to vault:', error);
      }
    }

    // Create FileCellData objects for each file
    const uploadedFiles: FileCellData[] = files.map((file) => ({
      id: crypto.randomUUID(),
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file),
    }));

    // Update the row with uploaded files
    setData((prev) => prev.map((row, idx) => 
      idx === rowIndex 
        ? { ...row, [columnId]: uploadedFiles }
        : row
    ));

    return uploadedFiles;
  }, [currentProjectId, user, uploadFileToVault]);

  // Handle file deletions within cells
  const onFilesDelete = React.useCallback(async ({ fileIds, rowIndex, columnId }: {
    fileIds: string[];
    rowIndex: number;
    columnId: string;
  }) => {
    setData((prev) => prev.map((row, idx) => {
      if (idx === rowIndex) {
        const currentFiles = row[columnId] as FileCellData[] | undefined;
        if (Array.isArray(currentFiles)) {
          const updatedFiles = currentFiles.filter(f => !fileIds.includes(f.id));
          return { ...row, [columnId]: updatedFiles.length > 0 ? updatedFiles : undefined };
        }
      }
      return row;
    }));
  }, []);

  const handleColumnAdd = () => {
    // Get the position of the + column header
    const addColumnButton = document.querySelector('[data-slot="grid-header-add-column"]');
    if (addColumnButton) {
      setEditingColumnId(null);
      setAddColumnAnchor(addColumnButton.getBoundingClientRect());
    }
  };

  const handleColumnEdit = React.useCallback((columnId: string, rect?: DOMRect) => {
    if (rect) {
      // Use the provided rect
      setEditingColumnId(columnId);
      setAddColumnAnchor(rect);
    } else {
      // Fallback: find the specific column header
      const columnHeader = document.querySelector(`[data-column-id="${columnId}"][data-slot="grid-header-cell"]`);
      if (columnHeader) {
        setEditingColumnId(columnId);
        setAddColumnAnchor(columnHeader.getBoundingClientRect());
      }
    }
  }, []);

  const handleSaveColumn = React.useCallback((colDef: { name: string; type: ColumnType; prompt: string }) => {
    const promptValue = colDef.prompt || '';
    const columnId = editingColumnId || colDef.name.toLowerCase().replace(/\s+/g, '-');

    // Map ColumnType to cell variant
    const variantMap: Record<ColumnType, string> = {
      'short-text': 'short-text',
      'long-text': 'long-text',
      'number': 'number',
      'date': 'date',
      'boolean': 'checkbox',
      'list': 'long-text',
      'file': 'file',
    };

    // Special handling for content column - preserve accessorKey
    const isContentColumn = editingColumnId === 'content';
    
    // Build the column definition - ensure it matches the structure of defaultColumns
    const newColumn: ColumnDef<RowData> = {
      id: columnId,
      accessorKey: columnId,
      header: isContentColumn ? 'Content' : colDef.name,
      enableHiding: true,
      enableSorting: true,
      enableResizing: true,
      meta: {
        cell: colDef.type === 'file' 
          ? {
              variant: "file" as const,
              multiple: isContentColumn ? false : true,
              maxFiles: isContentColumn ? 1 : 10,
              maxFileSize: 10 * 1024 * 1024, // 10MB
            }
          : {
              variant: variantMap[colDef.type] as any,
            },
      },
      size: 150,
      minSize: MIN_COLUMN_SIZE,
      maxSize: MAX_COLUMN_SIZE,
    };

    // Only add custom cell renderer for boolean type
    // For other types, let DataGridCell handle rendering based on meta.cell.variant
    if (colDef.type === 'boolean') {
      newColumn.cell = ({ getValue }: any) => (getValue() ? "✓" : "✗");
    }

    if (editingColumnId) {
      // Update existing column
      setColumns((prevColumns) => prevColumns.map(c => c.id === editingColumnId ? newColumn : c));
    } else {
      // Add new column - use functional update to ensure React recognizes the change
      setColumns((prevColumns) => [...prevColumns, newColumn]);
    }

    // Store metadata
    setColumnMetadata({
      ...columnMetadata,
      [columnId]: { type: colDef.type, prompt: promptValue }
    });

    setAddColumnAnchor(null);
    setEditingColumnId(null);
  }, [editingColumnId, columns, columnMetadata]);

  const dataGridProps = useDataGrid({
    columns,
    data,
    onDataChange: setData,
    onRowAdd,
    onRowsDelete,
    onFilesUpload,
    onFilesDelete,
    enableSearch: true,
    enablePaste: true,
    meta: {
      onColumnEdit: handleColumnEdit,
    } as any,
  });

  // Handle drag and drop
  const handleDrop = React.useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    
    const fileList = e.dataTransfer.files;
    if (!fileList || fileList.length === 0) return;

    const files = Array.from(fileList) as File[];
    if (files.length === 0) return;

    // Upload files to vault first (if project context is available)
    if (currentProjectId && user) {
      try {
        await Promise.all(files.map(file => uploadFileToVault(file)));
      } catch (error) {
        // Continue processing even if vault upload fails
        console.warn('Some files failed to upload to vault:', error);
      }
    }

    // Clear sorting so new rows appear at the bottom
    if (dataGridProps.table.getState().sorting.length > 0) {
      dataGridProps.table.setSorting([]);
    }

    setIsConverting(true);

    // Create initial rows with files
    const initialRows: RowData[] = files.map((file: File) => {
      const fileData: FileCellData = {
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file),
      };

      return {
        id: crypto.randomUUID(),
        content: [fileData],
      };
    });

    // Add rows immediately so user sees them
    // If there's only empty rows (no content), replace them instead of appending
    setData((prev) => {
      const hasOnlyEmptyRows = prev.every(row => {
        const content = row.content;
        return !content || (Array.isArray(content) && content.length === 0);
      });
      if (hasOnlyEmptyRows) {
        return initialRows;
      }
      return [...prev, ...initialRows];
    });

    setIsConverting(false);
  }, [dataGridProps.table, currentProjectId, user, uploadFileToVault]);

  const handleDragOver = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types.includes('Files')) {
      setIsDraggingOver(true);
    }
  }, []);

  const handleDragLeave = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set to false if we're leaving the main container
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    if (x <= rect.left || x >= rect.right || y <= rect.top || y >= rect.bottom) {
      setIsDraggingOver(false);
    }
  }, []);

  const handleCloseSidebar = React.useCallback(() => {
    setSidebarMode('none');
    setSelectedRowId(null);
    setSelectedCell(null);
    setIsSidebarExpanded(false);
  }, []);
    
  // Decode markdown content for display
  const decodedMarkdown = React.useMemo(() => {
    if (!selectedRow?.processedContent) return null;
    try {
      return decodeURIComponent(escape(atob(selectedRow.processedContent)));
    } catch {
      return selectedRow.processedContent;
    }
  }, [selectedRow?.processedContent]);


  return (
    <TabsContent value="analyser" className="mt-4">
      <div 
        className={`flex-1 flex flex-col min-w-0 bg-white relative ${isDraggingOver ? 'bg-indigo-50/30' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (e.dataTransfer.types.includes('Files')) {
            setIsDraggingOver(true);
          }
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.stopPropagation();
          // Only set to false if we're leaving the main container
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX;
          const y = e.clientY;
          if (x <= rect.left || x >= rect.right || y <= rect.top || y >= rect.bottom) {
            setIsDraggingOver(false);
          }
        }}
        onDrop={async (e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDraggingOver(false);
          
          const fileList = e.dataTransfer.files;
          if (!fileList || fileList.length === 0) return;

          const files = Array.from(fileList) as File[];
          if (files.length === 0) return;

          // Note: "auto" variant auto-detects file vs text based on cell value
          // No need to switch column variant - just set the file data and it will render correctly

          // Clear sorting so new rows appear at the bottom
          if (dataGridProps.table.getState().sorting.length > 0) {
            dataGridProps.table.setSorting([]);
          }

          setIsConverting(true);

          // Create initial rows with pending status
          const initialRows: RowData[] = files.map((file: File) => {
            const fileData: FileCellData = {
              id: crypto.randomUUID(),
              name: file.name,
              size: file.size,
              type: file.type,
              url: URL.createObjectURL(file),
            };

            return {
              id: faker.string.nanoid(),
              content: [fileData],
              processingStatus: 'pending' as ProcessingStatus,
            };
          });

          // Add rows immediately so user sees them
          // If there's only empty rows (no content), replace them instead of appending
          setData((prev) => {
            const hasOnlyEmptyRows = prev.every(row => {
              const content = row.content;
              // Empty if: undefined, null, or empty array
              return !content || (Array.isArray(content) && content.length === 0);
            });
            if (hasOnlyEmptyRows) {
              return initialRows;
            }
            return [...prev, ...initialRows];
          });

          // Upload files to vault first (if project context is available)
          if (currentProjectId && user) {
            try {
              await Promise.all(files.map(file => uploadFileToVault(file)));
            } catch (error) {
              // Continue processing even if vault upload fails
              console.warn('Some files failed to upload to vault:', error);
            }
          }

          // Process each file individually for real-time updates
          for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const rowId = initialRows[i].id;

            // Update status to processing
            setData((prev) => prev.map((row) => 
              row.id === rowId 
                ? { ...row, processingStatus: 'processing' as ProcessingStatus }
                : row
            ));

            try {
              // Process single file
              const result = await processDocumentFiles([file]);

              if (result.success.length > 0) {
                const processedFile = result.success[0];
                // Update row with processed content
                setData((prev) => prev.map((row) => 
                  row.id === rowId 
                    ? { 
                        ...row, 
                        processedContent: processedFile.content,
                        processingStatus: 'completed' as ProcessingStatus,
                      }
                    : row
                ));
              } else if (result.errors.length > 0) {
                // Update row with error status
                setData((prev) => prev.map((row) => 
                  row.id === rowId 
                    ? { 
                        ...row, 
                        processingStatus: 'error' as ProcessingStatus,
                        errorMessage: result.errors[0].error,
                      }
                    : row
                ));
              }
            } catch (error) {
              // Update row with error status
              setData((prev) => prev.map((row) => 
                row.id === rowId 
                  ? { 
                      ...row, 
                      processingStatus: 'error' as ProcessingStatus,
                      errorMessage: error instanceof Error ? error.message : 'Unknown error',
                    }
                  : row
              ));
            }
          }

          setIsConverting(false);
        }}
      >
        {isDraggingOver && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-indigo-50/80 backdrop-blur-sm border-2 border-indigo-400 border-dashed m-4 rounded-xl pointer-events-none">
            <div className="flex flex-col items-center">
              <Upload className="w-12 h-12 text-indigo-600 mb-2" />
              <p className="text-lg font-bold text-indigo-800">Drop files to create new rows</p>
            </div>
          </div>
        )}
        {/* Conversion Progress Overlay */}
        {isConverting && (
          <div className="absolute bottom-4 right-4 z-50 bg-white rounded-xl shadow-xl border border-indigo-100 p-4 flex items-center gap-3 animate-in slide-in-from-bottom-2 duration-200">
            <div className="bg-indigo-50 p-2 rounded-lg">
              <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">Processing Documents</p>
              <p className="text-xs text-slate-500">Converting files to markdown...</p>
            </div>
          </div>
        )}
        {/* Analysis Progress Overlay */}
        {isProcessing && !isConverting && (
          <div className="absolute bottom-4 right-4 z-50 bg-white rounded-xl shadow-xl border border-emerald-100 p-4 flex items-center gap-3 animate-in slide-in-from-bottom-2 duration-200">
            <div className="bg-emerald-50 p-2 rounded-lg">
              <Loader2 className="w-5 h-5 text-emerald-600 animate-spin" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">Running Analysis</p>
              <p className="text-xs text-slate-500">Extracting data from documents...</p>
            </div>
          </div>
        )}
        <div>
          <div className={`transition-all duration-300`}>
            <DataGrid
              {...dataGridProps}
              height={600}
              onColumnAdd={handleColumnAdd}
            />
          </div>
        </div>
      </div>

      {/* Review Sidebar - Document or Cell mode */}
      <div 
        className={`transition-all duration-300 ease-in-out border-l border-slate-200 bg-white shadow-xl relative flex ${
          sidebarMode !== 'none' 
            ? isSidebarExpanded ? 'w-[900px] translate-x-0' : 'w-[400px] translate-x-0'
            : 'w-0 translate-x-10 opacity-0 overflow-hidden'
        }`}
      >
        {sidebarMode !== 'none' && (
          <div className="w-full h-full flex">
            {/* Left Panel - Answer/Info */}
            <div className={`${isSidebarExpanded ? 'w-[400px] border-r border-slate-200' : 'w-full'} flex-shrink-0 flex flex-col bg-white`}>
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${sidebarMode === 'cell' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>
                    {sidebarMode === 'cell' ? <Eye className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                      {sidebarMode === 'cell' ? 'Cell Review' : 'Document Preview'}
                    </span>
                    <span className="text-sm font-semibold text-slate-900 truncate max-w-[200px]" title={
                      sidebarMode === 'cell' ? selectedCellData?.columnName : selectedRow?.content?.[0]?.name
                    }>
                      {sidebarMode === 'cell' ? selectedCellData?.columnName : (selectedRow?.content?.[0]?.name || 'Untitled')}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
                    className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                    title={isSidebarExpanded ? 'Collapse' : 'Expand to show document'}
                  >
                    {isSidebarExpanded ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                  </button>
                  <button 
                    onClick={handleCloseSidebar}
                    className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Body Content */}
              {sidebarMode === 'cell' && selectedCellData ? (
                <div className="flex-1 overflow-y-auto p-6">
                  {/* Source File */}
                  <div className="mb-6">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Source Document</h4>
                    <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <FileText className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-700 truncate" title={selectedCellData.sourceFileName}>{selectedCellData.sourceFileName}</span>
                    </div>
                  </div>

                  {/* Extracted Value with Confidence */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Extracted Value</h4>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        selectedCellData.confidence === 'High' ? 'bg-emerald-100 text-emerald-700' :
                        selectedCellData.confidence === 'Medium' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {selectedCellData.confidence} Confidence
                      </span>
                    </div>
                    <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
                      <p className="text-lg text-slate-900 leading-relaxed font-medium whitespace-pre-wrap">
                        {selectedCellData.value || <span className="text-slate-400 italic">No value</span>}
                      </p>
                    </div>
                  </div>

                  {/* Quote from Document */}
                  {selectedCellData.quote && (
                    <div className="mb-6">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        <span className="flex items-center gap-1">
                          <Quote className="w-3 h-3" />
                          Quote from Document
                        </span>
                      </h4>
                      <div className="p-4 bg-amber-50 rounded-lg border-l-4 border-amber-400">
                        <p className="text-sm text-slate-700 leading-relaxed italic">
                          "{selectedCellData.quote}"
                        </p>
                        {selectedCellData.page > 0 && (
                          <p className="text-xs text-slate-500 mt-2">Page {selectedCellData.page}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* AI Reasoning */}
                  {selectedCellData.reasoning && (
                    <div className="mb-6">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">AI Reasoning</h4>
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <p className="text-sm text-slate-600 leading-relaxed">
                          {selectedCellData.reasoning}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Prompt Used */}
                  {selectedCellData.prompt && (
                    <div className="mb-6">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Extraction Prompt</h4>
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <p className="text-sm text-slate-600 leading-relaxed">
                          {selectedCellData.prompt}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* View Document Button (when collapsed) */}
                  {!isSidebarExpanded && decodedMarkdown && (
                    <button
                      onClick={() => setIsSidebarExpanded(true)}
                      className="w-full py-3 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View Source Document
                    </button>
                  )}
                </div>
              ) : sidebarMode === 'document' && selectedRow ? (
                <div className="flex-1 overflow-y-auto p-6">
                  {/* Status Badge */}
                  {selectedRow.processingStatus && selectedRow.processingStatus !== 'completed' && (
                    <div className={`mb-4 px-3 py-2 rounded-lg flex items-center gap-2 text-sm ${
                      selectedRow.processingStatus === 'processing' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                      selectedRow.processingStatus === 'pending' ? 'bg-slate-50 text-slate-600 border border-slate-200' :
                      'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {selectedRow.processingStatus === 'processing' && (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Processing document...</span>
                        </>
                      )}
                      {selectedRow.processingStatus === 'pending' && (
                        <>
                          <span className="w-2 h-2 bg-slate-400 rounded-full"></span>
                          <span>Waiting to process...</span>
                        </>
                      )}
                      {selectedRow.processingStatus === 'error' && (
                        <>
                          <AlertCircle className="w-4 h-4" />
                          <span>{selectedRow.errorMessage || 'Processing failed'}</span>
                        </>
                      )}
                    </div>
                  )}

                  {/* Document Content (when not expanded) */}
                  {!isSidebarExpanded && (
                    <>
                      {decodedMarkdown ? (
                        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                          <pre className="whitespace-pre-wrap text-sm leading-relaxed text-slate-800 font-mono">
                            {decodedMarkdown}
                          </pre>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <FileText className="w-12 h-12 text-slate-200 mb-4" />
                          <p className="text-sm text-slate-500 mb-2">No content available</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ) : null}
            </div>

            {/* Right Panel - Full Document (when expanded) */}
            {isSidebarExpanded && (
              <div className="flex-1 bg-slate-100 flex flex-col overflow-y-auto">
                <div className="p-8">
                  <div className="max-w-[600px] mx-auto bg-white shadow-lg p-8">
                    {decodedMarkdown ? (
                      <pre className="whitespace-pre-wrap text-sm leading-relaxed text-slate-800 font-mono">
                        {(() => {
                          // If we have a quote to highlight (in cell mode), split and highlight
                          const quoteToHighlight = sidebarMode === 'cell' && selectedCellData?.quote;
                          if (quoteToHighlight && decodedMarkdown.includes(quoteToHighlight)) {
                            const parts = decodedMarkdown.split(quoteToHighlight);
                            return parts.map((part: string, i: number) => (
                              <React.Fragment key={i}>
                                {part}
                                {i < parts.length - 1 && (
                                  <mark 
                                    className="bg-amber-200 text-slate-900 px-0.5 rounded scroll-mt-32"
                                    ref={i === 0 ? (el) => {
                                      // Auto-scroll to first highlighted quote
                                      if (el) {
                                        setTimeout(() => {
                                          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                        }, 100);
                                      }
                                    } : undefined}
                                  >
                                    {quoteToHighlight}
                                  </mark>
                                )}
                              </React.Fragment>
                            ));
                          }
                          return decodedMarkdown;
                        })()}
                      </pre>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <FileText className="w-12 h-12 text-slate-200 mb-4" />
                        <p className="text-sm text-slate-500">No document content available</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Column Menu */}
      {addColumnAnchor && (
        <AddColumnMenu
          triggerRect={addColumnAnchor}
          onClose={() => {
            setAddColumnAnchor(null);
            setEditingColumnId(null);
          }}
          onSave={handleSaveColumn}
          modelId="gemini-2.5-flash"
          initialData={editingColumnId ? {
            name: columns.find(c => c.id === editingColumnId)?.header as string || '',
            type: columnMetadata[editingColumnId]?.type || 'text',
            prompt: columnMetadata[editingColumnId]?.prompt || '',
          } : undefined}
        />
      )}
    </TabsContent>
  );
}


