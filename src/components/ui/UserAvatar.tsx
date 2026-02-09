"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { getInitials, getAvatarColor } from "@/lib/UserContext";

interface UserAvatarProps {
  name: string | null;
  image?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showStatus?: boolean;
  status?: "online" | "offline" | "away";
}

const sizeClasses = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-16 h-16 text-lg",
};

const statusClasses = {
  sm: "w-2.5 h-2.5",
  md: "w-3 h-3",
  lg: "w-3.5 h-3.5",
  xl: "w-4 h-4",
};

const statusColors = {
  online: "bg-green-500",
  offline: "bg-gray-400",
  away: "bg-yellow-500",
};

export function UserAvatar({
  name,
  image,
  size = "md",
  className,
  showStatus = false,
  status = "offline",
}: UserAvatarProps) {
  const [imageError, setImageError] = useState(false);
  const bgColor = getAvatarColor(name);
  const initials = getInitials(name);

  const showInitials = !image || imageError;

  return (
    <div className={cn("relative inline-block", className)}>
      <div
        className={cn(
          "relative rounded-full overflow-hidden flex items-center justify-center font-semibold text-white transition-all duration-200",
          "ring-2 ring-white shadow-sm",
          sizeClasses[size]
        )}
        style={{ backgroundColor: showInitials ? bgColor : undefined }}
      >
        {showInitials ? (
          <span className="select-none">{initials}</span>
        ) : (
          <Image
            src={image}
            alt={name || "User avatar"}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
            sizes="(max-width: 768px) 32px, 40px"
          />
        )}
      </div>
      
      {showStatus && (
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full border-2 border-white",
            statusClasses[size],
            statusColors[status]
          )}
        />
      )}
    </div>
  );
}

// Compact avatar for tight spaces
export function UserAvatarCompact({
  name,
  image,
  className,
}: {
  name: string | null;
  image?: string | null;
  className?: string;
}) {
  const [imageError, setImageError] = useState(false);
  const bgColor = getAvatarColor(name);
  const initials = getInitials(name);
  const showInitials = !image || imageError;

  return (
    <div
      className={cn(
        "w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-xs font-semibold text-white shrink-0",
        className
      )}
      style={{ backgroundColor: showInitials ? bgColor : undefined }}
    >
      {showInitials ? (
        <span className="select-none">{initials}</span>
      ) : (
        <Image
          src={image}
          alt={name || "User avatar"}
          width={32}
          height={32}
          className="object-cover w-full h-full"
          onError={() => setImageError(true)}
        />
      )}
    </div>
  );
}

export default UserAvatar;
