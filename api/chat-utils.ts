import { api } from '@/lib/api-client';
import { patchChatSession } from './chat-sessions';

/**
 * Generates a descriptive title for a chat session based on the user's message
 * @param message The user's message to generate a title from
 * @returns A generated title string
 */
export const generateChatTitle = async (message: string): Promise<string> => {
  try {
    // Call the AI to generate a title
    const response = await api.post('/reggie/api/v1/generate-title/', {
      message: message
    });
    
    if (response?.title) {
      return response.title;
    }
    
    // Fallback: If the API doesn't exist or doesn't return a title,
    // generate a simple title from the first few words of the message
    return generateFallbackTitle(message);
  } catch (error: unknown) {
    console.error('Error generating chat title:', error);
    return generateFallbackTitle(message);
  }
};

/**
 * Generates a fallback title from the user message if the AI title generation fails
 * @param message The user's message
 * @returns A simple title based on the message content
 */
const generateFallbackTitle = (message: string): string => {
  // Take the first few words (up to 5) and add ellipsis if needed
  const words = message.split(' ').filter(Boolean);
  const titleWords = words.slice(0, 5);
  let title = titleWords.join(' ');
  
  if (words.length > 5) {
    title += '...';
  }
  
  // Limit the length to 50 characters
  if (title.length > 50) {
    title = title.substring(0, 47) + '...';
  }
  
  return title;
};

/**
 * Updates the chat session title based on the first user message
 * @param sessionId The ID of the chat session to update
 * @param message The user message to generate the title from
 * @returns The generated and saved title, or null if update failed
 */
export const updateChatSessionTitle = async (sessionId: string, message: string): Promise<string | null> => {
  try {
    const title = await generateChatTitle(message);
    const updatedSession = await patchChatSession(sessionId, { title });
    return updatedSession.title; // Return the title from the patched session object
  } catch (error: unknown) {
    console.error('Error updating chat session title:', error);
    return null; // Indicate failure
  }
};
