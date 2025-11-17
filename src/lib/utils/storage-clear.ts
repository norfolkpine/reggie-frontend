/**
 * Comprehensive storage clearing utility
 * Clears all browser storage mechanisms and caches
 */

import { QueryClient } from '@tanstack/react-query';

/**
 * Clears all localStorage data
 */
export function clearLocalStorage(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.clear();
  } catch (error) {
    console.error('Failed to clear localStorage:', error);
  }
}

/**
 * Clears all sessionStorage data
 */
export function clearSessionStorage(): void {
  if (typeof window === 'undefined') return;
  
  try {
    sessionStorage.clear();
  } catch (error) {
    console.error('Failed to clear sessionStorage:', error);
  }
}

/**
 * Clears all cookies
 */
export function clearCookies(): void {
  if (typeof document === 'undefined') return;
  
  try {
    // Get all cookies and clear them
    const cookies = document.cookie.split(';');
    
    cookies.forEach(cookie => {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      
      // Clear cookie for current domain
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`;
    });
  } catch (error) {
    console.error('Failed to clear cookies:', error);
  }
}

/**
 * Clears IndexedDB databases (if any exist)
 */
export async function clearIndexedDB(): Promise<void> {
  if (typeof window === 'undefined') return;
  
  try {
    // Check if IndexedDB is available
    if ('indexedDB' in window) {
      // Get all database names and delete them
      const databases = await indexedDB.databases();
      
      await Promise.all(
        databases.map(db => {
          if (db.name) {
            return new Promise<void>((resolve, reject) => {
              const deleteReq = indexedDB.deleteDatabase(db.name);
              deleteReq.onsuccess = () => resolve();
              deleteReq.onerror = () => reject(deleteReq.error);
            });
          }
          return Promise.resolve();
        })
      );
    }
  } catch (error) {
    console.error('Failed to clear IndexedDB:', error);
  }
}

/**
 * Clears WebSQL databases (if any exist)
 */
export function clearWebSQL(): void {
  if (typeof window === 'undefined') return;
  
  try {
    // Check if WebSQL is available (deprecated but still used in some browsers)
    if ('openDatabase' in window) {
      // WebSQL doesn't have a direct way to list databases
      // We'll try to clear common database names
      const commonDbNames = ['opie', 'opie_cache', 'opie_data', 'app_cache'];
      
      commonDbNames.forEach(dbName => {
        try {
          const db = (window as any).openDatabase(dbName, '1.0', 'Database', 2 * 1024 * 1024);
          if (db) {
            db.transaction((tx: any) => {
              tx.executeSql('DROP TABLE IF EXISTS cache');
              tx.executeSql('DROP TABLE IF EXISTS data');
              tx.executeSql('DROP TABLE IF EXISTS sessions');
            });
          }
        } catch (error) {
          // Database might not exist, ignore error
        }
      });
    }
  } catch (error) {
    console.error('Failed to clear WebSQL:', error);
  }
}

/**
 * Clears React Query cache
 */
export function clearReactQueryCache(queryClient: QueryClient): void {
  try {
    queryClient.clear();
    queryClient.removeQueries();
    queryClient.resetQueries();
  } catch (error) {
    console.error('Failed to clear React Query cache:', error);
  }
}

/**
 * Clears all browser storage and caches
 */
export async function clearAllStorage(queryClient?: QueryClient): Promise<void> {
  try {
    // Clear all storage mechanisms
    clearLocalStorage();
    clearSessionStorage();
    clearCookies();
    
    // Clear IndexedDB and WebSQL asynchronously
    await Promise.all([
      clearIndexedDB(),
      Promise.resolve(clearWebSQL())
    ]);
    
    // Clear React Query cache if provided
    if (queryClient) {
      clearReactQueryCache(queryClient);
    }
    
    // Clear any service worker caches
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      } catch (error) {
        console.error('Failed to clear service worker caches:', error);
      }
    }
    
    console.log('All storage and caches cleared successfully');
  } catch (error) {
    console.error('Failed to clear all storage:', error);
  }
}
