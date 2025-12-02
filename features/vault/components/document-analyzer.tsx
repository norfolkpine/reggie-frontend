"use client";

import * as React from "react";
import { TabsContent } from "@/components/ui/tabs";
import { DataGrid } from "@/src/components/data-grid/data-grid";
import { useDataGrid } from "@/hooks/use-data-grid";
import type { ColumnDef } from "@tanstack/react-table";
import type { FileCellData } from "@/src/types/data-grid";
import { Upload, Loader2 } from "lucide-react";

// Row data interface
interface RowData {
  id: string;
  content?: FileCellData[];
  [key: string]: any;
}

const MIN_COLUMN_SIZE = 60;
const MAX_COLUMN_SIZE = 800;

export function AnalyzerTabContent() {
  const [data, setData] = React.useState<RowData[]>([{ id: crypto.randomUUID() }]);
  const [isDraggingOver, setIsDraggingOver] = React.useState(false);
  const [isConverting, setIsConverting] = React.useState(false);
  
  const [columns, setColumns] = React.useState<ColumnDef<RowData>[]>([]);

  const defaultColumns = React.useMemo<ColumnDef<RowData>[]>(
    () => [
      {
        id: "content",
        accessorKey: "content",
        header: "Content",
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
    // For now, just add a simple text column
    // In a full implementation, you'd open a menu here
    const newColumnId = `column-${crypto.randomUUID().slice(0, 8)}`;
    const newColumn: ColumnDef<RowData> = {
      id: newColumnId,
      accessorKey: newColumnId,
      header: "New Column",
      meta: {
        cell: {
          variant: "short-text",
        },
      },
      size: 150,
      minSize: MIN_COLUMN_SIZE,
      maxSize: MAX_COLUMN_SIZE,
    };
    setColumns([...columns, newColumn]);
  };

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
    <TabsContent value="analyzer" className="flex-1 flex overflow-hidden m-0">
      <main className="flex-1 flex overflow-hidden relative">
        <div 
          className={`flex-1 flex flex-col min-w-0 bg-background relative ${isDraggingOver ? 'bg-primary/5' : ''}`}
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
          
          <div className="p-8">
            <div className="max-w-7xl mx-auto">
              <DataGrid
                {...dataGridProps}
                height={600}
                onColumnAdd={handleColumnAdd}
              />
            </div>
          </div>
        </div>
      </main>
    </TabsContent>
  );
}


