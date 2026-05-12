"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode, useRef, useMemo } from 'react';
import { useToastHelpers } from '@/components/ui';

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
  address?: string;
  bio?: string;
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
  deletionStatus?: 'active' | 'pending_deletion' | 'deleted';
  deletionRequestedAt?: string;
  deletionScheduledAt?: string;
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

const USER_KEY = "stayneos_user_data";

const UserContext = createContext<UserContextType | undefined>(undefined);

function normalizeString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
}

function normalizeUserProfile(raw: unknown): UserProfile | null {
  if (!raw || typeof raw !== 'object') return null;

  const user = raw as Record<string, unknown>;
  const id = normalizeString(user.id);
  if (!id) return null;

  const email = normalizeString(user.email) || '';
  const fallbackName = normalizeString(user.name) || (email ? email.split('@')[0] : undefined) || 'User';
  const nameParts = fallbackName.split(/\s+/).filter(Boolean);
  const firstName = normalizeString(user.firstName) || nameParts[0] || '';
  const lastName = normalizeString(user.lastName) || nameParts.slice(1).join(' ');
  const deletionStatusRaw = normalizeString(user.deletionStatus);
  const deletionStatus = deletionStatusRaw === 'pending_deletion' || deletionStatusRaw === 'deleted' || deletionStatusRaw === 'active'
    ? deletionStatusRaw
    : 'active';

  const preferencesCandidate = user.preferences;
  const preferences = preferencesCandidate && typeof preferencesCandidate === 'object'
    ? {
        language: (preferencesCandidate as Record<string, unknown>).language === 'fr' || (preferencesCandidate as Record<string, unknown>).language === 'zh' ? (preferencesCandidate as Record<string, unknown>).language as UserPreferences['language'] : 'en',
        currency: ['CAD', 'USD', 'EUR', 'CNY'].includes(String((preferencesCandidate as Record<string, unknown>).currency || ''))
          ? (preferencesCandidate as Record<string, unknown>).currency as UserPreferences['currency']
          : defaultPreferences.currency,
        notifications: {
          email: typeof (preferencesCandidate as Record<string, unknown>).notifications === 'object' && typeof ((preferencesCandidate as Record<string, unknown>).notifications as Record<string, unknown>).email === 'boolean'
            ? ((preferencesCandidate as Record<string, unknown>).notifications as Record<string, unknown>).email as boolean
            : defaultPreferences.notifications.email,
          sms: typeof (preferencesCandidate as Record<string, unknown>).notifications === 'object' && typeof ((preferencesCandidate as Record<string, unknown>).notifications as Record<string, unknown>).sms === 'boolean'
            ? ((preferencesCandidate as Record<string, unknown>).notifications as Record<string, unknown>).sms as boolean
            : defaultPreferences.notifications.sms,
          marketing: typeof (preferencesCandidate as Record<string, unknown>).notifications === 'object' && typeof ((preferencesCandidate as Record<string, unknown>).notifications as Record<string, unknown>).marketing === 'boolean'
            ? ((preferencesCandidate as Record<string, unknown>).notifications as Record<string, unknown>).marketing as boolean
            : defaultPreferences.notifications.marketing,
        },
      }
    : defaultPreferences;

  return {
    id,
    firstName,
    lastName,
    name: [firstName, lastName].filter(Boolean).join(' ').trim() || fallbackName,
    email,
    image: normalizeString(user.image) || normalizeString(user.avatar),
    avatar: normalizeString(user.avatar) || normalizeString(user.image),
    phone: normalizeString(user.phone),
    address: normalizeString(user.address),
    preferences,
    memberSince: normalizeString(user.memberSince) || new Date().toISOString().split('T')[0],
    memberLevel: normalizeString(user.memberLevel) || 'Standard',
    role: normalizeString(user.role) || 'GUEST',
    deletionStatus,
    deletionRequestedAt: normalizeString(user.deletionRequestedAt),
    deletionScheduledAt: normalizeString(user.deletionScheduledAt),
  };
}

function toUserProfile(user: {
  id?: string | null;
  name?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  role?: string | null;
  avatar?: string | null;
  image?: string | null;
  phone?: string | null;
  address?: string | null;
  deletionStatus?: string | null;
  deletionRequestedAt?: string | null;
  deletionScheduledAt?: string | null;
  memberSince?: string | null;
  memberLevel?: string | null;
  preferences?: Partial<UserPreferences> | null;
}): UserProfile {
  const profile = normalizeUserProfile(user);
  if (!profile) {
    throw new Error('Invalid user payload');
  }
  return profile;
}


export function UserProvider({ children }: { children: ReactNode }) {
  const toast = useToastHelpers();
  const { warning: showWarningToast } = toast;
  const pendingDeletionNoticeShownRef = useRef<string | null>(null);
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
          const parsedUser = normalizeUserProfile(JSON.parse(storedUser));
          if (parsedUser) {
            setUser(parsedUser);
            localStorage.setItem(USER_KEY, JSON.stringify(parsedUser));
            return;
          }
          localStorage.removeItem(USER_KEY);
        }

        // OAuth flow uses HttpOnly cookie, so bootstrap user from server session API
        const response = await fetch('/api/auth/session', {
          credentials: 'include',
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
        if (process.env.NODE_ENV !== 'production') console.error('Error loading user session:', error);
        localStorage.removeItem(USER_KEY);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserFromStorage();
  }, []);

  useEffect(() => {
    if (!user || user.deletionStatus !== 'pending_deletion' || !user.deletionScheduledAt) {
      pendingDeletionNoticeShownRef.current = null;
      return;
    }

    const noticeKey = `${user.id}:${user.deletionScheduledAt}`;
    if (pendingDeletionNoticeShownRef.current === noticeKey) {
      return;
    }

    const deletionDate = new Date(user.deletionScheduledAt);
    const daysRemaining = Math.max(0, Math.ceil((deletionDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

    pendingDeletionNoticeShownRef.current = noticeKey;
    showWarningToast(
      '账号正在删除流程中',
      `账号将在 ${daysRemaining} 天后永久删除。前往 Account > Delete account 可恢复账号。`,
      8000,
    );
  }, [showWarningToast, user]);

  // Listen for storage changes (for login/logout across tabs)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === USER_KEY) {
        if (e.newValue) {
          try {
            setUser(normalizeUserProfile(JSON.parse(e.newValue)));
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
          setUser(normalizeUserProfile(JSON.parse(storedUser)));
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
    if (!user) {
      throw new Error('Not authenticated');
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.error || 'Failed to update profile');
      }

      const nextUser = toUserProfile(payload.user ?? { ...user, ...data });
      nextUser.preferences = user.preferences;
      nextUser.memberSince = user.memberSince;
      nextUser.memberLevel = user.memberLevel;
      localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
      setUser(nextUser);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

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
      if (process.env.NODE_ENV !== 'production') console.error('Logout API error:', e);
    }
    localStorage.removeItem(USER_KEY);
    setUser(null);
    // Dispatch event to notify other components (like Navbar)
    window.dispatchEvent(new CustomEvent("localStorageChange"));
    // Redirect to home
    window.location.href = "/";
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/session', {
        credentials: 'include',
        cache: 'no-store',
      });

      if (response.ok) {
        const data = await response.json();
        if (data?.user) {
          const profile = toUserProfile(data.user);
          if (user?.preferences) {
            profile.preferences = user.preferences;
            profile.memberSince = user.memberSince;
            profile.memberLevel = user.memberLevel;
          }
          setUser(profile);
          localStorage.setItem(USER_KEY, JSON.stringify(profile));
        }
      } else if (response.status === 401) {
        await logout();
      }
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') console.error('Error refreshing user:', error);
    }
  }, [logout, user?.memberLevel, user?.memberSince, user?.preferences]);

  // Validate active session periodically
  useEffect(() => {
    const interval = setInterval(() => {
      refreshUser();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [refreshUser]);

  const value: UserContextType = useMemo(() => ({
    user,
    isLoading,
    isAuthenticated: !!user,
    updateProfile,
    updatePreferences,
    updateAvatar,
    logout,
    refreshUser,
  }), [user, isLoading, updateProfile, updatePreferences, updateAvatar, logout, refreshUser]);

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
