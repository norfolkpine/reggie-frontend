"use client";

import * as React from "react";
import { TabsContent } from "@/components/ui/tabs";
import { DataGrid } from "@/src/components/data-grid/data-grid";
import { useDataGrid } from "@/hooks/use-data-grid";
import type { ColumnDef } from "@tanstack/react-table";
import type { FileCellData } from "@/src/types/data-grid";
import { Upload, Loader2, ChevronDown, Play, Square, Brain, Cpu, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { processDocumentFiles } from "../services/documentProcessingService";
import { extractColumnData, type ExtractionCell } from "../services/extractionService";
import { COLUMN_SIZE } from "@/lib/data-grid-constants";
import { AddColumnMenu } from "./add-column-menu";

// Column type definition
type ColumnType = 'short-text' | 'long-text' | 'number' | 'date' | 'boolean' | 'list' | 'file';

// Processing status for each row
type ProcessingStatus = 'pending' | 'processing' | 'completed' | 'error';

// Analysis results with quotes and reasoning
type AnalysisResults = {
  [rowId: string]: {
    [columnId: string]: ExtractionCell;
  };
};

// Available Models
const MODELS = [
  { id: 'gemini-3-pro-preview', name: 'Gemini 3 Pro', description: 'Deepest Reasoning', icon: Brain },
  { id: 'gemini-2.5-pro-preview', name: 'Gemini 2.5 Pro', description: 'Balanced', icon: Cpu },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', description: 'Fastest', icon: Zap },
];

// Row data interface
interface RowData {
  id: string;
  content?: FileCellData[];
  processedContent?: string; // Base64 encoded markdown from document processing
  processingStatus?: ProcessingStatus;
  errorMessage?: string;
  [key: string]: any;
}

export function AnalyserTabContent() {
  const [data, setData] = React.useState<RowData[]>([{ id: crypto.randomUUID() }]);
  const [isDraggingOver, setIsDraggingOver] = React.useState(false);
  const [isConverting, setIsConverting] = React.useState(false);
  const [addColumnAnchor, setAddColumnAnchor] = React.useState<DOMRect | null>(null);
  const [editingColumnId, setEditingColumnId] = React.useState<string | null>(null);
  
  // Model and processing state
  const [selectedModel, setSelectedModel] = React.useState<string>(MODELS[0].id);
  const [isModelMenuOpen, setIsModelMenuOpen] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const processingAbortRef = React.useRef(false);
  
  // Analysis results
  const [analysisResults, setAnalysisResults] = React.useState<AnalysisResults>({});
  
  const [columns, setColumns] = React.useState<ColumnDef<RowData>[]>([]);
  const [columnMetadata, setColumnMetadata] = React.useState<Record<string, { type: ColumnType; prompt: string }>>({
    content: { type: 'short-text', prompt: '' },
  });
  
  const currentModel = MODELS.find(m => m.id === selectedModel) || MODELS[0];

  const defaultColumns = React.useMemo<ColumnDef<RowData>[]>(
    () => [
      {
        id: "content",
        accessorKey: "content",
        header: "Content",
        enableHiding: true,
        enableSorting: true,
        meta: {
          cell: {
            variant: "auto" as any, // Auto-detects: shows file badge for files, text input for text
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

  React.useEffect(() => {
    if (columns.length === 0) {
      setColumns(defaultColumns);
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
    // Note: "auto" variant auto-detects file vs text based on cell value
    // No need to switch column variant - just set the file data and it will render correctly

    // Create FileCellData objects for each file
    const uploadedFiles: FileCellData[] = files.map((file) => ({
      id: crypto.randomUUID(),
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file),
    }));

    // Process files for content column (document conversion)
    if (columnId === 'content' && files.length > 0) {
      setIsConverting(true);
      
      try {
        const result = await processDocumentFiles(files);
        
        if (result.success.length > 0) {
          const processedFile = result.success[0];
          // Update row with processed content
          setData((prev) => prev.map((row, idx) => 
            idx === rowIndex 
              ? { 
                  ...row, 
                  processedContent: processedFile.content,
                  processingStatus: 'completed' as ProcessingStatus,
                }
              : row
          ));
        } else if (result.errors.length > 0) {
          setData((prev) => prev.map((row, idx) => 
            idx === rowIndex 
              ? { 
                  ...row, 
                  processingStatus: 'error' as ProcessingStatus,
                  errorMessage: result.errors[0].error,
                }
              : row
          ));
        }
      } catch (error) {
        setData((prev) => prev.map((row, idx) => 
          idx === rowIndex 
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
    }

    return uploadedFiles;
  }, []);

  // Handle file deletions within cells
  const onFilesDelete = React.useCallback(async ({ fileIds, rowIndex, columnId }: {
    fileIds: string[];
    rowIndex: number;
    columnId: string;
  }) => {
    // Clear processed content when file is deleted from content column
    if (columnId === 'content') {
      setData((prev) => prev.map((row, idx) => 
        idx === rowIndex 
          ? { 
              ...row, 
              processedContent: undefined,
              processingStatus: undefined,
              errorMessage: undefined,
            }
          : row
      ));
    } else {
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
    }
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

    // Special handling for content column - preserve accessorKey and always use "auto" variant
    const isContentColumn = editingColumnId === 'content';
    
    // Build the column definition - ensure it matches the structure of defaultColumns
    const newColumn: ColumnDef<RowData> = {
      id: columnId,
      accessorKey: columnId,
      header: isContentColumn ? 'Content' : colDef.name,
      enableHiding: true,
      enableSorting: true,
      meta: {
        cell: isContentColumn
          ? {
              variant: "auto" as any, // Content column always uses auto variant
              multiple: false,
            }
          : colDef.type === 'file' 
          ? {
              variant: "file" as const,
              multiple: true,
              maxFiles: 10,
              maxFileSize: 10 * 1024 * 1024, // 10MB
            }
          : {
              variant: variantMap[colDef.type] as any,
            },
      },
      size: COLUMN_SIZE.DEFAULT,
      minSize: COLUMN_SIZE.MIN,
      maxSize: COLUMN_SIZE.MAX,
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
        id: crypto.randomUUID(),
        content: [fileData],
        processingStatus: 'pending' as ProcessingStatus,
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
  }, [dataGridProps.table]);

  // Process cells using prompts and processed document content
  const handleRunAnalysis = React.useCallback(async () => {
    processingAbortRef.current = false;
    setIsProcessing(true);

    // Get all columns except the first one (content column)
    const processingColumns = columns.slice(1);

    // Process each row
    for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
      // Check if processing was aborted
      if (processingAbortRef.current) {
        break;
      }

      const row = data[rowIndex];
      
      // Skip rows that are still processing or had errors
      if (row.processingStatus === 'processing' || row.processingStatus === 'pending') {
        continue;
      }

      // Skip if no processed content
      if (!row.processedContent) {
        continue;
      }

      // Create a DocumentFile-like object for extractColumnData
      const documentFile = {
        id: row.id,
        name: Array.isArray(row.content) && row.content[0] ? row.content[0].name : 'document',
        type: 'text/markdown',
        size: row.processedContent.length,
        content: row.processedContent, // Already base64
        mimeType: 'text/markdown',
      };

      // Process each column for this row
      for (const column of processingColumns) {
        // Check if processing was aborted
        if (processingAbortRef.current) {
          break;
        }

        const columnId = column.id as string;
        const metadata = columnMetadata[columnId];

        if (!metadata?.prompt) continue;

        // Set loading indicator before processing
        setData(prevData => {
          const newData = [...prevData];
          newData[rowIndex] = {
            ...newData[rowIndex],
            [columnId]: '__LOADING__'
          };
          return newData;
        });

        // Create a Column object for extractColumnData
        const columnForExtraction = {
          id: columnId,
          name: typeof column.header === 'string' ? column.header : columnId,
          type: metadata.type,
          prompt: metadata.prompt,
          status: 'extracting' as const,
        };

        try {
          // Call extractColumnData to get structured result
          const extractionResult = await extractColumnData(
            documentFile,
            columnForExtraction,
            selectedModel
          );

          // Store the full extraction result for future use
          setAnalysisResults(prev => ({
            ...prev,
            [row.id]: {
              ...prev[row.id],
              [columnId]: extractionResult
            }
          }));

          // Update the cell value in the data grid
          setData(prevData => {
            const newData = [...prevData];
            newData[rowIndex] = {
              ...newData[rowIndex],
              [columnId]: extractionResult.value
            };
            return newData;
          });
        } catch (error) {
          console.error(`Failed to process row ${rowIndex}, column ${columnId}:`, error);
          // On error, clear the loading indicator
          setData(prevData => {
            const newData = [...prevData];
            newData[rowIndex] = {
              ...newData[rowIndex],
              [columnId]: ''
            };
            return newData;
          });
        }
      }
    }

    setIsProcessing(false);
  }, [data, columns, columnMetadata, selectedModel]);

  const handleStopProcessing = React.useCallback(() => {
    processingAbortRef.current = true;
    setIsProcessing(false);
  }, []);

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

  return (
    <TabsContent value="analyser" className="mt-4">
      <div className="bg-card text-foreground rounded-md">
        {/* Header with Model Selector and Run Analysis Button */}
        <div className="border-b border-border px-4 py-3 flex items-center justify-between bg-card">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold text-foreground">Document Analyser</h3>
          </div>
          <div className="flex items-center gap-3">
            {/* Model Selector */}
            <div className="relative">
              <button 
                onClick={() => !isProcessing && setIsModelMenuOpen(!isModelMenuOpen)}
                disabled={isProcessing}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 bg-muted text-foreground rounded-md border border-border transition-all text-xs font-semibold",
                  !isProcessing ? 'hover:bg-muted/80 active:scale-95' : 'opacity-60 cursor-not-allowed'
                )}
              >
                <div className="flex items-center gap-2">
                  <currentModel.icon className="w-3.5 h-3.5" />
                  <span>{currentModel.name}</span>
                </div>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>
              
              {isModelMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsModelMenuOpen(false)}></div>
                  <div className="absolute right-0 top-full mt-2 w-56 bg-background rounded-xl shadow-xl border border-border p-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                    {MODELS.map(model => (
                      <button
                        key={model.id}
                        onClick={() => {
                          setSelectedModel(model.id);
                          setIsModelMenuOpen(false);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 transition-colors text-xs",
                          selectedModel === model.id ? 'bg-primary/10 text-primary' : 'hover:bg-accent text-foreground'
                        )}
                      >
                        <div className={cn(
                          "p-1.5 rounded-md",
                          selectedModel === model.id ? 'bg-background shadow-sm' : 'bg-muted'
                        )}>
                          <model.icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold">{model.name}</div>
                          <div className="text-[10px] opacity-70">{model.description}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Run / Stop Button */}
            {isProcessing ? (
              <Button
                onClick={handleStopProcessing}
                variant="destructive"
                size="sm"
                className="gap-2"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                Stop
              </Button>
            ) : (
              <Button
                onClick={handleRunAnalysis}
                disabled={data.length === 0 || columns.length <= 1}
                size="sm"
                className="gap-2"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Run Analysis
              </Button>
            )}
          </div>
        </div>

        <div 
          className={`flex-1 flex flex-col min-w-0 bg-card relative ${isDraggingOver ? 'bg-primary/5' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isDraggingOver && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-primary/10 backdrop-blur-sm border-2 border-primary border-dashed m-4 rounded-xl pointer-events-none">
              <div className="flex flex-col items-center">
                <Upload className="w-12 h-12 text-primary mb-2" />
                <p className="text-lg font-bold text-primary">Drop files to create new rows</p>
              </div>
            </div>
          )}
          
          {/* Conversion Progress Overlay */}
          {isConverting && (
            <div className="absolute bottom-4 right-4 z-50 bg-card rounded-xl shadow-xl border border-border p-4 flex items-center gap-3 animate-in slide-in-from-bottom-2 duration-200">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Processing Documents</p>
                <p className="text-xs text-muted-foreground">Converting files to markdown...</p>
              </div>
            </div>
          )}

          {/* Analysis Progress Overlay */}
          {isProcessing && !isConverting && (
            <div className="absolute bottom-4 right-4 z-50 bg-card rounded-xl shadow-xl border border-border p-4 flex items-center gap-3 animate-in slide-in-from-bottom-2 duration-200">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Running Analysis</p>
                <p className="text-xs text-muted-foreground">Extracting data from documents...</p>
              </div>
            </div>
          )}
          
          <div >
            <div>
              <DataGrid
                {...dataGridProps}
                height={600}
                onColumnAdd={handleColumnAdd}
              />
            </div>
          </div>
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
            modelId={selectedModel}
            initialData={editingColumnId ? {
              name: columns.find(c => c.id === editingColumnId)?.header as string || '',
              type: columnMetadata[editingColumnId]?.type || 'short-text',
              prompt: columnMetadata[editingColumnId]?.prompt || '',
            } : undefined}
          />
        )}
      </div>
    </TabsContent>
  );
}


