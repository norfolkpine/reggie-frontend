"use client";

import { useState, useCallback, useRef, useEffect } from "react";

export interface DragDropFilesOptions {
  /**
   * Whether drag and drop is currently enabled
   */
  enabled?: boolean;
  /**
   * Accepted file types (MIME types or extensions)
   * @example ['image/*', '.pdf', '.docx']
   */
  acceptedTypes?: string[];
  /**
   * Maximum file size in bytes
   */
  maxFileSize?: number;
  /**
   * Maximum number of files allowed
   */
  maxFiles?: number;
  /**
   * Callback when files are dropped
   */
  onFilesDrop?: (files: File[]) => void | Promise<void>;
  /**
   * Callback when drag enters the area
   */
  onDragEnter?: () => void;
  /**
   * Callback when drag leaves the area
   */
  onDragLeave?: () => void;
  /**
   * Custom validation function for files
   */
  validateFile?: (file: File) => string | null; // Return error message or null if valid
}

export interface DragDropFilesReturn {
  /**
   * Whether files are currently being dragged over the area
   */
  isDragOver: boolean;
  /**
   * Drag event handlers to attach to the container element
   */
  dragHandlers: {
    onDragOver: (e: React.DragEvent) => void;
    onDragEnter: (e: React.DragEvent) => void;
    onDragLeave: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
  };
  /**
   * Error message if file validation fails
   */
  error: string | null;
  /**
   * Clear any current error
   */
  clearError: () => void;
  /**
   * Manually trigger file drop (useful for testing or programmatic drops)
   */
  triggerFileDrop: (files: File[]) => void | Promise<void>;
}

/**
 * Custom hook for handling drag and drop file functionality
 * 
 * @param options Configuration options for the drag and drop behavior
 * @returns Object containing drag state and event handlers
 * 
 * @example
 * ```tsx
 * const { isDragOver, dragHandlers, error, clearError } = useDragDropFiles({
 *   enabled: true,
 *   acceptedTypes: ['image/*', '.pdf'],
 *   maxFileSize: 10 * 1024 * 1024, // 10MB
 *   maxFiles: 5,
 *   onFilesDrop: (files) => {
 *     console.log('Files dropped:', files);
 *   },
 *   validateFile: (file) => {
 *     if (file.size > 5 * 1024 * 1024) {
 *       return 'File too large';
 *     }
 *     return null;
 *   }
 * });
 * 
 * return (
 *   <div {...dragHandlers} className={isDragOver ? 'border-primary' : ''}>
 *     Drop files here
 *   </div>
 * );
 * ```
 */
export function useDragDropFiles(options: DragDropFilesOptions = {}): DragDropFilesReturn {
  const {
    enabled = true,
    acceptedTypes = [],
    maxFileSize,
    maxFiles,
    onFilesDrop,
    onDragEnter: onDragEnterCallback,
    onDragLeave: onDragLeaveCallback,
    validateFile
  } = options;

  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dragCounterRef = useRef(0);
  const containerRef = useRef<HTMLElement | null>(null);
  const dragTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clear error when enabled changes
  useEffect(() => {
    if (!enabled) {
      setError(null);
      setIsDragOver(false);
      dragCounterRef.current = 0;
      if (dragTimeoutRef.current) {
        clearTimeout(dragTimeoutRef.current);
        dragTimeoutRef.current = null;
      }
    }
  }, [enabled]);

  // Handle global drag events to reset state when drag is cancelled
  useEffect(() => {
    const handleGlobalDragEnd = () => {
      setIsDragOver(false);
      dragCounterRef.current = 0;
      if (dragTimeoutRef.current) {
        clearTimeout(dragTimeoutRef.current);
        dragTimeoutRef.current = null;
      }
    };

    const handleGlobalDragLeave = (e: DragEvent) => {
      // If we're leaving the entire document, reset the drag state
      if (!e.relatedTarget || e.relatedTarget === document.body) {
        setIsDragOver(false);
        dragCounterRef.current = 0;
        if (dragTimeoutRef.current) {
          clearTimeout(dragTimeoutRef.current);
          dragTimeoutRef.current = null;
        }
      }
    };

    const handleGlobalClick = () => {
      // Dismiss drag state on any click
      if (isDragOver) {
        setIsDragOver(false);
        dragCounterRef.current = 0;
        if (dragTimeoutRef.current) {
          clearTimeout(dragTimeoutRef.current);
          dragTimeoutRef.current = null;
        }
      }
    };

    const handleGlobalScroll = () => {
      // Dismiss drag state on any scroll
      if (isDragOver) {
        setIsDragOver(false);
        dragCounterRef.current = 0;
        if (dragTimeoutRef.current) {
          clearTimeout(dragTimeoutRef.current);
          dragTimeoutRef.current = null;
        }
      }
    };

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Dismiss drag state on Escape key or any key press
      if (isDragOver && (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ')) {
        setIsDragOver(false);
        dragCounterRef.current = 0;
        if (dragTimeoutRef.current) {
          clearTimeout(dragTimeoutRef.current);
          dragTimeoutRef.current = null;
        }
      }
    };

    const handleGlobalTouchStart = () => {
      // Dismiss drag state on touch (mobile)
      if (isDragOver) {
        setIsDragOver(false);
        dragCounterRef.current = 0;
        if (dragTimeoutRef.current) {
          clearTimeout(dragTimeoutRef.current);
          dragTimeoutRef.current = null;
        }
      }
    };

    const handleGlobalWheel = () => {
      // Dismiss drag state on wheel events (scroll with mouse)
      if (isDragOver) {
        setIsDragOver(false);
        dragCounterRef.current = 0;
        if (dragTimeoutRef.current) {
          clearTimeout(dragTimeoutRef.current);
          dragTimeoutRef.current = null;
        }
      }
    };

    // Add global event listeners to handle drag cancellation
    document.addEventListener('dragend', handleGlobalDragEnd);
    document.addEventListener('dragleave', handleGlobalDragLeave);
    document.addEventListener('drop', handleGlobalDragEnd);
    
    // Add listeners for click, scroll, and keyboard events to dismiss drag state
    document.addEventListener('click', handleGlobalClick, true); // Use capture phase
    document.addEventListener('scroll', handleGlobalScroll, true); // Use capture phase
    document.addEventListener('keydown', handleGlobalKeyDown, true); // Use capture phase
    document.addEventListener('touchstart', handleGlobalTouchStart, true); // Mobile touch
    document.addEventListener('wheel', handleGlobalWheel, true); // Mouse wheel scroll

    return () => {
      document.removeEventListener('dragend', handleGlobalDragEnd);
      document.removeEventListener('dragleave', handleGlobalDragLeave);
      document.removeEventListener('drop', handleGlobalDragEnd);
      document.removeEventListener('click', handleGlobalClick, true);
      document.removeEventListener('scroll', handleGlobalScroll, true);
      document.removeEventListener('keydown', handleGlobalKeyDown, true);
      document.removeEventListener('touchstart', handleGlobalTouchStart, true);
      document.removeEventListener('wheel', handleGlobalWheel, true);
      if (dragTimeoutRef.current) {
        clearTimeout(dragTimeoutRef.current);
        dragTimeoutRef.current = null;
      }
    };
  }, [isDragOver]); // Add isDragOver as dependency

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const validateFiles = useCallback((files: File[]): string | null => {
    if (!enabled) return null;

    // Check max files
    if (maxFiles && files.length > maxFiles) {
      return `Maximum ${maxFiles} files allowed`;
    }

    // Check each file
    for (const file of files) {
      // Check file size
      if (maxFileSize && file.size > maxFileSize) {
        return `File "${file.name}" is too large. Maximum size: ${Math.round(maxFileSize / 1024 / 1024)}MB`;
      }

      // Check file type
      if (acceptedTypes.length > 0) {
        const isValidType = acceptedTypes.some(type => {
          if (type.startsWith('.')) {
            // Extension check
            return file.name.toLowerCase().endsWith(type.toLowerCase());
          } else if (type.includes('*')) {
            // MIME type wildcard check
            const baseType = type.split('/')[0];
            return file.type.startsWith(baseType + '/');
          } else {
            // Exact MIME type check
            return file.type === type;
          }
        });

        if (!isValidType) {
          return `File "${file.name}" is not a supported type. Allowed types: ${acceptedTypes.join(', ')}`;
        }
      }

      // Custom validation
      if (validateFile) {
        const customError = validateFile(file);
        if (customError) {
          return customError;
        }
      }
    }

    return null;
  }, [enabled, maxFiles, maxFileSize, acceptedTypes, validateFile]);

  const handleFilesDrop = useCallback(async (files: File[]) => {
    if (!enabled || !onFilesDrop) return;

    const validationError = validateFiles(files);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setError(null);
      await onFilesDrop(files);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process files');
    }
  }, [enabled, onFilesDrop, validateFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    if (!enabled) return;
    
    e.preventDefault();
    e.stopPropagation();
  }, [enabled]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    if (!enabled) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    // Clear any existing timeout
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current);
      dragTimeoutRef.current = null;
    }
    
    dragCounterRef.current++;
    
    if (dragCounterRef.current === 1) {
      setIsDragOver(true);
      onDragEnterCallback?.();
      
      // Set a timeout fallback to reset drag state if events don't fire properly
      dragTimeoutRef.current = setTimeout(() => {
        setIsDragOver(false);
        dragCounterRef.current = 0;
        dragTimeoutRef.current = null;
      }, 1000); // 1 second timeout
    }
  }, [enabled, onDragEnterCallback]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    if (!enabled) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    dragCounterRef.current = Math.max(0, dragCounterRef.current - 1);
    
    // Only set isDragOver to false if we're leaving the container entirely
    if (dragCounterRef.current === 0) {
      setIsDragOver(false);
      onDragLeaveCallback?.();
      
      // Clear the timeout since we're properly leaving
      if (dragTimeoutRef.current) {
        clearTimeout(dragTimeoutRef.current);
        dragTimeoutRef.current = null;
      }
    }
  }, [enabled, onDragLeaveCallback]);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    if (!enabled) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    dragCounterRef.current = 0;
    setIsDragOver(false);
    
    // Clear the timeout since we're dropping
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current);
      dragTimeoutRef.current = null;
    }
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length === 0) return;

    await handleFilesDrop(droppedFiles);
  }, [enabled, handleFilesDrop]);

  const triggerFileDrop = useCallback(async (files: File[]) => {
    await handleFilesDrop(files);
  }, [handleFilesDrop]);

  const dragHandlers = {
    onDragOver: handleDragOver,
    onDragEnter: handleDragEnter,
    onDragLeave: handleDragLeave,
    onDrop: handleDrop
  };

  return {
    isDragOver,
    dragHandlers,
    error,
    clearError,
    triggerFileDrop
  };
}
