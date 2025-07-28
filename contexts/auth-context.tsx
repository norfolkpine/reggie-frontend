"use client";

import * as React from "react";
import { User, Login } from "@/types/api";
import * as authApi from "@/api/auth";
import { flushSync } from "react-dom";
import { useEffect } from "react";
import { setAuthContext } from "@/lib/api-client";
import { TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY } from "../lib/constants";

export interface AuthContext {
  isAuthenticated: boolean;
  login: (credentials: Login) => Promise<void>;
  logout: () => Promise<void>;
  user: User | null;
  loading: boolean;
  handleTokenExpiration: () => void;
  updateUser: (userData: Partial<User>) => Promise<void>;
}

const AuthContext = React.createContext<AuthContext | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const isAuthenticated = !!user;

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

  function setStoredAuth(
    tokens: { access: string | null; refresh: string | null },
    user: User | null
  ) {
    if (tokens.access && tokens.refresh && user) {
      localStorage.setItem(TOKEN_KEY, tokens.access);
      localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  }

  const handleTokenExpiration = React.useCallback(() => {
    console.log("Token expired, clearing auth state");
    setStoredAuth({ access: null, refresh: null }, null);
    flushSync(() => {
      setUser(null);
    });
    // Redirect to sign-in page
    if (typeof window !== 'undefined') {
      window.location.href = '/sign-in';
    }
  }, []);

  // Set the auth context reference in the API client
  React.useEffect(() => {
    setAuthContext({ handleTokenExpiration });
  }, [handleTokenExpiration]);

  const logout = React.useCallback(async () => {
    try {
      await authApi.logout();
      setStoredAuth({ access: null, refresh: null }, null);
      localStorage.clear();
      flushSync(() => {
        setUser(null);
      });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }, []);

  const login = async (credentials: Login) => {
    try {
      const response = await authApi.login(credentials);
      setStoredAuth(
        {
          access: response.jwt.access,
          refresh: response.jwt.refresh,
        },
        response.jwt.user
      );
      flushSync(() => {
        setUser(response.jwt.user);
      });
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const updateUser = React.useCallback(async (userData: Partial<User>) => {
    try {
      const updatedUser = await authApi.updateUser(userData);
      setStoredAuth(getStoredToken(), updatedUser);
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
      const tokens = getStoredToken();
      if (tokens.access) {
        try {
          await authApi.verifyToken(tokens.access);
          const currentUser = await authApi.getCurrentUser();
          flushSync(() => {
            setUser(currentUser);
          });
        } catch (error) {
          console.error("Token validation failed:", error);
          setStoredAuth({ access: null, refresh: null }, null);
          flushSync(() => {
            setUser(null);
          });
        }
      }
      setLoading(false);
    }

    initializeAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, login, logout, loading, handleTokenExpiration, updateUser }}
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
