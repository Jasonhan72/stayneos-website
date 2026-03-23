"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

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

function toUserProfile(user: {
  id: string;
  name?: string | null;
  email: string;
  role?: string | null;
  avatar?: string | null;
}): UserProfile {
  const name = (user.name || user.email?.split('@')[0] || 'User').trim();
  const parts = name.split(/\s+/).filter(Boolean);

  return {
    id: user.id,
    firstName: parts[0] || '',
    lastName: parts.slice(1).join(' '),
    name,
    email: user.email,
    image: user.avatar || undefined,
    avatar: user.avatar || undefined,
    preferences: defaultPreferences,
    memberSince: new Date().toISOString().split('T')[0],
    memberLevel: 'Standard',
    role: user.role || 'GUEST',
  };
}


export function UserProvider({ children }: { children: ReactNode }) {
  // Always start with null to match SSR
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage/cookie-backed session after hydration
  useEffect(() => {
    const loadUserFromStorage = async () => {
      if (typeof window === 'undefined') return;

      try {
        const storedUser = localStorage.getItem(USER_KEY);
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          if (!parsedUser.preferences) {
            parsedUser.preferences = defaultPreferences;
          }
          setUser(parsedUser);
          return;
        }

        // OAuth flow uses HttpOnly cookie, so bootstrap user from server session API
        const token = localStorage.getItem(TOKEN_KEY);
        const response = await fetch('/api/auth/session', {
          credentials: 'include',
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          cache: 'no-store',
        });

        if (response.ok) {
          const data = await response.json();
          if (data?.user) {
            const profile = toUserProfile(data.user);
            setUser(profile);
            localStorage.setItem(USER_KEY, JSON.stringify(profile));
          }
        }
      } catch (error) {
        console.error('Error loading user session:', error);
        localStorage.removeItem(USER_KEY);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserFromStorage();
  }, []);

  // Listen for storage changes (for login/logout across tabs)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === USER_KEY) {
        if (e.newValue) {
          try {
            const parsedUser = JSON.parse(e.newValue);
            setUser(parsedUser);
          } catch {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
    };

    const handleCustomEvent = () => {
      const storedUser = localStorage.getItem(USER_KEY);
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("localStorageChange", handleCustomEvent);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("localStorageChange", handleCustomEvent);
    };
  }, []);

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
        
        // Trigger locale change if language was updated
        if (prefs.language) {
          window.dispatchEvent(new CustomEvent('localeChange'));
          localStorage.setItem('preferred-locale', prefs.language);
        }
        
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
    // Clear HttpOnly auth cookie via API
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch (e) {
      console.error('Logout API error:', e);
    }
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
    // Dispatch event to notify other components (like Navbar)
    window.dispatchEvent(new CustomEvent("localStorageChange"));
    // Redirect to home
    window.location.href = "/";
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const response = await fetch('/api/auth/session', {
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        cache: 'no-store',
      });

      if (response.ok) {
        const data = await response.json();
        if (data?.user) {
          const profile = toUserProfile(data.user);
          setUser(profile);
          localStorage.setItem(USER_KEY, JSON.stringify(profile));
        }
      } else if (response.status === 401) {
        await logout();
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  }, [logout]);

  // Validate active session periodically
  useEffect(() => {
    const interval = setInterval(() => {
      refreshUser();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [refreshUser]);

  const value: UserContextType = {
    user,
    isLoading,
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
