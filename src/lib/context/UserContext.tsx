"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { useSession, signOut } from "next-auth/react";

// Types
export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  image?: string;
  avatar?: string;
  phone?: string;
  dateOfBirth?: string;
  nationality?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  preferences: UserPreferences;
  memberSince: string;
  memberLevel: string;
  role: string;
}

export interface UserPreferences {
  language: 'en' | 'zh' | 'fr';
  currency: 'CAD' | 'USD' | 'EUR' | 'CNY';
  notifications: {
    email: boolean;
    sms: boolean;
    marketing: boolean;
  };
}

interface UserContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  updatePreferences: (prefs: Partial<UserPreferences>) => Promise<void>;
  updateAvatar: (avatarUrl: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

// Default preferences
const defaultPreferences: UserPreferences = {
  language: 'zh',
  currency: 'CAD',
  notifications: {
    email: true,
    sms: true,
    marketing: false,
  },
};

const TOKEN_KEY = "stayneos_auth_token";
const USER_KEY = "stayneos_user_data";

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUserFromStorage = () => {
      try {
        const storedUser = localStorage.getItem(USER_KEY);
        const storedToken = localStorage.getItem(TOKEN_KEY);
        
        if (storedUser && storedToken) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        }
      } catch (error) {
        console.error("Error loading user from storage:", error);
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(TOKEN_KEY);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserFromStorage();
  }, []);

  // Sync with NextAuth session
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const fullName = session.user.name || "";
      const nameParts = fullName.split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      const userData: UserProfile = {
        id: session.user.id,
        firstName,
        lastName,
        name: fullName,
        email: session.user.email || "",
        image: session.user.image || undefined,
        avatar: session.user.image || undefined,
        phone: "",
        dateOfBirth: "",
        nationality: "",
        preferences: defaultPreferences,
        memberSince: new Date().toISOString().split("T")[0],
        memberLevel: "普通会员",
        role: session.user.role || "USER",
      };
      
      setUser(userData);
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
    } else if (status === "unauthenticated" && !localStorage.getItem(TOKEN_KEY)) {
      setUser(null);
    }
  }, [session, status]);

  const updateProfile = useCallback(async (data: Partial<UserProfile>) => {
    setIsLoading(true);
    try {
      // Update local state
      setUser(prev => {
        if (!prev) return null;
        const updated = { ...prev, ...data };
        localStorage.setItem(USER_KEY, JSON.stringify(updated));
        return updated;
      });

      // TODO: Sync with backend API
      await new Promise(resolve => setTimeout(resolve, 500));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updatePreferences = useCallback(async (prefs: Partial<UserPreferences>) => {
    setIsLoading(true);
    try {
      setUser(prev => {
        if (!prev) return null;
        const updated = {
          ...prev,
          preferences: {
            ...prev.preferences,
            ...prefs,
            notifications: {
              ...prev.preferences.notifications,
              ...prefs.notifications,
            },
          },
        };
        localStorage.setItem(USER_KEY, JSON.stringify(updated));
        return updated;
      });
      await new Promise(resolve => setTimeout(resolve, 300));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateAvatar = useCallback(async (avatarUrl: string) => {
    setIsLoading(true);
    try {
      setUser(prev => {
        if (!prev) return null;
        const updated = { ...prev, avatar: avatarUrl, image: avatarUrl };
        localStorage.setItem(USER_KEY, JSON.stringify(updated));
        return updated;
      });
      await new Promise(resolve => setTimeout(resolve, 500));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
    await signOut({ callbackUrl: "/" });
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) return;

      const response = await fetch("/api/auth/session", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(prev => {
          if (!prev) return null;
          const updated = { ...prev, ...userData };
          localStorage.setItem(USER_KEY, JSON.stringify(updated));
          return updated;
        });
      } else if (response.status === 401) {
        await logout();
      }
    } catch (error) {
      console.error("Error refreshing user:", error);
    }
  }, [logout]);

  // Validate token periodically
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;

    const interval = setInterval(() => {
      refreshUser();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [refreshUser]);

  const value: UserContextType = {
    user,
    isLoading: isLoading || status === "loading",
    isAuthenticated: !!user,
    updateProfile,
    updatePreferences,
    updateAvatar,
    logout,
    refreshUser,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

// Re-export for compatibility
export { useUser as useAuth };

// Utility functions for avatar
export function getAvatarColor(name: string | null | undefined): string {
  if (!name) return "#3B82F6";
  
  const colors = [
    "#3B82F6", // blue-500
    "#10B981", // emerald-500
    "#F59E0B", // amber-500
    "#EF4444", // red-500
    "#8B5CF6", // violet-500
    "#EC4899", // pink-500
    "#06B6D4", // cyan-500
    "#84CC16", // lime-500
    "#F97316", // orange-500
    "#6366F1", // indigo-500
  ];
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
}

export function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
