/**
 * Data Extraction Service
 * 
 * This service handles extracting structured data from documents using AI models
 * via the backend API.
 */

export interface DocumentFile {
  id: string;
  name: string;
  type: string;
  size: number;
  content: string; // Base64 encoded markdown
  mimeType: string;
}

export type ColumnType = 'short-text' | 'long-text' | 'number' | 'date' | 'boolean' | 'list' | 'file';

export interface Column {
  id: string;
  name: string;
  type: ColumnType;
  prompt: string;
  status?: 'idle' | 'extracting' | 'completed' | 'error';
}

export interface ExtractionCell {
  value: string;
  confidence: 'High' | 'Medium' | 'Low';
  quote: string;
  page: number;
  reasoning: string;
  status?: 'verified' | 'needs_review' | 'edited';
}

/**
 * Extracts data from a document using the backend API
 */
export const extractColumnData = async (
  doc: DocumentFile,
  column: Column,
  modelId: string
): Promise<ExtractionCell> => {
  try {
    // Decode Base64 to get the text content
    let docText = "";
    try {
      docText = decodeURIComponent(escape(atob(doc.content)));
    } catch (e) {
      // Fallback
      docText = atob(doc.content);
    }

    // Format instruction based on column type
    let formatInstruction = "";
    switch (column.type) {
      case 'date':
        formatInstruction = "Format the date as YYYY-MM-DD.";
        break;
      case 'boolean':
        formatInstruction = "Return 'true' or 'false' as the value string.";
        break;
      case 'number':
        formatInstruction = "Return a clean number string, removing currency symbols if needed.";
        break;
      case 'list':
        formatInstruction = "Return the items as a comma-separated string.";
        break;
      case 'file':
        formatInstruction = "Note: Files should be uploaded manually. This column is for file attachments.";
        break;
      default:
        formatInstruction = "Keep the text concise.";
    }

    // Build the prompt
    const prompt = `Task: Extract specific information from the provided document.
    
    Column Name: "${column.name}"
    Extraction Instruction: ${column.prompt}
    
    Format Requirements:
    - ${formatInstruction}
    - Provide a confidence score (High/Medium/Low).
    - Include the exact quote from the text where the answer is found.
    - Provide a brief reasoning.
    `;

    // Get API URL from environment or use default
    const apiUrl = process.env.NEXT_PUBLIC_DOC_ANALYSER_API_URL || 'http://localhost:8001';
    
    // Call the backend analyze endpoint
    const response = await fetch(`${apiUrl}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: docText,
        prompt: prompt,
        model: modelId,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();
    const resultText = data.result || '';

    // Parse the result - the backend returns plain text, so we need to extract structured data
    // For now, we'll return a simple structure. In a full implementation, you might want
    // to use structured output from the API or parse the response more intelligently.
    return {
      value: resultText.trim(),
      confidence: 'Medium' as const,
      quote: '', // Would need to be extracted from the response
      page: 1,
      reasoning: '',
      status: 'needs_review' as const,
    };

  } catch (error) {
    console.error("Extraction error:", error);
    throw error;
  }
};

