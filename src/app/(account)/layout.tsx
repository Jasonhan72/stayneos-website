"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/UserContext";

/**
 * Layout wrapper for the (account) route group.
 *
 * Every page under (account) — /account/*, /dashboard/*, /profile,
 * /bookings, /wishlists — requires an authenticated user. Centralising
 * the redirect here means individual pages don't have to re-implement
 * the same `useEffect → push('/login')` pattern.
 */
export default function AccountGroupLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const next = encodeURIComponent(pathname || "/");
      router.replace(`/login?next=${next}`);
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="h-8 w-40 animate-pulse rounded-md bg-neutral-100" />
        <div className="mt-6 h-48 animate-pulse rounded-2xl bg-neutral-100" />
      </div>
    );
  }

  return <>{children}</>;
}
