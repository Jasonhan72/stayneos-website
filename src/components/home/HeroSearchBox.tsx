'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Calendar, ChevronRight, MapPin, Search } from 'lucide-react';
import { AirbnbCalendar } from '@/components/booking';
import { Button } from '@/components/ui';
import { useI18n } from '@/lib/i18n';

export function HeroSearchBox() {
  const [location, setLocation] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { t, locale } = useI18n();

  const formatDate = (dateStr: string) => {
    if (!dateStr) {
      return '';
    }

    const date = new Date(dateStr);
    return date.toLocaleDateString(
      locale === 'zh' ? 'zh-CN' : locale === 'fr' ? 'fr-FR' : 'en-US',
      { month: 'short', day: 'numeric' }
    );
  };

  return (
    <div className="bg-white p-4 shadow-2xl max-w-4xl mx-auto">
      <div className="mb-3">
        <div className="relative h-14">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
            <MapPin size={20} />
          </div>
          <input
            type="text"
            placeholder={t('search.selectLocation')}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full h-full pl-12 pr-4 bg-neutral-50 border border-neutral-200 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all text-base"
          />
        </div>
      </div>

      <div className="mb-3">
        <button
          type="button"
          onClick={() => setShowDatePicker(true)}
          className="w-full h-14 flex items-center justify-between px-4 bg-neutral-50 border border-neutral-200 hover:border-neutral-300 transition-all text-left"
        >
          <div className="flex items-center gap-3">
            <Calendar size={20} className="text-neutral-400" />
            <div>
              <div className="text-sm text-neutral-900">
                {checkIn && checkOut
                  ? `${formatDate(checkIn)} - ${formatDate(checkOut)}`
                  : t('booking.selectDates') || 'Select dates'}
              </div>
              <div className="text-sm text-neutral-400 mt-0.5">
                {checkIn && checkOut
                  ? `${Math.ceil(
                      (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
                        (1000 * 60 * 60 * 24)
                    )} nights`
                  : 'Add dates'}
              </div>
            </div>
          </div>
          <ChevronRight size={20} className="text-neutral-400" />
        </button>

        {showDatePicker && (
          <AirbnbCalendar
            checkIn={checkIn}
            checkOut={checkOut}
            onSelectCheckIn={setCheckIn}
            onSelectCheckOut={setCheckOut}
            onClose={() => setShowDatePicker(false)}
            onClearDates={() => {
              setCheckIn('');
              setCheckOut('');
            }}
            minNights={28}
            currency="CAD"
          />
        )}
      </div>

      <Link href="/properties" className="block h-14">
        <Button variant="primary" size="lg" className="w-full h-full flex items-center justify-center">
          <Search size={20} className="mr-2" />
          {t('search.search')}
        </Button>
      </Link>
    </div>
  );
}
