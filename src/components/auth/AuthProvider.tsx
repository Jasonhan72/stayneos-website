"use client";

import { ReactNode } from "react";
import { UserProvider } from "@/lib/context/UserContext";

interface AuthProviderProps {
  children: ReactNode;
}

// AuthProvider is a wrapper around UserProvider for compatibility
export function AuthProvider({ children }: AuthProviderProps) {
  return <UserProvider>{children}</UserProvider>;
}

// Re-export useAuth from UserContext for convenience
export { useUser as useAuth } from "@/lib/context/UserContext";
