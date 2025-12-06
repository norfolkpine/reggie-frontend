/**
 * Document Processing Service
 * 
 * This service handles the conversion of various document formats into a standardized
 * format for use in the document analysis system. It supports multiple file types with
 * intelligent fallback mechanisms.
 */

export interface DocumentFile {
  id: string;
  name: string;
  type: string;
  size: number;
  content: string; // Base64 encoded markdown
  mimeType: string;
}

export interface DocumentProcessingResult {
  /** Successfully processed files */
  success: DocumentFile[];
  /** Files that failed to process with error messages */
  errors: Array<{ fileName: string; error: string }>;
}

/**
 * Reads a text file directly in the browser using FileReader API
 */
export const readTextFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
    reader.readAsText(file);
  });
};

/**
 * Processes a document to markdown using the backend API
 */
export const processDocumentToMarkdown = async (file: File): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    // Get API URL from environment or use default
    const apiUrl = process.env.NEXT_PUBLIC_DOC_ANALYSER_API_URL || 'http://localhost:8001';
    const response = await fetch(`${apiUrl}/convert`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Conversion failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.markdown || "";

  } catch (error) {
    console.error("Document Conversion failed:", error);
    throw new Error(`Failed to convert ${file.name}. Is the backend server running?`);
  }
};

/**
 * Determines the appropriate processing strategy for a file based on its extension
 */
const getFileTypeInfo = (fileName: string) => {
  const fileExtension = fileName.split('.').pop()?.toLowerCase();
  
  return {
    extension: fileExtension,
    isTextFile: fileExtension === 'txt' || fileExtension === 'md' || fileExtension === 'json',
    isPdfOrDocx: fileExtension === 'pdf' || fileExtension === 'docx',
  };
};

/**
 * Processes a single file and converts it to a DocumentFile object
 */
const processSingleFile = async (file: File): Promise<DocumentFile> => {
  let markdownContent: string;
  let mimeType: string = 'text/markdown';

  const { isTextFile, isPdfOrDocx } = getFileTypeInfo(file.name);

  // Strategy 1: Text files - process directly in browser
  if (isTextFile) {
    const textContent = await readTextFile(file);
    markdownContent = textContent;
    mimeType = file.type || 'text/plain';
  }
  // Strategy 2: PDF/DOCX - use backend converter
  else if (isPdfOrDocx) {
    try {
      markdownContent = await processDocumentToMarkdown(file);
    } catch (backendError) {
      const errorMsg = backendError instanceof Error ? backendError.message : String(backendError);
      
      // Check if it's a backend availability issue
      if (errorMsg.includes('backend server running') || errorMsg.includes('Failed to fetch')) {
        throw new Error(
          `Backend server not available. Please ensure the server is running on ${process.env.NEXT_PUBLIC_DOC_ANALYSER_API_URL || 'http://localhost:8001'}`
        );
      } else {
        throw backendError;
      }
    }
  }
  // Strategy 3: Other formats - try backend, fallback to text
  else {
    try {
      markdownContent = await processDocumentToMarkdown(file);
    } catch (backendError) {
      // Fallback: try reading as text
      try {
        const textContent = await readTextFile(file);
        markdownContent = textContent;
        mimeType = file.type || 'text/plain';
      } catch (textError) {
        throw new Error(
          'Could not process file. Unsupported format or backend unavailable.'
        );
      }
    }
  }

  // Encode content to Base64 for storage
  const contentBase64 = btoa(unescape(encodeURIComponent(markdownContent)));

  // Generate a unique ID for the document
  const documentId = crypto.randomUUID();

  return {
    id: documentId,
    name: file.name,
    type: file.type,
    size: file.size,
    content: contentBase64,
    mimeType: mimeType,
  };
};

/**
 * Processes multiple files in batch with comprehensive error handling
 */
export const processDocumentFiles = async (
  fileList: File[]
): Promise<DocumentProcessingResult> => {
  const processedFiles: DocumentFile[] = [];
  const errors: Array<{ fileName: string; error: string }> = [];

  // Process each file individually to handle errors gracefully
  for (const file of fileList) {
    try {
      const processedFile = await processSingleFile(file);
      processedFiles.push(processedFile);
    } catch (fileError) {
      console.error(`Failed to process ${file.name}:`, fileError);
      
      const errorMessage = fileError instanceof Error 
        ? fileError.message 
        : 'Unknown error occurred';
      
      errors.push({
        fileName: file.name,
        error: errorMessage,
      });
    }
  }

  return {
    success: processedFiles,
    errors,
  };
};


