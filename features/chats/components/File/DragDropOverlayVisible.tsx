import React, { useState, useRef, useEffect } from 'react';
import { Send, Upload, X, File, Image, Paperclip, Plus } from 'lucide-react';
import { JSX } from 'react/jsx-runtime';

export type AcceptedFileType = 'image' | 'document' | 'all';
export interface DragDropOverlayProps {
    isVisible: boolean;
    onFilesDrop: (files: File[]) => void;
    onVisibilityChange: (visible: boolean) => void;
    title?: string;
    subtitle?: string;
    acceptedTypes?: AcceptedFileType[];
    className?: string;
    overlayClassName?: string;
  }

  export const DragDropOverlay: React.FC<DragDropOverlayProps> = ({ 
    isVisible, 
    onFilesDrop, 
    onVisibilityChange,
    title = "Drop file here",
    subtitle = "File will be attached to your message",
    acceptedTypes = ['image', 'document', 'all'],
    className = "",
    overlayClassName = ""
  }) => {
    useEffect(() => {
      const handleDragEnter = (e: DragEvent): void => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer?.types.includes('Files')) {
          onVisibilityChange(true);
        }
      };
  
      const handleDragOver = (e: DragEvent): void => {
        e.preventDefault();
        e.stopPropagation();
      };
  
      const handleDragLeave = (e: DragEvent): void => {
        e.preventDefault();
        e.stopPropagation();
        if (e.clientX <= 0 || e.clientY <= 0 || 
            e.clientX >= window.innerWidth || e.clientY >= window.innerHeight) {
          onVisibilityChange(false);
        }
      };
  
      const handleDrop = (e: DragEvent): void => {
        e.preventDefault();
        e.stopPropagation();
        onVisibilityChange(false);
        
        const files = e.dataTransfer?.files;
        if (files && files.length > 0) {
          onFilesDrop(Array.from(files));
        }
      };
  
      document.addEventListener('dragenter', handleDragEnter);
      document.addEventListener('dragover', handleDragOver);
      document.addEventListener('dragleave', handleDragLeave);
      document.addEventListener('drop', handleDrop);
  
      return () => {
        document.removeEventListener('dragenter', handleDragEnter);
        document.removeEventListener('dragover', handleDragOver);
        document.removeEventListener('dragleave', handleDragLeave);
        document.removeEventListener('drop', handleDrop);
      };
    }, [onFilesDrop, onVisibilityChange]);
  
    const getTypeIcon = (type: AcceptedFileType): JSX.Element => {
      switch (type) {
        case 'image': return <Image className="w-4 h-4" />;
        case 'document': return <File className="w-4 h-4" />;
        default: return <Upload className="w-4 h-4" />;
      }
    };
  
    const getTypeLabel = (type: AcceptedFileType): string => {
      switch (type) {
        case 'image': return 'Gambar';
        case 'document': return 'Dokumen';
        default: return 'Semua file';
      }
    };

    if (!isVisible) return null;
  
    return (
      <div className={`fixed inset-0 bg-black/50 z-[99999] flex items-center justify-center ${overlayClassName}`}>
        <div className={`bg-white backdrop-blur-sm rounded-3xl p-[3rem] border-4 border-dashed border-blue-500 max-w-md mx-4 ${className}`} style={{ padding: '3rem', border: '4px dashed blue', borderRadius: '1rem' }}>
          <div className="text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Upload className="w-10 h-10 text-blue-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>
            <p className="text-gray-600 mb-4">{subtitle}</p>
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
              {acceptedTypes.map((type, index) => (
                <div key={index} className="flex items-center space-x-1">
                  {getTypeIcon(type)}
                  <span>{getTypeLabel(type)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };