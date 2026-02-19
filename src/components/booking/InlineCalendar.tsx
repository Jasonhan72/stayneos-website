// Airbnb Style Inline Dual Calendar
// For direct embedding on property detail page

'use client';

import { useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InlineCalendarProps {
  checkIn: string;
  checkOut: string;
  onSelectCheckIn: (date: string) => void;
  onSelectCheckOut: (date: string) => void;
  onClearDates?: () => void;
  className?: string;
}

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export function InlineCalendar({
  checkIn,
  checkOut,
  onSelectCheckIn,
  onSelectCheckOut,
  onClearDates,
  className
}: InlineCalendarProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [hoverDate, setHoverDate] = useState<string | null>(null);

  const generateCalendarDays = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days = [];
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const isDateDisabled = useCallback((day: number, year: number, month: number) => {
    if (!day) return true;
    const date = new Date(year, month, day);
    return date < today;
  }, [today]);

  const isCheckIn = useCallback((day: number, year: number, month: number) => {
    if (!checkIn || !day) return false;
    const date = new Date(year, month, day);
    return date.toISOString().split('T')[0] === checkIn;
  }, [checkIn]);

  const isCheckOut = useCallback((day: number, year: number, month: number) => {
    if (!checkOut || !day) return false;
    const date = new Date(year, month, day);
    return date.toISOString().split('T')[0] === checkOut;
  }, [checkOut]);

  const isInRange = useCallback((day: number, year: number, month: number) => {
    if (!checkIn || !day) return false;
    if (!checkOut && !hoverDate) return false;
    
    const date = new Date(year, month, day);
    const start = new Date(checkIn);
    const end = checkOut ? new Date(checkOut) : new Date(hoverDate!);
    
    return date > start && date < end;
  }, [checkIn, checkOut, hoverDate]);

  const isLeftRangeEdge = useCallback((day: number, year: number, month: number) => {
    if (!day || !checkIn) return false;
    const date = new Date(year, month, day);
    const nextDate = new Date(date);
    nextDate.setDate(date.getDate() + 1);
    
    const isCurrentInRange = isInRange(day, year, month);
    const isNextInRange = isInRange(nextDate.getDate(), nextDate.getFullYear(), nextDate.getMonth());
    
    return isCurrentInRange && !isNextInRange;
  }, [checkIn, isInRange]);

  const handleDateClick = useCallback((day: number, year: number, month: number) => {
    if (!day || isDateDisabled(day, year, month)) return;
    
    const dateStr = new Date(year, month, day).toISOString().split('T')[0];
    const clickedDate = new Date(year, month, day);
    
    if (!checkIn || (checkIn && checkOut)) {
      // Start new selection
      onSelectCheckIn(dateStr);
      onSelectCheckOut('');
    } else {
      const startDate = new Date(checkIn);
      if (clickedDate <= startDate) {
        // Selected date is before or same as check-in, reset
        onSelectCheckIn(dateStr);
        onSelectCheckOut('');
      } else {
        // Valid check-out date
        onSelectCheckOut(dateStr);
      }
    }
  }, [checkIn, checkOut, onSelectCheckIn, onSelectCheckOut, isDateDisabled]);

  const handleMouseEnter = useCallback((day: number, year: number, month: number) => {
    if (!checkIn || checkOut || !day) return;
    const date = new Date(year, month, day);
    if (date > new Date(checkIn)) {
      setHoverDate(date.toISOString().split('T')[0]);
    }
  }, [checkIn, checkOut]);

  const handleMouseLeave = useCallback(() => {
    setHoverDate(null);
  }, []);

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

  const renderMonth = (monthOffset: number) => {
    const displayMonth = (currentMonth + monthOffset) % 12;
    const displayYear = currentMonth + monthOffset > 11 ? currentYear + 1 : currentYear;
    const days = generateCalendarDays(displayYear, displayMonth);

    return (
      <div className="flex-1">
        {/* Month Header */}
        <div className="flex items-center justify-between mb-4 px-2">
          {monthOffset === 0 && (
            <button
              onClick={prevMonth}
              className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft size={20} className="text-neutral-600" />
            </button>
          )}
          {monthOffset === 1 && <div />}
          
          <h3 className="text-base font-semibold text-neutral-900">
            {monthNames[displayMonth]} {displayYear}
          </h3>
          
          {monthOffset === 1 && (
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
              aria-label="Next month"
            >
              <ChevronRight size={20} className="text-neutral-600" />
            </button>
          )}
          {monthOffset === 0 && <div />}
        </div>

        {/* Week Days */}
        <div className="grid grid-cols-7 mb-2">
          {weekDays.map(day => (
            <div key={day} className="text-center text-xs text-neutral-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-y-1">
          {days.map((day, index) => {
            const disabled = day !== null && isDateDisabled(day, displayYear, displayMonth);
            const isCheckInDate = day !== null && isCheckIn(day, displayYear, displayMonth);
            const isCheckOutDate = day !== null && isCheckOut(day, displayYear, displayMonth);
            const inRange = day !== null && isInRange(day, displayYear, displayMonth);
            
            return (
              <div key={index} className="aspect-square p-0.5">
                {day !== null ? (
                  <button
                    onClick={() => handleDateClick(day, displayYear, displayMonth)}
                    onMouseEnter={() => handleMouseEnter(day, displayYear, displayMonth)}
                    onMouseLeave={handleMouseLeave}
                    disabled={disabled}
                    className={cn(
                      "w-full h-full flex items-center justify-center text-sm rounded-full transition-all duration-150",
                      disabled && "text-neutral-300 cursor-not-allowed line-through",
                      !disabled && "hover:bg-neutral-100 cursor-pointer",
                      isCheckInDate && "bg-black text-white hover:bg-black shadow-md",
                      isCheckOutDate && "bg-black text-white hover:bg-black shadow-md",
                      inRange && "bg-neutral-100 rounded-none",
                      inRange && isLeftRangeEdge(day, displayYear, displayMonth) && "rounded-r-full"
                    )}
                  >
                    {day}
                  </button>
                ) : (
                  <div />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const formatDateShort = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className={cn("w-full", className)}>
      {/* Selected Dates Display */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-neutral-900">
            {checkIn && checkOut 
              ? `${Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24))} nights`
              : checkIn 
                ? 'Select checkout date'
                : 'Select check-in date'
            }
          </h3>
          <p className="text-neutral-500 text-sm mt-1">
            {checkIn && checkOut 
              ? `${formatDateShort(checkIn)} - ${formatDateShort(checkOut)}`
              : checkIn 
                ? formatDateShort(checkIn)
                : 'Add your travel dates for exact pricing'
            }
          </p>
        </div>
        {(checkIn || checkOut) && onClearDates && (
          <button
            onClick={onClearDates}
            className="text-sm font-medium underline hover:text-neutral-900 transition-colors"
          >
            Clear dates
          </button>
        )}
      </div>

      {/* Dual Calendar */}
      <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
        {renderMonth(0)}
        <div className="hidden sm:block w-px bg-neutral-200" />
        {renderMonth(1)}
      </div>
    </div>
  );
}

export default InlineCalendar;
