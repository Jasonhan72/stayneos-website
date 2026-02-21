'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';

export interface AirbnbCalendarProps {
  checkIn: string;
  checkOut: string;
  onSelectCheckIn: (date: string) => void;
  onSelectCheckOut: (date: string) => void;
  onClose?: () => void;
  pricePerNight?: number;
  minNights?: number;
  className?: string;
  showFooter?: boolean;
}

// Generate calendar data for a month
const generateMonthData = (year: number, month: number) => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDay = firstDay.getDay();
  
  return {
    year,
    month,
    daysInMonth,
    startingDay,
  };
};

// Format date for display
const formatDate = (dateStr: string, locale: string = 'en') => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString(
    locale === 'zh' ? 'zh-CN' : locale === 'fr' ? 'fr-FR' : 'en-US',
    { weekday: 'short', month: 'short', day: 'numeric' }
  );
};

// Get translations
const getTranslations = (locale: string) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const translations: Record<string, Record<string, any>> = {
    zh: {
      months: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
      weekDays: ['日', '一', '二', '三', '四', '五', '六'],
      selectCheckIn: '选择入住日期',
      selectCheckOut: '选择退房日期',
      clearDates: '清除日期',
      save: '保存',
      nights: '晚',
      night: '晚',
    },
    en: {
      months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      weekDays: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
      selectCheckIn: 'Select check-in date',
      selectCheckOut: 'Select check-out date',
      clearDates: 'Clear dates',
      save: 'Save',
      nights: 'nights',
      night: 'night',
    },
    fr: {
      months: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
      weekDays: ['Di', 'Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa'],
      selectCheckIn: "Sélectionnez la date d'arrivée",
      selectCheckOut: 'Sélectionnez la date de départ',
      clearDates: 'Effacer les dates',
      save: 'Enregistrer',
      nights: 'nuits',
      night: 'nuit',
    },
  };
  return translations[locale] || translations.en;
};

export function AirbnbCalendar({
  checkIn,
  checkOut,
  onSelectCheckIn,
  onSelectCheckOut,
  onClose,
  pricePerNight,
  minNights = 1,
  className,
  showFooter = true,
}: AirbnbCalendarProps) {
  const { locale } = useI18n();
  const t = getTranslations(locale);
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on mount
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Calculate months to display
  const currentMonthData = generateMonthData(currentMonth.getFullYear(), currentMonth.getMonth());
  const nextMonthData = generateMonthData(
    currentMonth.getMonth() === 11 ? currentMonth.getFullYear() + 1 : currentMonth.getFullYear(),
    (currentMonth.getMonth() + 1) % 12
  );

  // Get today's date for disabling past dates
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Calculate nights and price
  const nights = checkIn && checkOut 
    ? Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  
  const totalPrice = nights > 0 && pricePerNight ? nights * pricePerNight : 0;

  // Check if date is disabled
  const isDateDisabled = (year: number, month: number, day: number) => {
    const date = new Date(year, month, day);
    return date < today;
  };

  // Get date status for styling
  const getDateStatus = (year: number, month: number, day: number): 'none' | 'start' | 'end' | 'between' => {
    const dateStr = new Date(year, month, day).toISOString().split('T')[0];
    const date = new Date(year, month, day);
    const start = checkIn ? new Date(checkIn) : null;
    const end = checkOut ? new Date(checkOut) : null;
    
    if (checkIn && dateStr === checkIn) return 'start';
    if (checkOut && dateStr === checkOut) return 'end';
    if (start && end && date > start && date < end) return 'between';
    return 'none';
  };

  // Handle date click - Airbnb style: click for check-in, click again for check-out
  const handleDateClick = useCallback((year: number, month: number, day: number) => {
    const dateStr = new Date(year, month, day).toISOString().split('T')[0];
    const clickedDate = new Date(year, month, day);
    
    // If no check-in or both dates selected, start fresh with check-in
    if (!checkIn || (checkIn && checkOut)) {
      onSelectCheckIn(dateStr);
      onSelectCheckOut('');
    } else {
      // Have check-in, selecting check-out
      const startDate = new Date(checkIn);
      
      // If clicked date is before or same as check-in, make it the new check-in
      if (clickedDate <= startDate) {
        onSelectCheckIn(dateStr);
        onSelectCheckOut('');
      } else {
        // Validate min nights
        const selectedNights = Math.ceil((clickedDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        if (selectedNights >= minNights) {
          onSelectCheckOut(dateStr);
        } else {
          // Still allow selection but could show warning
          onSelectCheckOut(dateStr);
        }
      }
    }
  }, [checkIn, checkOut, minNights, onSelectCheckIn, onSelectCheckOut]);

  // Navigation handlers
  const goToPrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // Clear dates
  const clearDates = () => {
    onSelectCheckIn('');
    onSelectCheckOut('');
  };

  // Get selection display text
  const getSelectionDisplay = () => {
    if (!checkIn) {
      return { text: t.selectCheckIn, subText: '' };
    }
    if (!checkOut) {
      return { 
        text: formatDate(checkIn, locale),
        subText: t.selectCheckOut
      };
    }
    return {
      text: `${nights} ${nights > 1 ? t.nights : t.night}`,
      subText: `${formatDate(checkIn, locale)} - ${formatDate(checkOut, locale)}`
    };
  };

  const selection = getSelectionDisplay();

  // Render a single month
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const renderMonth = (monthData: typeof currentMonthData, _monthOffset: number) => {
    const { year, month, daysInMonth, startingDay } = monthData;
    const weekDays = t.weekDays;

    return (
      <div className="flex-1 min-w-[280px]">
        {/* Month header */}
        <h3 className="font-semibold text-center mb-4 text-neutral-900">
          {t.months[month]} {year}
        </h3>
        
        {/* Week day headers */}
        <div className="grid grid-cols-7 gap-1 text-center text-sm mb-2">
          {weekDays.map((day: string, i: number) => (
            <div key={i} className="text-neutral-500 py-2 text-xs font-medium">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-y-1">
          {/* Empty cells for days before start of month */}
          {Array.from({ length: startingDay }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}
          
          {/* Days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const disabled = isDateDisabled(year, month, day);
            const status = getDateStatus(year, month, day);
            
            // Base classes
            const baseClasses = "aspect-square flex items-center justify-center text-sm relative transition-all duration-150";
            
            // State classes
            let stateClasses = "";
            if (disabled) {
              stateClasses = "text-neutral-300 cursor-not-allowed line-through";
            } else {
              stateClasses = "cursor-pointer hover:bg-neutral-100";
            }
            
            // Selection styling - Airbnb style
            let selectionClasses = "";
            if (status === 'start' || status === 'end') {
              selectionClasses = "bg-black text-white rounded-full hover:bg-neutral-800 font-semibold";
            } else if (status === 'between') {
              selectionClasses = "bg-neutral-100 text-neutral-900";
            } else {
              selectionClasses = "rounded-full";
            }
            
            // Rounded corners for range
            let roundedClasses = "";
            if (status === 'start') {
              roundedClasses = checkOut ? "" : "rounded-full";
            } else if (status === 'end') {
              roundedClasses = "";
            } else if (status === 'between') {
              roundedClasses = "rounded-none";
            }

            return (
              <button
                key={day}
                onClick={() => !disabled && handleDateClick(year, month, day)}
                disabled={disabled}
                className={cn(baseClasses, stateClasses, selectionClasses, roundedClasses)}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className={cn("w-full", className)}>
      {/* Header with selection info */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-neutral-900">{selection.text}</h2>
        {selection.subText && (
          <p className="text-neutral-500 mt-1">{selection.subText}</p>
        )}
      </div>
      
      {/* Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button 
          onClick={goToPrevMonth}
          className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft size={20} className="text-neutral-700" />
        </button>
        
        {/* Month labels (shown on mobile since we only show one month) */}
        {isMobile && (
          <span className="font-semibold text-neutral-900">
            {t.months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </span>
        )}
        
        <button 
          onClick={goToNextMonth}
          className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
          aria-label="Next month"
        >
          <ChevronRight size={20} className="text-neutral-700" />
        </button>
      </div>
      
      {/* Calendar grid - 1 month on mobile, 2 on desktop */}
      <div className={cn(
        "flex flex-col sm:flex-row gap-4 sm:gap-8",
        isMobile && "gap-4"
      )}>
        {renderMonth(currentMonthData, 0)}
        {!isMobile && renderMonth(nextMonthData, 1)}
      </div>

      {/* Footer with actions */}
      {showFooter && (
        <div className="flex items-center justify-between mt-8 pt-4 border-t border-neutral-200">
          <button 
            onClick={clearDates}
            className="text-sm font-semibold underline underline-offset-4 text-neutral-900 hover:text-neutral-600 transition-colors"
          >
            {t.clearDates}
          </button>
          
          <div className="flex items-center gap-4">
            {nights > 0 && pricePerNight && (
              <span className="text-sm text-neutral-600">
                ${totalPrice.toLocaleString()} CAD total
              </span>
            )}
            <button
              onClick={onClose}
              disabled={!checkIn || !checkOut}
              className="px-6 py-3 bg-black text-white font-semibold rounded-lg hover:bg-neutral-800 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors"
            >
              {t.save}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AirbnbCalendar;
