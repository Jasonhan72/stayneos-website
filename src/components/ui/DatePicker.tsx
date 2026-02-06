"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

interface DatePickerProps {
  label?: string;
  value?: Date;
  onChange: (date: Date) => void;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  error?: string;
  className?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  label,
  value,
  onChange,
  placeholder = "选择日期",
  minDate,
  maxDate,
  disabled = false,
  error,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(value || new Date());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getDaysInMonth = (year: number, month: number): number => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number): number => {
    return new Date(year, month, 1).getDay();
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleDateSelect = (day: number) => {
    const selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    onChange(selectedDate);
    setIsOpen(false);
  };

  const isDateDisabled = (day: number): boolean => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  const isSelectedDate = (day: number): boolean => {
    if (!value) return false;
    return (
      value.getDate() === day &&
      value.getMonth() === currentMonth.getMonth() &&
      value.getFullYear() === currentMonth.getFullYear()
    );
  };

  const isToday = (day: number): boolean => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === currentMonth.getMonth() &&
      today.getFullYear() === currentMonth.getFullYear()
    );
  };

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const weekDays = ["日", "一", "二", "三", "四", "五", "六"];

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      {label && (
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "w-full px-4 py-3 border bg-white text-left flex items-center gap-3",
          "transition-all duration-200",
          "focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary",
          disabled && "bg-neutral-100 cursor-not-allowed",
          error ? "border-error" : "border-neutral-300",
          value ? "text-neutral-900" : "text-neutral-400"
        )}
      >
        <Calendar className="w-5 h-5 text-neutral-400 flex-shrink-0" />
        <span className="flex-1">{value ? formatDate(value) : placeholder}</span>
      </button>

      {error && <p className="mt-2 text-sm text-error">{error}</p>}

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-neutral-200 shadow-lg z-50 w-72">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 hover:bg-neutral-100 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="font-medium text-neutral-900">
              {year}年 {month + 1}月
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 hover:bg-neutral-100 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Week Days */}
          <div className="grid grid-cols-7 gap-0">
            {weekDays.map((day) => (
              <div
                key={day}
                className="px-2 py-2 text-center text-xs font-medium text-neutral-500"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-0">
            {Array.from({ length: firstDay }).map((_, index) => (
              <div key={`empty-${index}`} className="h-10" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, index) => {
              const day = index + 1;
              const disabled = isDateDisabled(day);
              const selected = isSelectedDate(day);
              const today = isToday(day);

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDateSelect(day)}
                  disabled={disabled}
                  className={cn(
                    "h-10 flex items-center justify-center text-sm transition-colors",
                    selected && "bg-primary text-white",
                    !selected && today && "bg-accent text-neutral-900",
                    !selected && !today && "hover:bg-neutral-100",
                    disabled && "text-neutral-300 cursor-not-allowed"
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;
