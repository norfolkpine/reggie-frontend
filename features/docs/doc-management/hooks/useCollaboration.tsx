import { useEffect } from 'react';

import { useBroadcastStore } from '@/stores';

import { useProviderStore } from '../stores/useProviderStore';
import { Base64 } from '../types';
import { useCollaborationUrl } from '@/config';

export const useCollaboration = (room?: string, initialContent?: Base64) => {
  const collaborationUrl = useCollaborationUrl(room);
  console.log('collaborationUrl', collaborationUrl);
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
