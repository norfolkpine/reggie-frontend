"use client";

import * as React from "react";
import { User, Login } from "@/types/api";
import * as authApi from "@/api/auth";
import { flushSync } from "react-dom";
import { useEffect } from "react";
import { ensureCSRFToken, setAuthContext } from "@/lib/api-client";
import { TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY } from "../lib/constants";
import { useRouter } from "next/navigation";
import { clearAllStorage } from "@/lib/utils/storage-clear";
import { useQueryClientContext } from "./query-client-context";

export interface AuthContext {
  isAuthenticated: boolean;
  login: (credentials: Login) => Promise<void>;
  logout: () => Promise<void>;
  user: User | null;
  loading: boolean;
  handleTokenExpiration: () => void;
  updateUser: (userData: Partial<User>) => Promise<void>;
  status: string | 'LOGGED_IN' | 'LOGGED_OUT';
}

const AuthContext = React.createContext<AuthContext | null>(null);

export function AuthProvider({ children, allowedRoutes=[] }: { children: React.ReactNode, allowedRoutes: string[] }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const isAuthenticated = !!user;
  const [status, setStatus] = React.useState<string | 'LOGGED_IN' | 'LOGGED_OUT'>('LOGGED_OUT');
  const router = useRouter();
  const { queryClient } = useQueryClientContext();
  
  useEffect(() => {
    const storedUser = getStoredUser();
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  function getStoredUser(): User | null {
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  function getStoredToken(): { access: string | null; refresh: string | null } {
    return {
      access: localStorage.getItem(TOKEN_KEY),
      refresh: localStorage.getItem(REFRESH_TOKEN_KEY),
    };
  }

  

  const handleTokenExpiration = React.useCallback(() => {
    console.log("Token expired, clearing auth state");
    
    flushSync(() => {
      setUser(null);
    });

    if(allowedRoutes.includes(window.location.pathname)){
      return;
    }

    if(allowedRoutes.includes(window.location.pathname)){
      return;
    }

    // Redirect to sign-in page using Next.js router (no page refresh)
    router.push('/sign-in');
  }, [router]);

  const logout = React.useCallback(async () => {
    try {
      await authApi.logout();

      setStatus('LOGGED_OUT');

      // Clear all storage data and caches comprehensively
      await clearAllStorage(queryClient || undefined);

      // Explicitly clear React Query cache if available
      if (queryClient && typeof queryClient.clear === 'function') {
        queryClient.clear();
      } else if (queryClient && typeof queryClient.removeQueries === 'function') {
        // For TanStack Query v4+
        queryClient.removeQueries();
      }

      flushSync(() => {
        setUser(null);
      });
    } catch (error) {
      // Even if logout API fails, we should still clear local storage
      await clearAllStorage(queryClient || undefined);

      if (queryClient && typeof queryClient.clear === 'function') {
        queryClient.clear();
      } else if (queryClient && typeof queryClient.removeQueries === 'function') {
        queryClient.removeQueries();
      }

      flushSync(() => {
        setUser(null);
      });
    }
  }, [queryClient]);

  // Set the auth context reference in the API client
  React.useEffect(() => {
    setAuthContext({ handleTokenExpiration, logout });
  }, [handleTokenExpiration, logout]);

  const login = async (credentials: Login) => {
    try {
      const response = await authApi.login(credentials);
      
      setStatus('LOGGED_IN');
      flushSync(() => {
        setUser(response.data.user);
      });
    } catch (error) {
      console.error("Login failed:", error);
      console.log("Error type:", typeof error);
      console.log("Error structure:", JSON.stringify(error, null, 2));
      throw error;
    }
  };

  const updateUser = React.useCallback(async (userData: Partial<User>) => {
    try {
      const updatedUser = await authApi.updateUser(userData);
      
      flushSync(() => {
        setUser(updatedUser);
      });
    } catch (error) {
      console.error("Update user failed:", error);
      throw error;
    }
  }, []);

  React.useEffect(() => {
    async function initializeAuth() {
      console.log("Initializing auth...");
      await ensureCSRFToken();
        try {
          const response =await authApi.verifySession();
          flushSync(() => {
            setUser(response.data.user);
          });
        } catch (error) {


          flushSync(() => {
            setUser(null);
          });

        }
      setLoading(false);
    }

    initializeAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, login, logout, loading, handleTokenExpiration, updateUser, status }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
