"use client";

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Camera, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser } from '@/lib/context/UserContext';

interface AvatarUploadProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export default function AvatarUpload({ size = 'lg', className }: AvatarUploadProps) {
  const { user, updateAvatar } = useUser();
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(user?.avatar || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'w-10 h-10 text-sm',
    md: 'w-16 h-16 text-lg',
    lg: 'w-24 h-24 text-xl',
    xl: 'w-32 h-32 text-2xl',
  };

  const iconSizes = {
    sm: 14,
    md: 20,
    lg: 24,
    xl: 32,
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    setIsUploading(true);
    try {
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In real implementation, upload to server/cloud storage
      // and get the URL back
      await updateAvatar(reader.result as string);
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      alert('Failed to upload avatar. Please try again.');
      // Revert to previous avatar
      setPreviewUrl(user?.avatar || null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async () => {
    setIsUploading(true);
    try {
      await updateAvatar('');
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={cn("relative", className)}>
      <div
        className={cn(
          "relative rounded-full overflow-hidden flex items-center justify-center",
          sizeClasses[size],
          previewUrl 
            ? "" 
            : "bg-accent text-primary font-semibold",
          className
        )}
      >
        {previewUrl ? (
          <Image
            src={previewUrl}
            alt={user ? `${user.firstName} ${user.lastName}` : 'Profile'}
            fill
            className="object-cover"
          />
        ) : user ? (
          getInitials(user.firstName, user.lastName)
        ) : (
          '?'
        )}

        {/* Hover overlay */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className={cn(
            "absolute inset-0 flex items-center justify-center bg-black/50 transition-opacity",
            "opacity-0 hover:opacity-100 focus:opacity-100",
            "text-white cursor-pointer"
          )}
        >
          {isUploading ? (
            <Loader2 size={iconSizes[size]} className="animate-spin" />
          ) : (
            <Camera size={iconSizes[size]} />
          )}
        </button>
      </div>

      {/* Remove button */}
      {previewUrl && (
        <button
          onClick={handleRemove}
          disabled={isUploading}
          className={cn(
            "absolute -top-1 -right-1 p-1.5 rounded-full bg-red-500 text-white shadow-md",
            "hover:bg-red-600 transition-colors",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
          title="Remove photo"
        >
          <X size={14} />
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />
    </div>
  );
}
