import { HocuspocusProvider } from '@hocuspocus/provider';
import * as Y from 'yjs';
import { create } from 'zustand';

import { Base64 } from '@/features/docs/doc-management';

export interface UseCollaborationStore {
  createProvider: (
    providerUrl: string,
    storeId: string,
    initialDoc?: Base64
  ) => HocuspocusProvider;
  destroyProvider: () => void;
  provider: HocuspocusProvider | undefined;
}

const defaultValues = {
  provider: undefined,
};

export const useProviderStore = create<UseCollaborationStore>((set, get) => ({
  ...defaultValues,
  createProvider: (wsUrl, storeId, initialDoc) => {
    const doc = new Y.Doc({
      guid: storeId,
    });
    if (initialDoc) {
      Y.applyUpdate(doc, Buffer.from(initialDoc, 'base64'));
    }

    const provider = new HocuspocusProvider({
      url: wsUrl,
      name: storeId,
      document: doc,
    });

    // Add connection event listeners for debugging
    provider.on('connect', () => {
      console.log('🏭 Provider connected:', storeId);
    });

    provider.on('disconnect', () => {
      console.log('🏭 Provider disconnected:', storeId);
    });

    provider.on('close', () => {
      console.log('🏭 Provider closed:', storeId);
    });

    provider.on('error', (error: any) => {
      console.error('🏭 Provider error:', error);
    });

    set({
      provider,
    });

    return provider;
  },
  destroyProvider: () => {
    const provider = get().provider;
    if (provider) {
      provider.destroy();
    }

    set(defaultValues);
  },
}));
