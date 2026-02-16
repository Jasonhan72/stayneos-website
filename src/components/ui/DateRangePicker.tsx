// Airbnb Style Dual Calendar Date Range Picker
// Features: Dual month view, touch-friendly, long-term rental highlighting

'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X, Sparkles } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';

interface DateRangePickerProps {
  checkIn: string;
  checkOut: string;
  onCheckInChange: (date: string) => void;
  onCheckOutChange: (date: string) => void;
  minNights?: number;
  monthlyDiscount?: number;
  className?: string;
}

// Generate calendar days for a month
const generateCalendarDays = (year: number, month: number) => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDay = firstDay.getDay();
  
  const days = [];
  // Empty cells for days before start of month
  for (let i = 0; i < startingDay; i++) {
    days.push(null);
  }
  // Days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }
  return days;
};

// Calculate nights between two dates
const calculateNights = (checkIn: string, checkOut: string): number => {
  if (!checkIn || !checkOut) return 0;
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
};

// Translations
const translations = {
  zh: {
    months: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    weekDays: ['日', '一', '二', '三', '四', '五', '六'],
    checkIn: '入住',
    checkOut: '退房',
    selectDate: '选择日期',
    clearDates: '清除日期',
    done: '完成',
    monthlyDiscountHint: '月租优惠',
    minNightsHint: '最少{count}晚',
  },
  en: {
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    weekDays: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
    checkIn: 'Check-in',
    checkOut: 'Check-out',
    selectDate: 'Add date',
    clearDates: 'Clear',
    done: 'Done',
    monthlyDiscountHint: 'Monthly discount',
    minNightsHint: 'Min {count} nights',
  },
  fr: {
    months: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
    weekDays: ['Di', 'Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa'],
    checkIn: 'Arrivée',
    checkOut: 'Départ',
    selectDate: 'Ajouter',
    clearDates: 'Effacer',
    done: 'Terminé',
    monthlyDiscountHint: 'Réduction mensuelle',
    minNightsHint: 'Min {count} nuits',
  },
};

export function DateRangePicker({ 
  checkIn, 
  checkOut, 
  onCheckInChange, 
  onCheckOutChange,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  minNights = 1,
  monthlyDiscount,
  className = ''
}: DateRangePickerProps) {
  const { locale } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [activeField, setActiveField] = useState<'checkIn' | 'checkOut' | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [hoverDate, setHoverDate] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;

  const t = translations[locale as keyof typeof translations] || translations.zh;

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setActiveField(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const nights = calculateNights(checkIn, checkOut);
  const qualifiesForMonthlyDiscount = monthlyDiscount && nights >= 28;

  const handleDateClick = useCallback((day: number, monthOffset: number = 0) => {
    const selectedDate = new Date(currentYear, currentMonth + monthOffset, day);
    const dateString = selectedDate.toISOString().split('T')[0];

    if (activeField === 'checkIn' || (!checkIn && !activeField)) {
      // Setting check-in
      if (checkOut && new Date(dateString) >= new Date(checkOut)) {
        // If selected date is after or same as checkout, reset checkout
        onCheckInChange(dateString);
        onCheckOutChange('');
        setActiveField('checkOut');
      } else {
        onCheckInChange(dateString);
        setActiveField('checkOut');
      }
    } else if (activeField === 'checkOut' || (checkIn && !checkOut)) {
      // Setting check-out
      if (new Date(dateString) <= new Date(checkIn)) {
        // Can't select same day or before check-in
        return;
      }
      onCheckOutChange(dateString);
      setIsOpen(false);
      setActiveField(null);
    }
  }, [checkIn, checkOut, activeField, currentMonth, currentYear, onCheckInChange, onCheckOutChange]);

  const isDateDisabled = (day: number, monthOffset: number = 0) => {
    const date = new Date(currentYear, currentMonth + monthOffset, day);
    return date < today;
  };

  const isDateInRange = (day: number, monthOffset: number = 0) => {
    if (!checkIn || !day) return false;
    const date = new Date(currentYear, currentMonth + monthOffset, day);
    const start = new Date(checkIn);
    const end = checkOut ? new Date(checkOut) : (hoverDate ? new Date(hoverDate) : null);
    
    if (end) {
      return date > start && date < end;
    }
    return false;
  };

  const isCheckIn = (day: number, monthOffset: number = 0) => {
    if (!checkIn || !day) return false;
    const date = new Date(currentYear, currentMonth + monthOffset, day);
    return date.toISOString().split('T')[0] === checkIn;
  };

  const isCheckOut = (day: number, monthOffset: number = 0) => {
    if (!checkOut || !day) return false;
    const date = new Date(currentYear, currentMonth + monthOffset, day);
    return date.toISOString().split('T')[0] === checkOut;
  };

  const isMonthlyDiscountDate = (day: number, monthOffset: number = 0) => {
    if (!monthlyDiscount) return false;
    // Highlight dates that would qualify for monthly discount if selected as start
    const date = new Date(currentYear, currentMonth + monthOffset, day);
    const futureDate = new Date(date);
    futureDate.setDate(date.getDate() + 28);
    
    // Simple check: if today + 28 days is in the future, this date could qualify
    return date >= today && futureDate > today;
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const prevMonth = () => {
    const prevMonthDate = new Date(currentYear, currentMonth - 1, 1);
    if (prevMonthDate >= new Date(today.getFullYear(), today.getMonth(), 1)) {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    }
  };

  const clearDates = () => {
    onCheckInChange('');
    onCheckOutChange('');
    setActiveField('checkIn');
  };

  const handleMouseEnter = (day: number, monthOffset: number = 0) => {
    if (!checkIn || checkOut) return;
    const date = new Date(currentYear, currentMonth + monthOffset, day);
    if (date > new Date(checkIn)) {
      setHoverDate(date.toISOString().split('T')[0]);
    }
  };

  const handleMouseLeave = () => {
    setHoverDate(null);
  };

  const daysCurrent = generateCalendarDays(currentYear, currentMonth);
  const daysNext = generateCalendarDays(currentYear, currentMonth + 1);

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(locale === 'zh' ? 'zh-CN' : locale === 'fr' ? 'fr-FR' : 'en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Input Fields - Airbnb Style */}
      <div 
        className={cn(
          "flex border-2 rounded-xl bg-white transition-all duration-200 overflow-hidden",
          isOpen ? "border-primary shadow-lg" : "border-neutral-200 hover:border-neutral-300"
        )}
        onClick={() => !isOpen && setIsOpen(true)}
      >
        {/* Check In */}
        <div 
          className={cn(
            "flex-1 px-4 py-3 cursor-pointer border-r border-neutral-200 transition-colors",
            activeField === 'checkIn' ? 'bg-neutral-50' : ''
          )}
          onClick={() => {
            setIsOpen(true);
            setActiveField('checkIn');
          }}
        >
          <div className="text-xs font-semibold text-neutral-900 uppercase tracking-wide">{t.checkIn}</div>
          <div className={cn(
            "text-sm mt-1 font-medium",
            checkIn ? 'text-neutral-900' : 'text-neutral-400'
          )}>
            {checkIn ? formatDate(checkIn) : t.selectDate}
          </div>
        </div>

        {/* Check Out */}
        <div 
          className={cn(
            "flex-1 px-4 py-3 cursor-pointer transition-colors",
            activeField === 'checkOut' ? 'bg-neutral-50' : ''
          )}
          onClick={() => {
            if (checkIn) {
              setIsOpen(true);
              setActiveField('checkOut');
            }
          }}
        >
          <div className="text-xs font-semibold text-neutral-900 uppercase tracking-wide">{t.checkOut}</div>
          <div className={cn(
            "text-sm mt-1 font-medium",
            checkOut ? 'text-neutral-900' : 'text-neutral-400'
          )}>
            {checkOut ? formatDate(checkOut) : t.selectDate}
          </div>
        </div>

        {/* Clear Button */}
        {(checkIn || checkOut) && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              clearDates();
            }}
            className="px-3 hover:bg-neutral-100 flex items-center transition-colors"
            aria-label="Clear dates"
          >
            <X size={18} className="text-neutral-400" />
          </button>
        )}
      </div>

      {/* Monthly Discount Hint */}
      {monthlyDiscount && (
        <div className="mt-2 flex items-center gap-2 text-sm text-accent-600">
          <Sparkles size={14} />
          <span>{t.monthlyDiscountHint}: {monthlyDiscount}% off for 28+ nights</span>
        </div>
      )}

      {/* Calendar Dropdown */}
      {isOpen && (
        <div className={cn(
          "absolute top-full left-0 mt-2 bg-white border border-neutral-200 rounded-xl shadow-2xl z-50 overflow-hidden",
          isMobile ? "w-[340px] right-0" : "w-auto"
        )}>
          {/* Header with navigation */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
            <button 
              onClick={prevMonth}
              className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft size={20} />
            </button>
            
            <div className="flex gap-8 text-sm font-semibold">
              <span>{currentYear}{locale === 'zh' ? '年 ' : ' '}{t.months[currentMonth]}</span>
              {!isMobile && (
                <span>{currentMonth === 11 ? currentYear + 1 : currentYear}{locale === 'zh' ? '年 ' : ' '}{t.months[(currentMonth + 1) % 12]}</span>
              )}
            </div>
            
            <button 
              onClick={nextMonth}
              className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
              aria-label="Next month"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Calendars Container */}
          <div className={cn(
            "p-4",
            !isMobile && "flex gap-8"
          )}>
            {/* Current Month */}
            <div className="flex-1">
              {/* Week Days */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {t.weekDays.map(day => (
                  <div key={day} className="text-center text-xs font-medium text-neutral-400 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Days */}
              <div className="grid grid-cols-7 gap-1">
                {daysCurrent.map((day, index) => (
                  <button
                    key={index}
                    disabled={day === null || (day !== null && isDateDisabled(day, 0))}
                    onClick={() => day && handleDateClick(day, 0)}
                    onMouseEnter={() => day && handleMouseEnter(day, 0)}
                    onMouseLeave={handleMouseLeave}
                    className={cn(
                      "aspect-square flex items-center justify-center text-sm rounded-full transition-all duration-150 relative",
                      day === null && "invisible",
                      day !== null && isDateDisabled(day, 0) && "text-neutral-300 cursor-not-allowed",
                      day !== null && !isDateDisabled(day, 0) && "hover:bg-neutral-100 cursor-pointer",
                      day !== null && isCheckIn(day, 0) && "bg-primary text-white hover:bg-primary-600 shadow-md",
                      day !== null && isCheckOut(day, 0) && "bg-primary text-white hover:bg-primary-600 shadow-md",
                      day !== null && isDateInRange(day, 0) && "bg-primary-50 text-primary",
                      day !== null && isMonthlyDiscountDate(day, 0) && !isCheckIn(day, 0) && !isCheckOut(day, 0) && !isDateInRange(day, 0) && "ring-1 ring-accent-300 ring-inset"
                    )}
                  >
                    {day}
                    {day !== null && isMonthlyDiscountDate(day, 0) && monthlyDiscount && !isCheckIn(day, 0) && !isCheckOut(day, 0) && (
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-accent rounded-full" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Next Month (Desktop only) */}
            {!isMobile && (
              <div className="flex-1">
                {/* Week Days */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {t.weekDays.map(day => (
                    <div key={day} className="text-center text-xs font-medium text-neutral-400 py-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Days */}
                <div className="grid grid-cols-7 gap-1">
                  {daysNext.map((day, index) => (
                    <button
                      key={index}
                      disabled={day === null || (day !== null && isDateDisabled(day, 1))}
                      onClick={() => day && handleDateClick(day, 1)}
                      onMouseEnter={() => day && handleMouseEnter(day, 1)}
                      onMouseLeave={handleMouseLeave}
                      className={cn(
                        "aspect-square flex items-center justify-center text-sm rounded-full transition-all duration-150 relative",
                        day === null && "invisible",
                        day !== null && isDateDisabled(day, 1) && "text-neutral-300 cursor-not-allowed",
                        day !== null && !isDateDisabled(day, 1) && "hover:bg-neutral-100 cursor-pointer",
                        day !== null && isCheckIn(day, 1) && "bg-primary text-white hover:bg-primary-600 shadow-md",
                        day !== null && isCheckOut(day, 1) && "bg-primary text-white hover:bg-primary-600 shadow-md",
                        day !== null && isDateInRange(day, 1) && "bg-primary-50 text-primary",
                        day !== null && isMonthlyDiscountDate(day, 1) && !isCheckIn(day, 1) && !isCheckOut(day, 1) && !isDateInRange(day, 1) && "ring-1 ring-accent-300 ring-inset"
                      )}
                    >
                      {day}
                      {day !== null && isMonthlyDiscountDate(day, 1) && monthlyDiscount && !isCheckIn(day, 1) && !isCheckOut(day, 1) && (
                        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-accent rounded-full" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-100 bg-neutral-50">
            <div className="flex items-center gap-4">
              {nights > 0 && (
                <span className="text-sm text-neutral-600">
                  {nights} nights
                  {qualifiesForMonthlyDiscount && (
                    <span className="text-accent-600 ml-1 font-medium">✨ Monthly rate</span>
                  )}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={clearDates}
                className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 underline underline-offset-4 transition-colors"
              >
                {t.clearDates}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="px-6 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition-colors"
              >
                {t.done}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DateRangePicker;
