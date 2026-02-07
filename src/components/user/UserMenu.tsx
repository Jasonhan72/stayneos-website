"use client";

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useUser } from '@/lib/context/UserContext';
import { cn } from '@/lib/utils';
import {
  Calendar,
  User,
  Settings,
  Heart,
  Globe,
  Home,
  Briefcase,
  Phone,
  LogOut,
  ChevronDown,
} from 'lucide-react';

interface UserMenuProps {
  variant?: 'light' | 'dark' | 'transparent';
  isScrolled?: boolean;
}

export default function UserMenu({ variant = 'light', isScrolled = false }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, logout, isAuthenticated } = useUser();

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Get initials from name
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const currentVariant = isScrolled ? 'light' : variant;

  const textStyles = {
    light: 'text-neutral-700 hover:text-neutral-900',
    dark: 'text-white/90 hover:text-white',
    transparent: isScrolled ? 'text-neutral-700 hover:text-neutral-900' : 'text-white/90 hover:text-white',
  };

  // Menu items
  const mainMenuItems = [
    { icon: Calendar, label: 'My Bookings', href: '/dashboard/bookings' },
    { icon: User, label: 'Personal Details', href: '/profile' },
    { icon: Settings, label: 'Preferences', href: '/profile/preferences' },
    { icon: Heart, label: 'Wishlists', href: '/wishlists' },
    { icon: Globe, label: 'Language / Currency', href: '/profile/preferences' },
  ];

  const secondaryMenuItems = [
    { icon: Home, label: 'For Landlords', href: '/landlords' },
    { icon: Briefcase, label: 'For Business', href: '/business' },
    { icon: Phone, label: 'Contact Us', href: '/contact' },
  ];

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/login"
          className={cn(
            "text-sm font-medium transition-colors duration-200",
            textStyles[currentVariant]
          )}
        >
          Log in
        </Link>
        <Link
          href="/register"
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
            currentVariant === 'light' || isScrolled
              ? "bg-accent text-primary hover:bg-accent-600"
              : "bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm"
          )}
        >
          Sign up
        </Link>
      </div>
    );
  }

  return (
    <div ref={menuRef} className="relative">
      {/* Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 p-1.5 rounded-full transition-all duration-200",
          isOpen 
            ? "bg-neutral-100" 
            : "hover:bg-neutral-100/50"
        )}
      >
        <div className={cn(
          "w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold",
          user.avatar 
            ? "overflow-hidden" 
            : "bg-accent text-primary"
        )}>
          {user.avatar ? (
            <Image
              src={user.avatar}
              alt={`${user.firstName} ${user.lastName}`}
              width={36}
              height={36}
              className="object-cover w-full h-full"
            />
          ) : (
            getInitials(user.firstName, user.lastName)
          )}
        </div>
        <ChevronDown 
          size={16} 
          className={cn(
            "transition-transform duration-200",
            isOpen && "rotate-180",
            currentVariant === 'light' || isScrolled ? "text-neutral-600" : "text-white/90"
          )} 
        />
      </button>

      {/* Dropdown Menu */}
      <div
        className={cn(
          "absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-neutral-200 overflow-hidden transition-all duration-200 z-50",
          isOpen 
            ? "opacity-100 translate-y-0 visible" 
            : "opacity-0 -translate-y-2 invisible"
        )}
      >
        {/* User Header */}
        <div className="p-4 border-b border-neutral-100">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center text-base font-semibold",
              user.avatar ? "overflow-hidden" : "bg-accent text-primary"
            )}>
              {user.avatar ? (
                <Image
                  src={user.avatar}
                  alt={`${user.firstName} ${user.lastName}`}
                  width={48}
                  height={48}
                  className="object-cover w-full h-full"
                />
              ) : (
                getInitials(user.firstName, user.lastName)
              )}
            </div>
            <div>
              <p className="text-sm text-neutral-500">{getGreeting()},</p>
              <p className="font-semibold text-neutral-900">{user.firstName}</p>
            </div>
          </div>
        </div>

        {/* Main Menu Items */}
        <div className="py-2">
          {mainMenuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                <Icon size={18} className="text-neutral-500" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Divider */}
        <div className="border-t border-neutral-100"></div>

        {/* Secondary Menu Items */}
        <div className="py-2">
          {secondaryMenuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                <Icon size={18} className="text-neutral-500" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Divider */}
        <div className="border-t border-neutral-100"></div>

        {/* Logout */}
        <div className="py-2">
          <button
            onClick={() => {
              setIsOpen(false);
              logout();
            }}
            className="flex items-center gap-3 px-4 py-2.5 w-full text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={18} />
            <span className="text-sm font-medium">Log out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
