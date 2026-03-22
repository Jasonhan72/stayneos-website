'use client';

import { createContext, useCallback, useContext, useSyncExternalStore } from 'react';

const STORAGE_KEY = 'stayneos_wishlist';

interface WishlistContextType {
  wishlist: string[]; // array of property IDs
  isWishlisted: (id: string) => boolean;
  toggleWishlist: (id: string) => void;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

function loadWishlist(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveWishlist(ids: string[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {}
}

function subscribe(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) callback();
  };
  window.addEventListener('storage', handleStorage);
  return () => window.removeEventListener('storage', handleStorage);
}

function getSnapshot(): string[] {
  return loadWishlist();
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const wishlist = useSyncExternalStore(subscribe, getSnapshot, () => []);

  const isWishlisted = useCallback(
    (id: string) => wishlist.includes(id),
    [wishlist]
  );

  const toggleWishlist = useCallback((id: string) => {
    const next = wishlist.includes(id) 
      ? wishlist.filter((x) => x !== id) 
      : [...wishlist, id];
    saveWishlist(next);
    // Trigger storage event for other tabs
    window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY }));
  }, [wishlist]);

  const clearWishlist = useCallback(() => {
    saveWishlist([]);
    window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY }));
  }, []);

  return (
    <WishlistContext.Provider value={{ wishlist, isWishlisted, toggleWishlist, clearWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
