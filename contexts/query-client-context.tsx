"use client";

import * as React from "react";
import { QueryClient } from "@tanstack/react-query";

interface QueryClientContextType {
  queryClient: QueryClient | null;
  setQueryClient: (queryClient: QueryClient) => void;
}

const QueryClientContext = React.createContext<QueryClientContextType | null>(null);

export function QueryClientProvider({ children }: { children: React.ReactNode }) {
  const [queryClient, setQueryClient] = React.useState<QueryClient | null>(null);

  return (
    <QueryClientContext.Provider value={{ queryClient, setQueryClient }}>
      {children}
    </QueryClientContext.Provider>
  );
}

export function useQueryClientContext() {
  const context = React.useContext(QueryClientContext);
  if (!context) {
    throw new Error("useQueryClientContext must be used within a QueryClientProvider");
  }
  return context;
}
