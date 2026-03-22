'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Shield, Star, MessageCircle, Award, Calendar } from 'lucide-react';
import { HostPublicProfile, HostLevel } from '@/types/host';
import { useI18n } from '@/lib/i18n';

interface HostCardProps {
  host: HostPublicProfile;
  variant?: 'compact' | 'full';
  showContact?: boolean;
}

// Host等级配置
const hostLevelConfig: Record<HostLevel, { label: string; color: string; icon: React.ReactNode }> = {
  new: { 
    label: 'New Host', 
    color: 'bg-gray-100 text-gray-700',
    icon: <Calendar className="w-3 h-3" />
  },
  rising: { 
    label: 'Rising Host', 
    color: 'bg-blue-100 text-blue-700',
    icon: <Award className="w-3 h-3" />
  },
  established: { 
    label: 'Established Host', 
    color: 'bg-purple-100 text-purple-700',
    icon: <Award className="w-3 h-3" />
  },
  superhost: { 
    label: 'Superhost', 
    color: 'bg-rose-100 text-rose-700',
    icon: <Star className="w-3 h-3 fill-rose-700" />
  },
};

export function HostCard({ host, variant = 'full', showContact = true }: HostCardProps) {
  const { t } = useI18n();
  const levelConfig = hostLevelConfig[host.hostLevel];
  
  if (variant === 'compact') {
    return (
      <Link 
        href={`/property/${host.id}`} 
        className="flex items-center gap-3 group p-2 -m-2 rounded-lg hover:bg-neutral-50 transition-colors"
      >
        <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
          <Image
            src={host.avatarUrl || '/images/default-avatar.jpg'}
            alt={host.displayName}
            fill
            className="object-cover"
          />
        </div>
        <div className="min-w-0">
          <p className="font-medium text-neutral-900 group-hover:text-primary transition-colors truncate">
            Hosted by {host.displayName}
          </p>
          {host.isVerified && (
            <p className="text-xs text-neutral-500 flex items-center gap-1">
              <Shield size={12} className="text-green-500" /> 
              Verified
            </p>
          )}
        </div>
      </Link>
    );
  }

  return (
    <div className="flex items-start gap-4 py-6">
      {/* Avatar */}
      <Link href={`/property/${host.id}`} className="shrink-0">
        <div className="relative w-16 h-16 rounded-full overflow-hidden hover:ring-2 ring-primary transition-all">
          <Image
            src={host.avatarUrl || '/images/default-avatar.jpg'}
            alt={host.displayName}
            fill
            className="object-cover"
          />
        </div>
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <Link href={`/property/${host.id}`}>
          <h3 className="font-semibold text-lg text-neutral-900 hover:text-primary transition-colors">
            Hosted by {host.displayName}
          </h3>
        </Link>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mt-2">
          {/* Host Level Badge */}
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full ${levelConfig.color}`}>
            {levelConfig.icon}
            {levelConfig.label}
          </span>
          
          {/* Verified Badge */}
          {host.isVerified && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
              <Shield size={12} />
              Identity verified
            </span>
          )}
          
          {/* Rating Badge */}
          {host.rating >= 4.8 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
              <Star size={12} className="fill-amber-700" />
              {host.rating} rating
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-sm text-neutral-600">
          {host.totalProperties > 0 && (
            <span>{host.totalProperties} {t('host.properties', 'properties')}</span>
          )}
          <span>·</span>
          <span>{host.yearsHosting} {t('host.yearsHosting', { count: host.yearsHosting })}</span>
          {host.responseRate > 0 && (
            <>
              <span>·</span>
              <span>{host.responseRate}% {t('host.responseRate', 'response rate')}</span>
            </>
          )}
        </div>

        {/* Tagline/Bio */}
        {host.tagline && (
          <p className="mt-3 text-sm text-neutral-600 line-clamp-2">
            {host.tagline}
          </p>
        )}
      </div>

      {/* Contact Button */}
      {showContact && (
        <button className="shrink-0 px-4 py-2 border border-neutral-900 rounded-lg font-medium hover:bg-neutral-50 transition-colors flex items-center gap-2 text-sm">
          <MessageCircle size={16} />
          Contact
        </button>
      )}
    </div>
  );
}

// 导出Host等级徽章组件
export function HostBadge({ level, showIcon = true }: { level: HostLevel; showIcon?: boolean }) {
  const config = hostLevelConfig[level];
  
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${config.color}`}>
      {showIcon && config.icon}
      {config.label}
    </span>
  );
}
