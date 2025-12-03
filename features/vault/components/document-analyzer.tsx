"use client";

import * as React from "react";
import { TabsContent } from "@/components/ui/tabs";
import { DataGrid } from "@/src/components/data-grid/data-grid";
import { useDataGrid } from "@/hooks/use-data-grid";
import type { ColumnDef } from "@tanstack/react-table";
import type { FileCellData } from "@/src/types/data-grid";
import { Upload, Loader2, X, HelpCircle, ChevronDown, Check, Type, WrapText, Hash, Calendar, CheckSquare, List, FileText } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Column type definition
type ColumnType = 'short-text' | 'long-text' | 'number' | 'date' | 'boolean' | 'list' | 'file';

// Row data interface
interface RowData {
  id: string;
  content?: FileCellData[];
  [key: string]: any;
}

const MIN_COLUMN_SIZE = 60;
const MAX_COLUMN_SIZE = 800;

const COLUMN_TYPES: { type: ColumnType; label: string; icon: React.FC<any> }[] = [
  { type: 'short-text', label: 'Short Text', icon: Type },
  { type: 'long-text', label: 'Long Text', icon: WrapText },
  { type: 'number', label: 'Number', icon: Hash },
  { type: 'date', label: 'Date', icon: Calendar },
  { type: 'boolean', label: 'Yes/No', icon: CheckSquare },
  { type: 'list', label: 'List', icon: List },
  { type: 'file', label: 'File', icon: FileText },
];

// AddColumnMenu Component
interface AddColumnMenuProps {
  triggerRect: DOMRect;
  onClose: () => void;
  onSave: (col: { name: string; type: ColumnType; prompt: string }) => void;
  onDelete?: () => void;
  initialData?: { name: string; type: ColumnType; prompt?: string };
}

const AddColumnMenu: React.FC<AddColumnMenuProps> = ({
  triggerRect,
  onClose,
  onSave,
  onDelete,
  initialData
}) => {
  const [name, setName] = React.useState(initialData?.name || '');
  const [type, setType] = React.useState<ColumnType>(initialData?.type || 'short-text');
  const [prompt, setPrompt] = React.useState(initialData?.prompt || '');
  const [isTypeMenuOpen, setIsTypeMenuOpen] = React.useState(false);

  const selectedType = COLUMN_TYPES.find(t => t.type === type) || COLUMN_TYPES[0];

  // Calculate position
  const MENU_WIDTH = 400;
  let top = triggerRect.bottom + 8;
  let left = triggerRect.left;

  if (left + MENU_WIDTH > window.innerWidth - 10) {
    left = triggerRect.right - MENU_WIDTH;
    if (left < 10) {
      left = 10;
    }
  }

  const handleSave = () => {
    if (name) {
      onSave({ name, type, prompt });
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose}></div>
      <div 
        className="fixed bg-background rounded-xl shadow-2xl border border-border overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-50 w-[400px]"
        style={{ top, left }}
      >
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 p-1 text-muted-foreground hover:text-foreground hover:bg-accent rounded-full transition-colors z-10"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        <div className="p-5 space-y-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <HelpCircle className="w-3.5 h-3.5" />
              <label className="text-xs font-semibold">Label</label>
            </div>
            <input 
              type="text" 
              className="w-full border border-border rounded-lg px-3 py-2 text-sm text-foreground bg-background focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-muted-foreground"
              placeholder="e.g. Persons mentioned"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSave()}
            />
          </div>

          <div className="space-y-1.5 relative">
            <label className="text-xs font-semibold text-muted-foreground ml-1">Format</label>
            <button 
              onClick={() => setIsTypeMenuOpen(!isTypeMenuOpen)}
              className="w-full flex items-center justify-between border border-border bg-muted/50 hover:bg-muted rounded-lg px-3 py-2 text-sm text-foreground transition-colors focus:ring-2 focus:ring-primary outline-none"
            >
              <div className="flex items-center gap-2">
                <selectedType.icon className="w-4 h-4 text-muted-foreground" />
                <span>{selectedType.label}</span>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </button>
            
            {isTypeMenuOpen && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setIsTypeMenuOpen(false)}></div>
                <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border shadow-xl rounded-lg overflow-hidden z-30 py-1 max-h-[200px] overflow-y-auto">
                  {COLUMN_TYPES.map((t) => (
                    <button
                      key={t.type}
                      onClick={() => { setType(t.type); setIsTypeMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-accent text-sm text-foreground text-left"
                    >
                      <t.icon className="w-4 h-4 text-muted-foreground" />
                      <span>{t.label}</span>
                      {type === t.type && <Check className="w-3.5 h-3.5 ml-auto text-primary" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-muted-foreground" />
              <label className="text-xs font-semibold text-foreground">Prompt (optional)</label>
            </div>
            <Textarea 
              className="h-[120px] resize-none"
              placeholder="Describe what data to extract from the document... (optional)"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>
        </div>

        <div className={`px-5 py-3 bg-muted/50 border-t border-border flex ${initialData ? 'justify-between' : 'justify-end'} gap-3`}>
          {initialData && onDelete && (
            <button
              onClick={onDelete}
              className="flex items-center gap-2 px-3 py-2 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-lg font-medium text-xs transition-colors"
            >
              Delete
            </button>
          )}
          <Button 
            onClick={handleSave}
            disabled={!name}
            className="px-4 py-2"
          >
            {initialData ? 'Update Column' : 'Create Column'}
          </Button>
        </div>
      </div>
    </>
  );
};

export function AnalyserTabContent() {
  const [data, setData] = React.useState<RowData[]>([{ id: crypto.randomUUID() }]);
  const [isDraggingOver, setIsDraggingOver] = React.useState(false);
  const [isConverting, setIsConverting] = React.useState(false);
  const [addColumnAnchor, setAddColumnAnchor] = React.useState<DOMRect | null>(null);
  const [editingColumnId, setEditingColumnId] = React.useState<string | null>(null);
  
  const [columns, setColumns] = React.useState<ColumnDef<RowData>[]>([]);
  const [columnMetadata, setColumnMetadata] = React.useState<Record<string, { type: ColumnType; prompt: string }>>({
    content: { type: 'short-text', prompt: '' },
  });

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
            variant: "file",
            multiple: false,
          },
        },
        size: 200,
        minSize: MIN_COLUMN_SIZE,
        maxSize: MAX_COLUMN_SIZE,
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
  }, []);

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
  }, [dataGridProps.table]);

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
                <p className="text-xs text-muted-foreground">Uploading files...</p>
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


