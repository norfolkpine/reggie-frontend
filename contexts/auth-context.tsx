"use client";

import * as React from "react";
import { User, Login } from "@/types/api";
import * as authApi from "@/api/auth";
import { useEffect } from "react";
import { ensureCSRFToken, setAuthContext } from "@/lib/api-client";
import { TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY } from "../lib/constants";
import { useRouter } from "next/navigation";

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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const isAuthenticated = !!user;
  const [status, setStatus] = React.useState<string | 'LOGGED_IN' | 'LOGGED_OUT'>('LOGGED_OUT');
  const router = useRouter();

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

    setUser(null);

    // Redirect to sign-in page using Next.js router (no page refresh)
    router.push('/sign-in');
  }, [router]);

  // Set the auth context reference in the API client
  React.useEffect(() => {
    setAuthContext({ handleTokenExpiration });
  }, [handleTokenExpiration]);

  const logout = React.useCallback(async () => {
    try {
      await authApi.logout();
      
      setStatus('LOGGED_OUT');
      localStorage.clear();
            // Explicitly clear session cookies to prevent stale state on next login
      const clearAuthCookies = () => {
        if (typeof document === 'undefined') return;
        document.cookie = "csrftoken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "sessionid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      };
      clearAuthCookies();
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }, []);

  const login = async (credentials: Login) => {
    try {
      const response = await authApi.login(credentials);
      
      setStatus('LOGGED_IN');
      setUser(response.data.user);
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
      
      setUser(updatedUser);
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
          setUser(response.data.user);
        } catch (error) {
          setUser(null);
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
