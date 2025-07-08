'use client';
import { CunninghamProvider } from '@openfun/cunningham-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useCunninghamTheme } from '@/cunningham';
import { useResponsiveStore } from '@/stores/';
import { TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY } from '@/contexts/auth-context';


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

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useCunninghamTheme();
  const { replace } = useRouter();

  const initializeResizeListener = useResponsiveStore(
    (state) => state.initializeResizeListener,
  );

  useEffect(() => {
    const cleanupResizeListener = initializeResizeListener();
    return cleanupResizeListener;
  }, [initializeResizeListener]);

  useEffect(() => {
    queryClient.setDefaultOptions({
      ...defaultOptions,
      mutations: {
        onError: (error) => {
          if (
            error instanceof Error &&
            'status' in error &&
            error.status === 401
          ) {
            // Clear auth state and redirect to sign-in
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(REFRESH_TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
            
            void queryClient.resetQueries({
              queryKey: [],
            });
            void replace('/sign-in');
          }
        },
      },
    });
  }, [replace]);

  return (
    <QueryClientProvider client={queryClient}>
      <CunninghamProvider theme={theme}>
          {children}
      </CunninghamProvider>
    </QueryClientProvider>
  );
}
