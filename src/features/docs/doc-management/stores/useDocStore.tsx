import { create } from 'zustand';

import { Doc } from '@/features/docs';

export interface UseDocStore {
  currentDoc?: Doc;
  setCurrentDoc: (doc: Doc | undefined) => void;
}

export const useDocStore = create<UseDocStore>((set) => ({
  currentDoc: undefined,
  setCurrentDoc: (doc) => {
    set({ currentDoc: doc });
  },
}));
