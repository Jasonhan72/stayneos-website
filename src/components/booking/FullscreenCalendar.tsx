'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { X, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FullscreenCalendarProps {
  isOpen: boolean;
  onClose: () => void;
  checkIn: string;
  checkOut: string;
  onSelectCheckIn: (date: string) => void;
  onSelectCheckOut: (date: string) => void;
  onClearDates: () => void;
  pricePerNight?: number;
  minNights?: number;
  rating?: number;
  currency?: string;
}

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

interface DayInfo {
  date: Date;
  isCurrentMonth: boolean;
  isDisabled: boolean;
}

export function FullscreenCalendar({
  isOpen,
  onClose,
  checkIn,
  checkOut,
  onSelectCheckIn,
  onSelectCheckOut,
  onClearDates,
  pricePerNight = 0,
  rating = 4.9,
  currency = 'CAD',
}: FullscreenCalendarProps) {
  const [selectedStart, setSelectedStart] = useState<string>(checkIn);
  const [selectedEnd, setSelectedEnd] = useState<string>(checkOut);

  // Sync with props
  useEffect(() => {
    setSelectedStart(checkIn);
    setSelectedEnd(checkOut);
  }, [checkIn, checkOut]);

  // Generate months data (12 months from current month)
  const monthsData = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const months = [];
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() + i, 1);
      months.push({
        year: date.getFullYear(),
        month: date.getMonth(),
        label: `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`,
      });
    }
    return months;
  }, []);

  // Calculate nights
  const nights = useMemo(() => {
    if (!selectedStart || !selectedEnd) return 0;
    const start = new Date(selectedStart);
    const end = new Date(selectedEnd);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  }, [selectedStart, selectedEnd]);

  const totalPrice = nights * pricePerNight;

  // Get today's date for disabling past dates
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const getDateStatus = useCallback((date: Date): 'none' | 'start' | 'end' | 'between' | 'disabled' => {
    if (date < today) return 'disabled';
    
    const dateStr = date.toISOString().split('T')[0];
    const start = selectedStart ? new Date(selectedStart) : null;
    const end = selectedEnd ? new Date(selectedEnd) : null;
    
    if (selectedStart && dateStr === selectedStart) return 'start';
    if (selectedEnd && dateStr === selectedEnd) return 'end';
    if (start && end && date > start && date < end) return 'between';
    return 'none';
  }, [selectedStart, selectedEnd, today]);

  const handleDateClick = useCallback((date: Date) => {
    if (date < today) return;
    
    const dateStr = date.toISOString().split('T')[0];
    
    // If no start date or both selected, start fresh
    if (!selectedStart || (selectedStart && selectedEnd)) {
      setSelectedStart(dateStr);
      setSelectedEnd('');
      onSelectCheckIn(dateStr);
      onSelectCheckOut('');
    } else {
      // Have start, selecting end
      const startDate = new Date(selectedStart);
      
      if (date <= startDate) {
        // Selected before start, make it new start
        setSelectedStart(dateStr);
        setSelectedEnd('');
        onSelectCheckIn(dateStr);
        onSelectCheckOut('');
      } else {
        // Valid end date
        setSelectedEnd(dateStr);
        onSelectCheckOut(dateStr);
      }
    }
  }, [selectedStart, selectedEnd, today, onSelectCheckIn, onSelectCheckOut]);

  const handleClear = useCallback(() => {
    setSelectedStart('');
    setSelectedEnd('');
    onClearDates();
  }, [onClearDates]);

  const handleSave = useCallback(() => {
    if (selectedStart && selectedEnd) {
      onSelectCheckIn(selectedStart);
      onSelectCheckOut(selectedEnd);
      onClose();
    }
  }, [selectedStart, selectedEnd, onSelectCheckIn, onSelectCheckOut, onClose]);

  const formatDateRange = useCallback(() => {
    if (!selectedStart) return '';
    if (!selectedEnd) {
      const date = new Date(selectedStart);
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }
    const start = new Date(selectedStart);
    const end = new Date(selectedEnd);
    return `${start.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}`;
  }, [selectedStart, selectedEnd]);

  // Generate days for a month
  const generateDays = (year: number, month: number): DayInfo[] => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days: DayInfo[] = [];
    
    // Previous month padding
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({ date, isCurrentMonth: false, isDisabled: date < today });
    }
    
    // Current month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      days.push({ date, isCurrentMonth: true, isDisabled: date < today });
    }
    
    // Next month padding (fill to complete 6 rows = 42 cells)
    const remainingCells = 42 - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      const date = new Date(year, month + 1, i);
      days.push({ date, isCurrentMonth: false, isDisabled: date < today });
    }
    
    return days;
  };

  if (!isOpen) return null;

  const hasSelection = selectedStart && selectedEnd;

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-neutral-100">
        <button 
          onClick={onClose}
          className="p-2 -ml-2 hover:bg-neutral-100 rounded-full transition-colors"
        >
          <X size={24} className="text-neutral-900" />
        </button>
        
        {(selectedStart || selectedEnd) && (
          <button 
            onClick={handleClear}
            className="text-sm font-medium text-neutral-900 underline underline-offset-4"
          >
            Clear dates
          </button>
        )}
      </div>

      {/* Title */}
      <div className="px-4 pt-6 pb-4">
        <h2 className="text-2xl font-semibold text-neutral-900">
          {hasSelection ? `${nights} nights` : 'Select check-in date'}
        </h2>
        <p className="text-neutral-500 mt-1">
          {hasSelection ? formatDateRange() : 'Prices on calendar do not include taxes and fees'}
        </p>
      </div>

      {/* Weekday Headers - Fixed */}
      <div className="px-4 grid grid-cols-7 gap-1 text-center border-b border-neutral-100 pb-3">
        {WEEKDAYS.map((day, i) => (
          <div key={i} className="text-sm font-medium text-neutral-600 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Scrollable Calendar */}
      <div className="flex-1 overflow-y-auto px-4 pb-32">
        {monthsData.map(({ year, month, label }) => {
          const days = generateDays(year, month);
          
          return (
            <div key={label} className="py-6">
              {/* Month Label */}
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                {label}
              </h3>
              
              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-y-2">
                {days.map((dayInfo, index) => {
                  const status = getDateStatus(dayInfo.date);
                  const dayNumber = dayInfo.date.getDate();
                  
                  let cellClasses = "aspect-square flex items-center justify-center text-sm relative";
                  let textClasses = "";
                  
                  if (!dayInfo.isCurrentMonth) {
                    textClasses = "text-transparent";
                  } else if (status === 'disabled') {
                    textClasses = "text-neutral-300 line-through cursor-not-allowed";
                  } else if (status === 'start' || status === 'end') {
                    textClasses = "bg-neutral-900 text-white rounded-full font-semibold";
                  } else if (status === 'between') {
                    textClasses = "bg-neutral-100 text-neutral-900";
                    cellClasses += " rounded-none";
                  } else {
                    textClasses = "text-neutral-900 hover:bg-neutral-100 rounded-full cursor-pointer";
                  }
                  
                  // First and last of range styling
                  if (status === 'start') {
                    cellClasses += " rounded-l-full";
                  } else if (status === 'end') {
                    cellClasses += " rounded-r-full";
                  }
                  
                  return (
                    <button
                      key={index}
                      onClick={() => !dayInfo.isDisabled && handleDateClick(dayInfo.date)}
                      disabled={dayInfo.isDisabled || !dayInfo.isCurrentMonth}
                      className={cn(cellClasses, textClasses)}
                    >
                      <span className={cn(
                        "w-10 h-10 flex items-center justify-center",
                        (status === 'start' || status === 'end') && "bg-neutral-900 text-white rounded-full"
                      )}>
                        {dayNumber}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            {hasSelection ? (
              <div>
                <p className="text-lg font-semibold text-neutral-900">
                  ${totalPrice.toLocaleString()} {currency}
                </p>
                <div className="flex items-center gap-2">
                  <Star size={14} className="fill-black" />
                  <span className="text-sm text-neutral-600">{rating}</span>
                </div>
                <p className="text-sm text-neutral-500 underline">For {nights} nights</p>
              </div>
            ) : (
              <div>
                <p className="text-neutral-900">Add dates for prices</p>
                <div className="flex items-center gap-2 mt-1">
                  <Star size={14} className="fill-black" />
                  <span className="text-sm text-neutral-600">{rating}</span>
                </div>
              </div>
            )}
          </div>
          
          <button
            onClick={handleSave}
            disabled={!hasSelection}
            className={cn(
              "px-8 py-3.5 rounded-xl font-semibold text-white transition-colors",
              hasSelection 
                ? "bg-neutral-900 hover:bg-neutral-800" 
                : "bg-neutral-300 cursor-not-allowed"
            )}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default FullscreenCalendar;
