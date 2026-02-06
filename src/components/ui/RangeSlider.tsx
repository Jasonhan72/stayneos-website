"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

interface RangeSliderProps {
  label?: string;
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  step?: number;
  formatValue?: (value: number) => string;
  className?: string;
}

export const RangeSlider: React.FC<RangeSliderProps> = ({
  label,
  min,
  max,
  value,
  onChange,
  step = 1,
  formatValue = (v) => v.toString(),
  className,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState<number | null>(null);
  const [localValue, setLocalValue] = useState<[number, number]>(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const getPercentage = useCallback(
    (val: number) => ((val - min) / (max - min)) * 100,
    [min, max]
  );

  const getValueFromPosition = useCallback(
    (clientX: number) => {
      if (!trackRef.current) return min;
      const rect = trackRef.current.getBoundingClientRect();
      const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const rawValue = min + percentage * (max - min);
      return Math.round(rawValue / step) * step;
    },
    [min, max, step]
  );

  const handleMouseDown = (index: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(index);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging === null) return;

      const newValue = getValueFromPosition(e.clientX);
      const otherValue = localValue[isDragging === 0 ? 1 : 0];

      let nextValue: [number, number];
      if (isDragging === 0) {
        nextValue = [Math.min(newValue, otherValue), otherValue];
      } else {
        nextValue = [otherValue, Math.max(newValue, otherValue)];
      }

      setLocalValue(nextValue);
    };

    const handleMouseUp = () => {
      if (isDragging !== null) {
        onChange(localValue);
        setIsDragging(null);
      }
    };

    if (isDragging !== null) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, localValue, onChange, getValueFromPosition]);

  const leftPercent = getPercentage(localValue[0]);
  const rightPercent = getPercentage(localValue[1]);

  return (
    <div className={cn("w-full", className)}>
      {label && (
        <label className="block text-sm font-medium text-neutral-700 mb-4">
          {label}
        </label>
      )}

      {/* Value Display */}
      <div className="flex items-center justify-between mb-4">
        <span className="px-3 py-1 bg-neutral-100 text-neutral-700 text-sm font-medium">
          {formatValue(localValue[0])}
        </span>
        <span className="text-neutral-400">—</span>
        <span className="px-3 py-1 bg-neutral-100 text-neutral-700 text-sm font-medium">
          {formatValue(localValue[1])}
        </span>
      </div>

      {/* Slider Track */}
      <div
        ref={trackRef}
        className="relative h-2 bg-neutral-200 cursor-pointer"
      >
        {/* Active Range */}
        <div
          className="absolute h-full bg-primary"
          style={{
            left: `${leftPercent}%`,
            right: `${100 - rightPercent}%`,
          }}
        />

        {/* Left Thumb */}
        <div
          className={cn(
            "absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white border-2 border-primary cursor-grab transition-transform",
            "hover:scale-110 active:scale-95 active:cursor-grabbing shadow-sm",
            isDragging === 0 && "scale-110 cursor-grabbing"
          )}
          style={{ left: `${leftPercent}%`, transform: `translate(-50%, -50%)` }}
          onMouseDown={handleMouseDown(0)}
          role="slider"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={localValue[0]}
          tabIndex={0}
        />

        {/* Right Thumb */}
        <div
          className={cn(
            "absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white border-2 border-primary cursor-grab transition-transform",
            "hover:scale-110 active:scale-95 active:cursor-grabbing shadow-sm",
            isDragging === 1 && "scale-110 cursor-grabbing"
          )}
          style={{ left: `${rightPercent}%`, transform: `translate(-50%, -50%)` }}
          onMouseDown={handleMouseDown(1)}
          role="slider"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={localValue[1]}
          tabIndex={0}
        />
      </div>

      {/* Min/Max Labels */}
      <div className="flex justify-between mt-2 text-xs text-neutral-500">
        <span>{formatValue(min)}</span>
        <span>{formatValue(max)}</span>
      </div>
    </div>
  );
};

export default RangeSlider;
