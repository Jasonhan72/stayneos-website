// Airbnb Style Date Range Picker Component
'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface DateRangePickerProps {
  checkIn: string;
  checkOut: string;
  onCheckInChange: (date: string) => void;
  onCheckOutChange: (date: string) => void;
  minNights?: number;
  className?: string;
}

// Generate calendar days
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

const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

export function DateRangePicker({ 
  checkIn, 
  checkOut, 
  onCheckInChange, 
  onCheckOutChange,
  className = ''
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeField, setActiveField] = useState<'checkIn' | 'checkOut' | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const containerRef = useRef<HTMLDivElement>(null);

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

  const handleDateClick = (day: number) => {
    const selectedDate = new Date(currentYear, currentMonth, day);
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
  };

  const isDateDisabled = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    return date < today;
  };

  const isDateInRange = (day: number) => {
    if (!checkIn || !day) return false;
    const date = new Date(currentYear, currentMonth, day);
    const start = new Date(checkIn);
    const end = checkOut ? new Date(checkOut) : null;
    
    if (end) {
      return date > start && date < end;
    }
    return false;
  };

  const isCheckIn = (day: number) => {
    if (!checkIn || !day) return false;
    const date = new Date(currentYear, currentMonth, day);
    return date.toISOString().split('T')[0] === checkIn;
  };

  const isCheckOut = (day: number) => {
    if (!checkOut || !day) return false;
    const date = new Date(currentYear, currentMonth, day);
    return date.toISOString().split('T')[0] === checkOut;
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

  const days = generateCalendarDays(currentYear, currentMonth);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Input Fields - Airbnb Style */}
      <div 
        className={`flex border bg-white transition-all ${
          isOpen ? 'border-primary ring-1 ring-primary' : 'border-neutral-300 hover:border-neutral-400'
        }`}
        onClick={() => !isOpen && setIsOpen(true)}
      >
        {/* Check In */}
        <div 
          className={`flex-1 px-4 py-3 cursor-pointer border-r border-neutral-200 ${
            activeField === 'checkIn' ? 'bg-neutral-50' : ''
          }`}
          onClick={() => {
            setIsOpen(true);
            setActiveField('checkIn');
          }}
        >
          <div className="text-xs font-semibold text-neutral-900 uppercase tracking-wide">入住日期</div>
          <div className={`text-sm mt-1 ${checkIn ? 'text-neutral-900 font-medium' : 'text-neutral-400'}`}>
            {checkIn ? new Date(checkIn).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }) : '选择日期'}
          </div>
        </div>

        {/* Check Out */}
        <div 
          className={`flex-1 px-4 py-3 cursor-pointer ${
            activeField === 'checkOut' ? 'bg-neutral-50' : ''
          }`}
          onClick={() => {
            if (checkIn) {
              setIsOpen(true);
              setActiveField('checkOut');
            }
          }}
        >
          <div className="text-xs font-semibold text-neutral-900 uppercase tracking-wide">退房日期</div>
          <div className={`text-sm mt-1 ${checkOut ? 'text-neutral-900 font-medium' : 'text-neutral-400'}`}>
            {checkOut ? new Date(checkOut).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }) : '选择日期'}
          </div>
        </div>

        {/* Clear Button */}
        {(checkIn || checkOut) && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              clearDates();
            }}
            className="px-3 hover:bg-neutral-100 flex items-center"
          >
            <X size={18} className="text-neutral-400" />
          </button>
        )}
      </div>

      {/* Calendar Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-neutral-200 shadow-xl z-50 p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={prevMonth}
              className="p-1 hover:bg-neutral-100 rounded-full"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="text-sm font-semibold">
              {currentYear}年{monthNames[currentMonth]}
            </div>
            <button 
              onClick={nextMonth}
              className="p-1 hover:bg-neutral-100 rounded-full"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Week Days */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map(day => (
              <div key={day} className="text-center text-xs text-neutral-400 py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => (
              <button
                key={index}
                disabled={day === null || (day !== null && isDateDisabled(day))}
                onClick={() => day && handleDateClick(day)}
                className={`
                  aspect-square flex items-center justify-center text-sm rounded-full
                  ${day === null ? 'invisible' : ''}
                  ${day !== null && isDateDisabled(day) ? 'text-neutral-300 cursor-not-allowed' : 'hover:bg-neutral-100 cursor-pointer'}
                  ${day !== null && isCheckIn(day) ? 'bg-neutral-900 text-white hover:bg-neutral-800' : ''}
                  ${day !== null && isCheckOut(day) ? 'bg-neutral-900 text-white hover:bg-neutral-800' : ''}
                  ${day !== null && isDateInRange(day) ? 'bg-neutral-100' : ''}
                `}
              >
                {day}
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-neutral-200">
            <button
              onClick={clearDates}
              className="text-sm underline text-neutral-600 hover:text-neutral-900"
            >
              清除日期
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800"
            >
              完成
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DateRangePicker;
