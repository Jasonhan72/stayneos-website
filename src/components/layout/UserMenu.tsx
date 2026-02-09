"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  User, 
  Home, 
  Heart, 
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/UserContext";

interface UserMenuProps {
  variant?: "light" | "dark" | "transparent";
}

export function UserMenu({ variant = "light" }: UserMenuProps) {
  const { user, logout, isLoading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close menu on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen]);

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
  };

  if (isLoading) {
    return (
      <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
    );
  }

  const isDarkStyle = variant === "dark" || variant === "transparent";

  // Not logged in state - Blueground style
  if (!user) {
    return (
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex items-center gap-1 p-2 rounded-full transition-all duration-200",
            "hover:bg-black/5 focus:outline-none",
            isOpen && "bg-black/5"
          )}
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <User 
            className={cn(
              "w-5 h-5",
              isDarkStyle ? "text-white" : "text-neutral-700"
            )} 
          />
          {isOpen ? (
            <ChevronUp 
              className={cn(
                "w-4 h-4",
                isDarkStyle ? "text-white/60" : "text-neutral-500"
              )} 
            />
          ) : (
            <ChevronDown 
              className={cn(
                "w-4 h-4",
                isDarkStyle ? "text-white/60" : "text-neutral-500"
              )} 
            />
          )}
        </button>

        {/* Dropdown Menu - Not Logged In */}
        <div
          className={cn(
            "absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-xl border border-neutral-100",
            "transition-all duration-200 origin-top-right z-50",
            isOpen 
              ? "opacity-100 scale-100 translate-y-0 pointer-events-auto" 
              : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
          )}
        >
          <div className="py-1">
            <Link
              href="/register"
              onClick={() => setIsOpen(false)}
              className={cn(
                "block px-4 py-2.5 text-sm text-neutral-700",
                "hover:bg-neutral-50 hover:text-primary transition-colors duration-150"
              )}
            >
              Sign up
            </Link>
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className={cn(
                "block px-4 py-2.5 text-sm text-neutral-700",
                "hover:bg-neutral-50 hover:text-primary transition-colors duration-150"
              )}
            >
              Log in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Logged in state - Blueground style menu
  const menuItems = [
    {
      label: "Profile",
      href: "/profile",
      icon: User,
    },
    {
      label: "Bookings",
      href: "/dashboard/bookings",
      icon: Home,
    },
    {
      label: "Wishlists",
      href: "/wishlists",
      icon: Heart,
    },
  ];

  // Get initials from user name
  const getInitials = (name: string) => {
    if (!name || name.trim() === '') return '?';
    return name
      .split(" ")
      .filter(n => n && n.length > 0)
      .map((n) => n.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2) || '?';
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Avatar Button - Blueground Style */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 pl-1 pr-2 py-1 rounded-full transition-all duration-200",
          "hover:bg-black/5 focus:outline-none",
          isOpen && "bg-black/5"
        )}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {/* Avatar - Show image if available, otherwise initials */}
        {user?.avatar || user?.image ? (
          <div className="w-9 h-9 rounded-full overflow-hidden bg-neutral-100">
            <Image
              src={user.avatar || user.image!}
              alt={user.name || "User"}
              width={36}
              height={36}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className={cn(
            "w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold",
            "bg-[#e3f2fd] text-[#1967d2]"
          )}>
            {getInitials(user.name || user.email || "User")}
          </div>
        )}
        {isOpen ? (
          <ChevronUp 
            className={cn(
              "w-4 h-4",
              isDarkStyle ? "text-white/60" : "text-neutral-400"
            )} 
          />
        ) : (
          <ChevronDown 
            className={cn(
              "w-4 h-4",
              isDarkStyle ? "text-white/60" : "text-neutral-400"
            )} 
          />
        )}
      </button>

      {/* Dropdown Menu - Logged In */}
      <div
        className={cn(
          "absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-neutral-100",
          "transition-all duration-200 origin-top-right z-50",
          isOpen 
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto" 
            : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
        )}
      >
        {/* Menu Items with Icons */}
        <div className="py-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 text-sm text-neutral-700",
                "hover:bg-neutral-50 transition-colors duration-150"
              )}
            >
              <item.icon className="w-5 h-5 text-neutral-500" />
              {item.label}
            </Link>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-neutral-100" />

        {/* Logout */}
        <div className="py-2">
          <button
            onClick={handleLogout}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600",
              "hover:bg-red-50 transition-colors duration-150"
            )}
          >
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserMenu;
