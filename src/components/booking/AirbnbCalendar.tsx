'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { X, Star, ChevronLeft, ChevronRight, CalendarRange, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BookedDateRange, formatDateKey, formatDateLabel, hasBookedDateInRange, isDateBooked, nightsBetween, normalizeDate } from './calendar-utils';

export interface AirbnbCalendarProps {
  checkIn: string;
  checkOut: string;
  onSelectCheckIn: (date: string) => void;
  onSelectCheckOut: (date: string) => void;
  onClose?: () => void;
  onClearDates?: () => void;
  totalPrice?: number;
  minNights?: number;
  rating?: number;
  currency?: string;
  className?: string;
  showFooter?: boolean;
  bookedRanges?: BookedDateRange[];
  autoCloseOnRangeSelect?: boolean;
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

export function AirbnbCalendar({
  checkIn,
  checkOut,
  onSelectCheckIn,
  onSelectCheckOut,
  onClose,
  onClearDates,
  totalPrice = 0,
  minNights: _minNights,
  rating = 0,
  currency = 'CAD',
  className,
  showFooter = true,
  bookedRanges = [],
  autoCloseOnRangeSelect = false,
}: AirbnbCalendarProps) {
  const [selectedStart, setSelectedStart] = useState<string>(checkIn);
  const [selectedEnd, setSelectedEnd] = useState<string>(checkOut);
  // Desktop: show 2 months side by side, starting from current month
  const [currentMonthOffset, setCurrentMonthOffset] = useState(0);
  const [saveError, setSaveError] = useState('');

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
    return nightsBetween(selectedStart, selectedEnd);
  }, [selectedStart, selectedEnd]);

  const _months = Math.max(1, Math.ceil(nights / 30)); // eslint-disable-line @typescript-eslint/no-unused-vars
  const displayUnit = 'nights';
  const displayCount = nights;
  const hasRating = rating > 0;

  // Generate months data (12 months from current month + offset)
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

  const getDateStatus = useCallback((date: Date): 'none' | 'start' | 'end' | 'between' | 'disabled' | 'booked' => {
    if (date < today) return 'disabled';
    if (isDateBooked(date, bookedRanges)) return 'booked';
    
    const dateStr = formatDateKey(date);
    const start = selectedStart ? normalizeDate(selectedStart) : null;
    const end = selectedEnd ? normalizeDate(selectedEnd) : null;
    
    if (selectedStart && dateStr === selectedStart) return 'start';
    if (selectedEnd && dateStr === selectedEnd) return 'end';
    if (start && end && date > start && date < end) return 'between';
    return 'none';
  }, [selectedStart, selectedEnd, today, bookedRanges]);

  const handleDateClick = useCallback((date: Date) => {
    setSaveError('');
    if (date < today || isDateBooked(date, bookedRanges)) return;
    
    const dateStr = formatDateKey(date);
    
    // If no start date or both selected, start fresh
    if (!selectedStart || (selectedStart && selectedEnd)) {
      setSelectedStart(dateStr);
      setSelectedEnd('');
      onSelectCheckIn(dateStr);
      onSelectCheckOut('');
    } else {
      // Have start, selecting end
      const startDate = normalizeDate(selectedStart);
      
      // Calculate minimum end date (at least 1 night after start)
      const minEndDate = new Date(startDate);
      minEndDate.setDate(minEndDate.getDate() + 1);
      
      if (date < minEndDate || hasBookedDateInRange(selectedStart, dateStr, bookedRanges)) {
        // Selected same day or before minimum end date - reset to new start
        setSelectedStart(dateStr);
        setSelectedEnd('');
        onSelectCheckIn(dateStr);
        onSelectCheckOut('');
      } else {
        // Valid end date (at least 1 night after start)
        setSelectedEnd(dateStr);
        onSelectCheckOut(dateStr);

        if (autoCloseOnRangeSelect) {
          // Confirming the date range should close the picker; booking-level
          // minimum-stay validation is handled by the parent flow when the user
          // continues, so Save never appears to be a no-op on mobile.
          setSaveError('');
          onClose?.();
        }
      }
    }
  }, [selectedStart, selectedEnd, today, onSelectCheckIn, onSelectCheckOut, bookedRanges, autoCloseOnRangeSelect, onClose]);

  const handleClear = useCallback(() => {
    setSelectedStart('');
    setSelectedEnd('');
    setSaveError('');
    if (onClearDates) {
      onClearDates();
    } else {
      onSelectCheckIn('');
      onSelectCheckOut('');
    }
  }, [onClearDates, onSelectCheckIn, onSelectCheckOut]);

  const handleSave = useCallback(() => {
    if (selectedStart && selectedEnd) {
      // Save confirms the date range only. The booking flow performs business
      // validation (minimum stay, stay type) on continue so mobile Save cannot
      // silently refuse to close.
      setSaveError('');
      onSelectCheckIn(selectedStart);
      onSelectCheckOut(selectedEnd);
      if (onClose) onClose();
    }
  }, [selectedStart, selectedEnd, onSelectCheckIn, onSelectCheckOut, onClose]);


  const handleSavePointerDown = useCallback((event: React.PointerEvent<HTMLButtonElement>) => {
    if (!selectedStart || !selectedEnd) return;
    // On mobile Safari/Chrome, the fixed footer can receive the native tap while
    // the React click confirmation is swallowed by layout/scroll changes. Save on
    // pointer down so the confirmation cannot become a no-op for touch users.
    event.preventDefault();
    handleSave();
  }, [selectedStart, selectedEnd, handleSave]);

  const formatDateRange = useCallback(() => {
    if (!selectedStart) return '';
    if (!selectedEnd) {
      return formatDateLabel(selectedStart, 'en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }
    return `${formatDateLabel(selectedStart, 'en-US', { weekday: 'short', month: 'short', day: 'numeric' })} - ${formatDateLabel(selectedEnd, 'en-US', { weekday: 'short', month: 'short', day: 'numeric' })}`;
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

  const hasSelection = selectedStart && selectedEnd;
  const hasAnyDate = selectedStart || selectedEnd;
  const isSelectingCheckOut = Boolean(selectedStart && !selectedEnd);
  const isEditingReservation = Boolean(checkIn && checkOut);

  const calendarTitle = hasSelection
    ? `${displayCount} ${displayUnit}`
    : isSelectingCheckOut
      ? 'Select check-out date'
      : isEditingReservation
        ? 'Modify your dates'
        : 'Select check-in date';

  const calendarSubtitle = hasSelection
    ? formatDateRange()
    : isSelectingCheckOut
      ? `Check-in: ${formatDateRange()}`
      : isEditingReservation
        ? 'Tap a new check-in or checkout to update your stay.'
        : 'Add dates for prices';

  const footerPrompt = isSelectingCheckOut ? 'Select check-out date' : 'Add dates for prices';

  // Mobile: Single month view with vertical scroll
  // Desktop: Two months side by side with horizontal navigation
  
  // Desktop Month Component
  const MonthView = ({ year, month, label }: { year: number; month: number; label: string }) => {
    const days = generateDays(year, month);
    
    return (
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4 text-center">
          {label}
        </h3>
        
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {WEEKDAYS.map((day, i) => (
            <div key={i} className="text-sm font-medium text-neutral-600 py-2">
              {day}
            </div>
          ))}
        </div>
        
        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-y-1">
          {days.map((dayInfo, index) => {
            const status = getDateStatus(dayInfo.date);
            const dayNumber = dayInfo.date.getDate();
            const isSelected = (status === 'start' || status === 'end') && dayInfo.isCurrentMonth;
            
            let cellClasses = "aspect-square flex items-center justify-center text-sm relative";
            let textClasses = "";
            
            if (!dayInfo.isCurrentMonth) {
              textClasses = "text-transparent";
            } else if (status === 'disabled') {
              textClasses = "text-neutral-300 line-through cursor-not-allowed";
            } else if (status === 'booked') {
              textClasses = "text-neutral-400 cursor-not-allowed";
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
                disabled={dayInfo.isDisabled || !dayInfo.isCurrentMonth || status === 'booked'}
                className={cn(cellClasses, textClasses)}
              >
                <span className={cn(
                  "w-10 h-10 flex items-center justify-center relative overflow-hidden",
                  isSelected && "bg-neutral-900 text-white rounded-full",
                  status === 'booked' && "rounded-full bg-neutral-200 text-neutral-400"
                )}>
                  {dayNumber}
                  {status === 'booked' && <span className="absolute inset-0 pointer-events-none before:absolute before:left-1 before:right-1 before:top-1/2 before:h-px before:-translate-y-1/2 before:rotate-[-35deg] before:bg-neutral-500" />}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // If used as inline component (has className prop for styling), return just content
  if (className) {
    return (
      <div className={cn("flex flex-col h-full", className)}>
        {/* Header with selection info */}
        <div className="mb-4 space-y-3">
          {isEditingReservation && (
            <div className="flex items-start justify-between gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
                  <CalendarRange size={16} className="shrink-0" />
                  <span>Modify reservation</span>
                </div>
                <p className="mt-1 text-sm text-neutral-600">
                  Change dates, extend your stay, or clear this reservation to start over.
                </p>
              </div>
              <button
                onClick={handleClear}
                className="shrink-0 rounded-full border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-900 transition-colors hover:border-neutral-900 hover:bg-white"
              >
                Start over
              </button>
            </div>
          )}
          <div>
            <h2 className="text-2xl font-semibold text-neutral-900">
              {calendarTitle}
            </h2>
            <p className="text-neutral-500 mt-1">
              {calendarSubtitle}
            </p>
          </div>
        </div>

        {/* Weekday Headers - Fixed */}
        <div className="grid grid-cols-7 gap-1 text-center border-b border-neutral-100 pb-3 sticky top-0 bg-white z-10">
          {WEEKDAYS.map((day, i) => (
            <div key={i} className="text-sm font-medium text-neutral-600 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Scrollable Calendar */}
        <div className="flex-1 overflow-y-auto pb-4 -mx-4 px-4">
          {monthsData.map(({ year, month, label }) => (
            <div key={label} className="py-6">
              <MonthView year={year} month={month} label={label} />
            </div>
          ))}
        </div>

        {/* Footer with actions */}
        {showFooter && (
          <div className="mt-4 pt-4 border-t border-neutral-200 shrink-0">
            {saveError && (
              <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{saveError}</p>
            )}
            <div className="flex items-center justify-between">
            <div>
              {hasSelection ? (
                <div>
                  <p className="text-lg font-semibold text-neutral-900">
                    ${totalPrice.toLocaleString()} {currency}
                  </p>
                  {hasRating && (
                    <div className="flex items-center gap-2">
                      <Star size={14} className="fill-black" />
                      <span className="text-sm text-neutral-600">{rating}</span>
                    </div>
                  )}
                  <p className="text-sm text-neutral-500 underline">For {displayCount} {displayUnit}</p>
                </div>
              ) : (
                <div>
                  <p className="text-neutral-900">{footerPrompt}</p>
                  {hasRating && (
                    <div className="flex items-center gap-2 mt-1">
                      <Star size={14} className="fill-black" />
                      <span className="text-sm text-neutral-600">{rating}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              {hasAnyDate && (
                <button 
                  onClick={handleClear}
                  className="text-sm font-semibold underline underline-offset-4 text-neutral-900 hover:text-neutral-600 transition-colors"
                >
                  Clear dates
                </button>
              )}
              <button
                type="button"
                onPointerDown={handleSavePointerDown}
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
        )}
      </div>
    );
  }

  // Mobile: Full screen bottom sheet style
  const mobileCalendar = (
    <div className="md:hidden fixed inset-0 z-50 bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-neutral-100 shrink-0">
        <button 
          onClick={onClose}
          className="p-2 -ml-2 hover:bg-neutral-100 rounded-full transition-colors"
        >
          <X size={24} className="text-neutral-900" />
        </button>
        
        {hasAnyDate && (
          <button 
            onClick={handleClear}
            className="text-sm font-medium text-neutral-900 underline underline-offset-4"
          >
            Clear dates
          </button>
        )}
      </div>

      {/* Title */}
      <div className="px-4 pt-6 pb-4 shrink-0 space-y-3">
        {isEditingReservation && (
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
              <Pencil size={16} className="shrink-0" />
              <span>Modify reservation</span>
            </div>
            <p className="mt-1 text-sm text-neutral-600">
              Pick new dates, extend your stay, or clear the current selection.
            </p>
          </div>
        )}
        <div>
          <h2 className="text-2xl font-semibold text-neutral-900">
            {calendarTitle}
          </h2>
          <p className="text-neutral-500 mt-1">
            {calendarSubtitle}
          </p>
        </div>
      </div>

      {/* Weekday Headers - Fixed */}
      <div className="px-4 grid grid-cols-7 gap-1 text-center border-b border-neutral-100 pb-3 shrink-0 sticky top-0 bg-white z-10">
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
                  const isSelected = (status === 'start' || status === 'end') && dayInfo.isCurrentMonth;
                  
                  let cellClasses = "aspect-square flex items-center justify-center text-sm relative";
                  let textClasses = "";
                  
                  if (!dayInfo.isCurrentMonth) {
                    textClasses = "text-transparent";
                  } else if (status === 'disabled') {
                    textClasses = "text-neutral-300 line-through cursor-not-allowed";
                  } else if (status === 'booked') {
                    textClasses = "text-neutral-400 cursor-not-allowed";
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
                      onClick={() => !dayInfo.isDisabled && status !== 'booked' && handleDateClick(dayInfo.date)}
                      disabled={dayInfo.isDisabled || !dayInfo.isCurrentMonth || status === 'booked'}
                      className={cn(cellClasses, textClasses)}
                    >
                      <span className={cn(
                        "w-10 h-10 flex items-center justify-center relative overflow-hidden",
                        isSelected && "bg-neutral-900 text-white rounded-full",
                        status === 'booked' && "rounded-full bg-neutral-200 text-neutral-400"
                      )}>
                        {dayNumber}
                        {status === 'booked' && <span className="absolute inset-0 pointer-events-none before:absolute before:left-1 before:right-1 before:top-1/2 before:h-px before:-translate-y-1/2 before:rotate-[-35deg] before:bg-neutral-500" />}
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
                {hasRating && (
                  <div className="flex items-center gap-2">
                    <Star size={14} className="fill-black" />
                    <span className="text-sm text-neutral-600">{rating}</span>
                  </div>
                )}
                <p className="text-sm text-neutral-500 underline">For {displayCount} {displayUnit}</p>
              </div>
            ) : (
              <div>
                <p className="text-neutral-900">{footerPrompt}</p>
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
            type="button"
            onPointerDown={handleSavePointerDown}
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
  const desktopCalendar = (
    <div className="hidden md:flex fixed inset-0 z-50 items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-3xl w-full mx-4 max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 shrink-0">
          <button 
            onClick={onClose}
            className="p-2 -ml-2 hover:bg-neutral-100 rounded-full transition-colors"
          >
            <X size={24} className="text-neutral-900" />
          </button>
          
          <div className="text-center">
            <h2 className="text-lg font-semibold text-neutral-900">
              {hasSelection ? `${displayCount} ${displayUnit}` : 'Select dates'}
            </h2>
            {hasSelection && (
              <p className="text-sm text-neutral-500">{formatDateRange()}</p>
            )}
          </div>
          
          <div className="w-10">
            {hasAnyDate && (
              <button 
                onClick={handleClear}
                className="text-sm font-medium text-neutral-900 underline underline-offset-4 hover:text-neutral-600"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Navigation Arrows */}
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

        {/* Dual Month Calendar View */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          <div className="grid grid-cols-2 gap-8">
            {/* Current Month */}
            <MonthView 
              year={monthsData[0].year} 
              month={monthsData[0].month} 
              label={monthsData[0].label} 
            />
            {/* Next Month */}
            <MonthView 
              year={monthsData[1].year} 
              month={monthsData[1].month} 
              label={monthsData[1].label} 
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-neutral-100 px-6 py-4 shrink-0">
          {saveError && (
            <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{saveError}</p>
          )}
          <div className="flex items-center justify-between">
          <div>
            {hasSelection ? (
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-semibold text-neutral-900">
                  ${totalPrice.toLocaleString()} {currency}
                </span>
                <span className="text-sm text-neutral-500">
                  for {displayCount} {displayUnit}
                </span>
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
                <span className="text-sm text-neutral-500">{footerPrompt}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {hasAnyDate && (
              <button 
                onClick={handleClear}
                className="px-4 py-2.5 text-sm font-semibold text-neutral-900 underline underline-offset-4 hover:text-neutral-600 transition-colors"
              >
                Clear dates
              </button>
            )}
            <button
              type="button"
              onPointerDown={handleSavePointerDown}
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
    </div>
  );

  return (
    <>
      {mobileCalendar}
      {desktopCalendar}
    </>
  );
}

export default AirbnbCalendar;
