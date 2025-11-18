"use client";

import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Download, X } from 'lucide-react';
import { VaultFile } from '../types/vault';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure PDF.js worker
if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`
}

interface FilePreviewDialogProps {
  file: VaultFile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface PDFViewerProps {
  file: string;
  pageNumber?: number;
  onPageChange?: (page: number) => void;
  scale?: number;
  onScaleChange?: (scale: number) => void;
  onDocumentLoad?: (data: { numPages: number }) => void;
}

const PDFViewer = forwardRef<any, PDFViewerProps>(({ 
  file, 
  pageNumber: externalPageNumber,
  onPageChange,
  scale: externalScale,
  onScaleChange,
  onDocumentLoad,
}, ref) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [rotation, setRotation] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentPageNumber = externalPageNumber !== undefined ? externalPageNumber : pageNumber;
  const currentScale = externalScale !== undefined ? externalScale : scale;

  useEffect(() => {
    if (externalPageNumber !== undefined && externalPageNumber !== pageNumber) {
      setPageNumber(externalPageNumber);
    }
  }, [externalPageNumber]);

  useEffect(() => {
    if (externalScale !== undefined && externalScale !== scale) {
      setScale(externalScale);
    }
  }, [externalScale]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    const initialPage = externalPageNumber !== undefined ? externalPageNumber : 1;
    setPageNumber(initialPage);
    setLoading(false);
    setError(null);
    if (onDocumentLoad) {
      onDocumentLoad({ numPages });
    }
  };


  const onDocumentLoadError = (error: Error) => {
    setError('Failed to load PDF. Please check the URL or file.');
    setLoading(false);
    console.error('PDF load error:', error);
  };

  useImperativeHandle(ref, () => ({
    getPageNumber: () => currentPageNumber,
    getNumPages: () => numPages,
    getScale: () => currentScale,
    goToPage: (page: number) => {
      if (onPageChange) {
        onPageChange(page);
      } else {
        setPageNumber(page);
      }
    }
  }));

  return (
    <div className="flex flex-col h-full w-full bg-gray-50">
      <div className="flex-1 overflow-auto flex justify-center items-start p-6">
        {error && (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <X className="h-12 w-12 text-destructive mb-4" />
            <p className="text-destructive">{error}</p>
            <p className="text-sm text-muted-foreground mt-2">Please try a different PDF file or URL</p>
          </div>
        )}

        {!error && (
          <div className="flex justify-center items-center min-h-full">
            <Document
              file={file}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={
                <div className="flex flex-col items-center justify-center p-12">
                  <div className="w-12 h-12 border-4 border-gray-300 border-t-primary rounded-full animate-spin"></div>
                  <p className="mt-4 text-muted-foreground">Loading PDF...</p>
                </div>
              }
              className="flex justify-center"
            >
              <div className="relative inline-block">
                <Page
                  pageNumber={currentPageNumber}
                  scale={currentScale}
                  rotate={rotation}
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                  className="shadow-lg rounded"
                  loading={
                    <div className="flex items-center justify-center p-12">
                      <div className="w-6 h-6 border-3 border-gray-300 border-t-primary rounded-full animate-spin"></div>
                    </div>
                  }
                />
              </div>
            </Document>
          </div>
        )}
      </div>
    </div>
  );
});

PDFViewer.displayName = 'PDFViewer';

export function FilePreviewDialog({ file, open, onOpenChange }: FilePreviewDialogProps) {
  const [pageNumber, setPageNumber] = useState(1);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [scale, setScale] = useState(1.0);
  const pdfViewerRef = useRef<any>(null);

  useEffect(() => {
    if (open && file) {
      setPageNumber(1);
      setScale(1.0);
      setNumPages(null);
    }
  }, [open, file]);

  const handleDocumentLoad = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const handleDownload = () => {
    if (file?.file) {
      const a = document.createElement('a');
      a.href = file.file;
      a.download = file.original_filename || 'download';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const isPDF = file?.type === 'application/pdf' || file?.filename?.toLowerCase().endsWith('.pdf') || file?.original_filename?.toLowerCase().endsWith('.pdf');

  if (!file) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] w-full h-[95vh] p-0 flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">
              {file.original_filename || file.filename || 'File Preview'}
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={handleDownload}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {isPDF && file.file ? (
          <>
            {/* Toolbar */}
            <div className="flex items-center justify-between px-6 py-3 border-b bg-background">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">PDF Viewer</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPageNumber(prev => Math.max(1, prev - 1))}
                  disabled={pageNumber <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded-md">
                  <input
                    type="number"
                    min="1"
                    max={numPages || 1}
                    value={pageNumber}
                    onChange={(e) => {
                      const page = parseInt(e.target.value, 10);
                      if (page >= 1 && page <= (numPages || 1)) {
                        setPageNumber(page);
                      }
                    }}
                    className="w-12 px-2 py-1 text-sm text-center bg-background border rounded focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <span className="text-sm text-muted-foreground">/</span>
                  <span className="text-sm min-w-[30px] text-center">{numPages || '--'}</span>
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPageNumber(prev => Math.min(numPages || 1, prev + 1))}
                  disabled={pageNumber >= (numPages || 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-2 px-2 py-1 bg-muted rounded-md ml-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setScale(prev => Math.max(0.5, prev - 0.25))}
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <span className="text-sm min-w-[50px] text-center">{Math.round(scale * 100)}%</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setScale(prev => Math.min(3.0, prev + 0.25))}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* PDF Viewer */}
            <div className="flex-1 overflow-hidden">
              <PDFViewer
                ref={pdfViewerRef}
                file={file.file}
                pageNumber={pageNumber}
                onPageChange={setPageNumber}
                scale={scale}
                onScaleChange={setScale}
                onDocumentLoad={handleDocumentLoad}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 overflow-auto p-6 flex items-center justify-center">
            {file.file ? (
              file.type?.startsWith('image/') ? (
                <img
                  src={file.file}
                  alt={file.original_filename || 'Preview'}
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-muted-foreground">
                  <X className="h-16 w-16 mb-4" />
                  <p>Preview not available for this file type</p>
                  <Button variant="outline" className="mt-4" onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-2" />
                    Download File
                  </Button>
                </div>
              )
            ) : (
              <div className="flex flex-col items-center justify-center text-muted-foreground">
                <X className="h-16 w-16 mb-4" />
                <p>No file URL available</p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

