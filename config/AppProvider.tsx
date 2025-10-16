'use client';
import { CunninghamProvider } from '@openfun/cunningham-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useCunninghamTheme } from '@/cunningham';
import { useResponsiveStore } from '@/stores/';
import { QueryClientProvider as CustomQueryClientProvider, useQueryClientContext } from '@/contexts/query-client-context';


/**
 * QueryClient:
 *  - defaultOptions:
 *    - staleTime:
 *      - global cache duration - we decided 3 minutes
 *      - It can be overridden to each query
 */
const defaultOptions = {
  queries: {
    staleTime: 1000 * 60 * 3,
    retry: 1,
  },
};
const queryClient = new QueryClient({
  defaultOptions,
});

function AppProviderContent({ children }: { children: React.ReactNode }) {
  const { theme } = useCunninghamTheme();
  const { replace } = useRouter();
  const { setQueryClient } = useQueryClientContext();

  const initializeResizeListener = useResponsiveStore(
    (state) => state.initializeResizeListener,
  );

  useEffect(() => {
    const cleanupResizeListener = initializeResizeListener();
    return cleanupResizeListener;
  }, [initializeResizeListener]);

  useEffect(() => {
    // Set the query client in the context
    setQueryClient(queryClient);
    
    // Remove duplicate 401 handling - let api-client handle all auth errors
    queryClient.setDefaultOptions(defaultOptions);
  }, [setQueryClient]);

  return (
    <CunninghamProvider theme={theme}>
      {children}
    </CunninghamProvider>
  );
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <CustomQueryClientProvider>
        <AppProviderContent>
          {children}
        </AppProviderContent>
      </CustomQueryClientProvider>
    </QueryClientProvider>
  );
}
