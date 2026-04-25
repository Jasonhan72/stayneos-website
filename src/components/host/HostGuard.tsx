"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/context/UserContext";

export default function HostGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useUser();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || !user) {
      router.replace("/login?redirect=/host");
      return;
    }

    const isHost = (user as typeof user & { isHost?: boolean }).isHost || ["ADMIN", "SUPER_ADMIN", "HOST"].includes(user.role);
    if (!isHost) {
      router.replace("/become-a-host");
    }
  }, [isAuthenticated, isLoading, router, user]);

  if (isLoading || !isAuthenticated || !user) {
    return <div className="flex min-h-[40vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-300 border-t-neutral-900" /></div>;
  }

  const isHost = (user as typeof user & { isHost?: boolean }).isHost || ["ADMIN", "SUPER_ADMIN", "HOST"].includes(user.role);
  if (!isHost) return null;

  return <>{children}</>;
}
