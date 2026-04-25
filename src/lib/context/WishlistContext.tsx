'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

const STORAGE_KEY = 'stayneos_wishlist';

interface WishlistContextType {
  wishlist: string[];
  isWishlisted: (id: string) => boolean;
  toggleWishlist: (id: string) => void;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

function loadLocal(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveLocal(ids: string[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {}
}

/** Guess whether the user is signed in by looking for a session cookie. */
function isLoggedIn(): boolean {
  if (typeof document === 'undefined') return false;
  // next-auth.session-token is the default; also check for any auth cookie.
  if (document.cookie.includes('next-auth.session-token')) return true;
  if (document.cookie.includes('__Secure-next-auth.session-token')) return true;
  return false;
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<string[]>(loadLocal);
  const [_ready, setReady] = useState(false);
  const syncLock = useRef(false);

  // Hydrate from server on mount when signed in.
  useEffect(() => {
    if (!isLoggedIn()) {
      setReady(true);
      return;
    }

    fetch('/api/wishlist', { credentials: 'include' })
      .then(async (res) => {
        if (!res.ok) throw new Error('wishlist fetch failed');
        const body = (await res.json()) as { wishlist?: { id: string }[] };
        const serverIds = (body.wishlist ?? []).map((x) => x.id);
        const localIds = loadLocal();

        // Merge: server wins, but add local items that aren't on server.
        const merged = [...serverIds];
        for (const id of localIds) {
          if (!merged.includes(id)) merged.push(id);
        }

        if (merged.length > serverIds.length) {
          // Push local items to server.
          syncLock.current = true;
          const localOnly = localIds.filter((id) => !serverIds.includes(id));
          for (const id of localOnly) {
            fetch('/api/wishlist', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ propertyId: id, action: 'add' }),
            }).catch(() => {});
          }
        }

        setWishlist(merged);
        saveLocal(merged);
      })
      .catch(() => {
        // Fallback to local when offline/error.
        setWishlist(loadLocal());
      })
      .finally(() => setReady(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Listen to storage events from other tabs.
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && !syncLock.current) {
        setWishlist(loadLocal());
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const isWishlisted = useCallback(
    (id: string) => wishlist.includes(id),
    [wishlist]
  );

  const toggleWishlist = useCallback(
    (id: string) => {
      const next = wishlist.includes(id)
        ? wishlist.filter((x) => x !== id)
        : [...wishlist, id];
      setWishlist(next);
      saveLocal(next);

      if (isLoggedIn()) {
        const action = wishlist.includes(id) ? 'remove' : 'add';
        fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ propertyId: id, action }),
        }).catch(() => {});
      }
    },
    [wishlist]
  );

  const clearWishlist = useCallback(() => {
    saveLocal([]);
    setWishlist([]);
  }, []);

  return (
    <WishlistContext.Provider
      value={{ wishlist, isWishlisted, toggleWishlist, clearWishlist }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
