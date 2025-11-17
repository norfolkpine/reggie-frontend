import { useEffect } from 'react';

import { useBroadcastStore } from '@/stores';

import { useProviderStore } from '../stores/useProviderStore';
import { Base64 } from '../types';
import { useCollaborationUrl } from '@/config';

export const useCollaboration = (room?: string, initialContent?: Base64) => {
  const collaborationUrl = useCollaborationUrl(room);
  console.log('🔗 Collaboration URL:', collaborationUrl);
  console.log('🔗 Room ID:', room);
  
  // Also log to server console (will show in VS Code terminal)
  if (typeof window !== 'undefined') {
    // This will show in browser console
    console.log('🔗 Browser: Collaboration starting for room:', room);
  }
  const { setBroadcastProvider } = useBroadcastStore();
  const { provider, createProvider, destroyProvider } = useProviderStore();

  useEffect(() => {
    if (!room || !collaborationUrl || provider) {
      return;
    }

    console.log('🔗 Creating provider with:', { collaborationUrl, room, hasInitialContent: !!initialContent });
    const newProvider = createProvider(collaborationUrl, room, initialContent);
    console.log('🔗 Provider created:', { providerId: newProvider.document.guid, isConnected: newProvider.isConnected });
    setBroadcastProvider(newProvider);
    
    // Add timeout to check connection status
    setTimeout(() => {
      console.log('🔗 Provider status after 2s:', { 
        isConnected: newProvider.isConnected
      });
    }, 2000);
  }, [
    provider,
    collaborationUrl,
    room,
    initialContent,
    createProvider,
    setBroadcastProvider,
  ]);

  /**
   * Destroy the provider when the component is unmounted
   */
  useEffect(() => {
    return () => {
      if (room) {
        destroyProvider();
      }
    };
  }, [destroyProvider, room]);
};
