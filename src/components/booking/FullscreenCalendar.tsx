'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { X, Star, ChevronLeft, ChevronRight } from 'lucide-react';
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
  rating = 0,
  currency = 'CAD',
}: FullscreenCalendarProps) {
  const [selectedStart, setSelectedStart] = useState<string>(checkIn);
  const [selectedEnd, setSelectedEnd] = useState<string>(checkOut);
  const [currentMonthOffset, setCurrentMonthOffset] = useState(0);

  // Sync with props
  useEffect(() => {
    setSelectedStart(checkIn);
    setSelectedEnd(checkOut);
  }, [checkIn, checkOut]);

  // Get today's date for disabling past dates
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // Calculate nights
  const nights = useMemo(() => {
    if (!selectedStart || !selectedEnd) return 0;
    const start = new Date(selectedStart);
    const end = new Date(selectedEnd);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  }, [selectedStart, selectedEnd]);

  const totalPrice = nights * pricePerNight;
  const hasRating = rating > 0;

  // Generate months data
  const monthsData = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const months = [];
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() + i + currentMonthOffset, 1);
      months.push({
        year: date.getFullYear(),
        month: date.getMonth(),
        label: `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`,
      });
    }
    return months;
  }, [currentMonthOffset]);

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
    
    if (!selectedStart || (selectedStart && selectedEnd)) {
      setSelectedStart(dateStr);
      setSelectedEnd('');
      onSelectCheckIn(dateStr);
      onSelectCheckOut('');
    } else {
      const startDate = new Date(selectedStart);
      
      if (date <= startDate) {
        setSelectedStart(dateStr);
        setSelectedEnd('');
        onSelectCheckIn(dateStr);
        onSelectCheckOut('');
      } else {
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
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}-${end.toLocaleDateString('en-US', { day: 'numeric', year: 'numeric' })}`;
  }, [selectedStart, selectedEnd]);

  // Generate days for a month
  const generateDays = (year: number, month: number): DayInfo[] => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days: DayInfo[] = [];
    
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({ date, isCurrentMonth: false, isDisabled: date < today });
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      days.push({ date, isCurrentMonth: true, isDisabled: date < today });
    }
    
    const remainingCells = 42 - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      const date = new Date(year, month + 1, i);
      days.push({ date, isCurrentMonth: false, isDisabled: date < today });
    }
    
    return days;
  };

  if (!isOpen) return null;

  const hasSelection = selectedStart && selectedEnd;

  // Month View Component
  const MonthView = ({ year, month, label }: { year: number; month: number; label: string }) => {
    const days = generateDays(year, month);
    
    return (
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4 text-center">{label}</h3>
        
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {WEEKDAYS.map((day, i) => (
            <div key={i} className="text-sm font-medium text-neutral-600 py-2">{day}</div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-y-1">
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
              textClasses = "bg-neutral-900 text-white rounded-full font-semibold cursor-pointer";
            } else if (status === 'between') {
              textClasses = "bg-neutral-100 text-neutral-900 cursor-pointer";
              cellClasses += " rounded-none";
            } else {
              textClasses = "text-neutral-900 hover:bg-neutral-100 rounded-full cursor-pointer";
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
                )}>{dayNumber}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // Mobile: Full screen
  const mobileView = (
    <div className="md:hidden fixed inset-0 z-50 bg-white flex flex-col">
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

      <div className="px-4 pt-6 pb-4">
        <h2 className="text-2xl font-semibold text-neutral-900">
          {hasSelection ? `${nights} nights` : 'Select check-in date'}
        </h2>
        <p className="text-neutral-500 mt-1">
          {hasSelection ? formatDateRange() : 'Prices on calendar do not include taxes and fees'}
        </p>
      </div>

      <div className="px-4 grid grid-cols-7 gap-1 text-center border-b border-neutral-100 pb-3">
        {WEEKDAYS.map((day, i) => (
          <div key={i} className="text-sm font-medium text-neutral-600 py-2">{day}</div>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-32">
        {monthsData.map(({ year, month, label }) => (
          <div key={label} className="py-6">
            <MonthView year={year} month={month} label={label} />
          </div>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            {hasSelection ? (
              <div>
                <p className="text-lg font-semibold text-neutral-900">${totalPrice.toLocaleString()} {currency}</p>
                {hasRating && (
                  <div className="flex items-center gap-2">
                    <Star size={14} className="fill-black" />
                    <span className="text-sm text-neutral-600">{rating}</span>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <p className="text-neutral-900">Add dates for prices</p>
                {hasRating && (
                  <div className="flex items-center gap-2 mt-1">
                    <Star size={14} className="fill-black" />
                    <span className="text-sm text-neutral-600">{rating}</span>
                  </div>
                )}
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

  // Desktop: Centered modal with dual month view
  const desktopView = (
    <div className="hidden md:flex fixed inset-0 z-50 items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-3xl w-full mx-4 max-h-[85vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 shrink-0">
          <button 
            onClick={onClose}
            className="p-2 -ml-2 hover:bg-neutral-100 rounded-full transition-colors"
          >
            <X size={24} className="text-neutral-900" />
          </button>
          
          <div className="text-center">
            <h2 className="text-lg font-semibold text-neutral-900">
              {hasSelection ? `${nights} nights` : 'Select dates'}
            </h2>
            {hasSelection && <p className="text-sm text-neutral-500">{formatDateRange()}</p>}
          </div>
          
          <div className="w-10">
            {(selectedStart || selectedEnd) && (
              <button 
                onClick={handleClear}
                className="text-sm font-medium text-neutral-900 underline underline-offset-4 hover:text-neutral-600"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="absolute top-20 left-4 z-10">
          <button
            onClick={() => setCurrentMonthOffset(prev => Math.max(0, prev - 1))}
            disabled={currentMonthOffset === 0}
            className="p-2 rounded-full border border-neutral-200 bg-white hover:border-neutral-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
        </div>
        
        <div className="absolute top-20 right-4 z-10">
          <button
            onClick={() => setCurrentMonthOffset(prev => prev + 1)}
            disabled={currentMonthOffset >= 10}
            className="p-2 rounded-full border border-neutral-200 bg-white hover:border-neutral-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-6">
          <div className="grid grid-cols-2 gap-8">
            <MonthView year={monthsData[0].year} month={monthsData[0].month} label={monthsData[0].label} />
            <MonthView year={monthsData[1].year} month={monthsData[1].month} label={monthsData[1].label} />
          </div>
        </div>

        <div className="border-t border-neutral-100 px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            {hasSelection ? (
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-semibold text-neutral-900">${totalPrice.toLocaleString()} {currency}</span>
                <span className="text-sm text-neutral-500">for {nights} nights</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {hasRating && (
                  <>
                    <Star size={14} className="fill-black" />
                    <span className="text-sm text-neutral-600">{rating}</span>
                    <span className="text-sm text-neutral-500">·</span>
                  </>
                )}
                <span className="text-sm text-neutral-500">Add dates for prices</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {(selectedStart || selectedEnd) && (
              <button 
                onClick={handleClear}
                className="px-4 py-2.5 text-sm font-semibold text-neutral-900 underline underline-offset-4 hover:text-neutral-600 transition-colors"
              >
                Clear dates
              </button>
            )}
            
            <button
              onClick={handleSave}
              disabled={!hasSelection}
              className={cn(
                "px-8 py-2.5 rounded-lg font-semibold text-white transition-colors",
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
    </div>
  );

  return (
    <>
      {mobileView}
      {desktopView}
    </>
  );
}

export default FullscreenCalendar;
