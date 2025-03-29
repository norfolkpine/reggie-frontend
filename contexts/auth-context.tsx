"use client";

import * as React from "react";
import { CustomUser, Login } from "@/types/api";
import * as authApi from "@/api/auth";
import { flushSync } from "react-dom";
import { useEffect } from "react";

export interface AuthContext {
  isAuthenticated: boolean;
  login: (credentials: Login) => Promise<void>;
  logout: () => Promise<void>;
  user: CustomUser | null;
  loading: boolean;
}

const AuthContext = React.createContext<AuthContext | null>(null);

export const TOKEN_KEY = "reggie.auth.token";
export const REFRESH_TOKEN_KEY = "reggie.auth.refresh.token";
export const USER_KEY = "reggie.auth.user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<CustomUser | null>(null);
  const [loading, setLoading] = React.useState(true);
  const isAuthenticated = !!user;

  useEffect(() => {
    const storedUser = getStoredUser();
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  function getStoredUser(): CustomUser | null {
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
    user: CustomUser | null
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
      value={{ isAuthenticated, user, login, logout, loading }}
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
