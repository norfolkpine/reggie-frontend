/**
 * Convert a document file to markdown using the Docling service.
 * 
 * This function sends the file to Django's /convert endpoint which proxies
 * to the llamaindex service. The llamaindex service uses Docling for 
 * high-quality document parsing with GCS-based storage.
 * 
 * @param file - The file to convert (PDF, DOCX, PPTX, etc.)
 * @returns Promise that resolves to the markdown content
 * @throws Error if conversion fails
 */
export const processDocumentToMarkdown = async (file: File): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    // Use Django API endpoint which handles file upload and GCS storage
    const { BASE_URL } = await import('@/lib/api-client');
    const { getCSRFToken } = await import('@/api');
    
    const csrfToken = getCSRFToken();
    const response = await fetch(`${BASE_URL}/opie/api/v1/convert/`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
      headers: {
        ...(csrfToken && { 'X-CSRFToken': csrfToken }),
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorText = errorData.detail || errorData.error || response.statusText;
      throw new Error(`Conversion failed: ${errorText}`);
    }

    const data = await response.json();
    return data.markdown || "";

  } catch (error) {
    console.error("Document Conversion failed:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to convert ${file.name}. ${errorMessage}`);
  }
};

