"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const TOKEN_KEY = "stayneos_auth_token";
const USER_KEY = "stayneos_user_data";

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Processing authentication...");

  useEffect(() => {
    const processAuth = async () => {
      try {
        const success = searchParams?.get("success");
        
        if (!success) {
          throw new Error("Authentication failed");
        }

        // Get auth data from cookies
        const token = getCookie("auth_token");
        const userDataStr = getCookie("auth_user");
        
        if (!token || !userDataStr) {
          throw new Error("Authentication data not found");
        }
        
        // Parse user data
        const userData = JSON.parse(userDataStr);
        
        // Store in localStorage
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(userData));
        
        // Dispatch events to notify other components
        window.dispatchEvent(new StorageEvent("storage", {
          key: USER_KEY,
          newValue: JSON.stringify(userData),
        }));
        
        window.dispatchEvent(new CustomEvent("localStorageChange"));
        
        // Clean up cookies by setting them to expire
        document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
        document.cookie = "auth_user=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
        
        setStatus("success");
        setMessage("Authentication successful! Redirecting...");
        
        // Redirect to home page
        setTimeout(() => {
          router.push("/");
          router.refresh();
        }, 1500);
        
      } catch (error) {
        console.error("Auth callback error:", error);
        setStatus("error");
        setMessage("Authentication failed. Redirecting to login...");
        
        setTimeout(() => {
          router.push("/login?error=auth_callback_failed");
        }, 2000);
      }
    };

    processAuth();
  }, [router, searchParams]);

  // Helper function to get cookie value
  function getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center">
            {status === "loading" && (
              <>
                <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <h2 className="text-xl font-semibold text-neutral-900 mb-2">
                  Completing Sign In
                </h2>
                <p className="text-neutral-600">{message}</p>
              </>
            )}
            
            {status === "success" && (
              <>
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-neutral-900 mb-2">
                  Welcome to StayNeos!
                </h2>
                <p className="text-neutral-600">{message}</p>
              </>
            )}
            
            {status === "error" && (
              <>
                <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-neutral-900 mb-2">
                  Authentication Failed
                </h2>
                <p className="text-neutral-600">{message}</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}