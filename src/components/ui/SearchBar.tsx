"use client";

import { useState } from "react";
import {
  MapPin,
  Calendar,
  Users,
  Search,
  ChevronDown,
  Minus,
  Plus,
  X
} from "lucide-react";
import { AirbnbCalendar } from "@/components/booking";
import { cn } from "@/lib/utils";

interface SearchData {
  location: string;
  checkIn: string;
  checkOut: string;
  guests: number;
}

export default function SearchBar() {
  const [searchData, setSearchData] = useState<SearchData>({
    location: "",
    checkIn: "",
    checkOut: "",
    guests: 2,
  });

  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [isGuestsOpen, setIsGuestsOpen] = useState(false);

  const popularLocations = [
    "多伦多市中心",
    "北约克",
    "万锦",
    "密西沙加",
    "士嘉堡",
    "列治文山",
  ];

  const handleSearch = () => {
    console.log("Search:", searchData);
    // TODO: Navigate to properties page with search params
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("zh-CN", { month: "short", day: "numeric" });
  };

  return (
    <div className="w-full max-w-4xl mx-auto relative" role="search" aria-label="搜索房源">
      {/* Desktop: Horizontal Search Bar */}
      <div className="hidden md:block bg-white rounded-full shadow-xl border border-neutral-200 p-2">
        <div className="flex items-center">
          {/* Location */}
          <div className="relative flex-1 px-6 border-r border-neutral-200">
            <button
              onClick={() => {
                setIsLocationOpen(!isLocationOpen);
                setIsDateOpen(false);
                setIsGuestsOpen(false);
              }}
              className={cn(
                "w-full text-left py-2 transition-all focus:outline-none",
                isLocationOpen && "bg-neutral-50"
              )}
              aria-expanded={isLocationOpen}
              aria-controls="location-dropdown"
              aria-label="选择位置"
            >
              <p className="text-xs font-bold text-neutral-900">位置</p>
              <p className={cn(
                "text-sm truncate transition-colors",
                searchData.location ? "text-neutral-900 font-medium" : "text-neutral-500"
              )}>
                {searchData.location || "搜索目的地"}
              </p>
            </button>

            {/* Location Dropdown */}
            {isLocationOpen && (
              <>
                <div 
                  className="fixed inset-0 z-30" 
                  onClick={() => setIsLocationOpen(false)}
                />
                <div 
                  id="location-dropdown" 
                  className="absolute top-full left-0 mt-4 bg-white rounded-2xl shadow-2xl border border-neutral-100 p-4 z-40 min-w-[300px]"
                >
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-neutral-900">热门位置</p>
                    <button 
                      onClick={() => setIsLocationOpen(false)}
                      className="p-1 hover:bg-neutral-100 rounded-full"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-1" role="listbox" aria-label="热门位置">
                    {popularLocations.map((location) => (
                      <button
                        key={location}
                        onClick={() => {
                          setSearchData({ ...searchData, location });
                          setIsLocationOpen(false);
                        }}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-xl transition-colors text-left",
                          searchData.location === location 
                            ? "bg-neutral-100 font-medium" 
                            : "hover:bg-neutral-50"
                        )}
                        role="option"
                        aria-selected={searchData.location === location}
                      >
                        <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center">
                          <MapPin size={18} className="text-neutral-500" />
                        </div>
                        <span className="text-sm text-neutral-700">{location}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Check-in */}
          <div className="relative flex-1 px-6 border-r border-neutral-200">
            <button
              onClick={() => {
                setIsDateOpen(!isDateOpen);
                setIsLocationOpen(false);
                setIsGuestsOpen(false);
              }}
              className={cn(
                "w-full text-left py-2 transition-all focus:outline-none",
                isDateOpen && "bg-neutral-50"
              )}
              aria-expanded={isDateOpen}
              aria-label="选择入住日期"
            >
              <p className="text-xs font-bold text-neutral-900">入住</p>
              <p className={cn(
                "text-sm transition-colors",
                searchData.checkIn ? "text-neutral-900 font-medium" : "text-neutral-500"
              )}>
                {searchData.checkIn ? formatDate(searchData.checkIn) : "添加日期"}
              </p>
            </button>
          </div>

          {/* Check-out */}
          <div className="relative flex-1 px-6 border-r border-neutral-200">
            <button
              onClick={() => {
                setIsDateOpen(!isDateOpen);
                setIsLocationOpen(false);
                setIsGuestsOpen(false);
              }}
              className={cn(
                "w-full text-left py-2 transition-all focus:outline-none",
                isDateOpen && "bg-neutral-50"
              )}
              aria-expanded={isDateOpen}
              aria-label="选择退房日期"
            >
              <p className="text-xs font-bold text-neutral-900">退房</p>
              <p className={cn(
                "text-sm transition-colors",
                searchData.checkOut ? "text-neutral-900 font-medium" : "text-neutral-500"
              )}>
                {searchData.checkOut ? formatDate(searchData.checkOut) : "添加日期"}
              </p>
            </button>
          </div>

          {/* Guests */}
          <div className="relative flex-1 px-6">
            <button
              onClick={() => {
                setIsGuestsOpen(!isGuestsOpen);
                setIsLocationOpen(false);
                setIsDateOpen(false);
              }}
              className={cn(
                "w-full text-left py-2 transition-all focus:outline-none",
                isGuestsOpen && "bg-neutral-50"
              )}
              aria-expanded={isGuestsOpen}
              aria-controls="guests-dropdown"
              aria-label="选择人数"
            >
              <p className="text-xs font-bold text-neutral-900">人数</p>
              <p className="text-sm text-neutral-900 font-medium">
                {searchData.guests} 位房客
              </p>
            </button>

            {/* Guests Dropdown */}
            {isGuestsOpen && (
              <>
                <div 
                  className="fixed inset-0 z-30" 
                  onClick={() => setIsGuestsOpen(false)}
                />
                <div 
                  id="guests-dropdown" 
                  className="absolute top-full right-0 mt-4 bg-white rounded-2xl shadow-2xl border border-neutral-100 p-4 z-40 min-w-[280px]"
                >
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-semibold text-neutral-900">房客</p>
                    <button 
                      onClick={() => setIsGuestsOpen(false)}
                      className="p-1 hover:bg-neutral-100 rounded-full"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-neutral-900">成人</p>
                      <p className="text-sm text-neutral-500">13岁及以上</p>
                    </div>
                    <div className="flex items-center gap-3" role="group">
                      <button
                        onClick={() =>
                          setSearchData({
                            ...searchData,
                            guests: Math.max(1, searchData.guests - 1),
                          })
                        }
                        disabled={searchData.guests <= 1}
                        className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center disabled:opacity-40 hover:border-neutral-900 transition-colors"
                        aria-label="减少房客数量"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-6 text-center font-medium" aria-live="polite">
                        {searchData.guests}
                      </span>
                      <button
                        onClick={() =>
                          setSearchData({
                            ...searchData,
                            guests: Math.min(10, searchData.guests + 1),
                          })
                        }
                        disabled={searchData.guests >= 10}
                        className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center disabled:opacity-40 hover:border-neutral-900 transition-colors"
                        aria-label="增加房客数量"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Search Button */}
          <div className="pl-2">
            <button
              onClick={handleSearch}
              className="flex items-center justify-center gap-2 bg-rose-500 hover:bg-rose-600 text-white rounded-full p-4 transition-colors"
              aria-label="搜索房源"
            >
              <Search size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile: Compact Search Bar */}
      <div className="md:hidden bg-white rounded-2xl shadow-xl p-2">
        <div className="flex flex-col gap-2">
          {/* Location Row */}
          <button
            onClick={() => {
              setIsLocationOpen(!isLocationOpen);
              setIsDateOpen(false);
              setIsGuestsOpen(false);
            }}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left",
              isLocationOpen ? "bg-neutral-50" : "hover:bg-neutral-50"
            )}
            aria-expanded={isLocationOpen}
            aria-controls="location-dropdown-mobile"
            aria-label="选择位置"
          >
            <MapPin className="text-rose-500 shrink-0" size={20} />
            <div className="flex-1">
              <p className="text-xs font-medium text-neutral-500">位置</p>
              <p className="text-sm font-medium text-neutral-800 truncate">
                {searchData.location || "选择位置"}
              </p>
            </div>
            <ChevronDown
              size={16}
              className={cn(
                "text-neutral-400 transition-transform",
                isLocationOpen && "rotate-180"
              )}
            />
          </button>

          {/* Dates Row */}
          <button
            onClick={() => {
              setIsDateOpen(!isDateOpen);
              setIsLocationOpen(false);
              setIsGuestsOpen(false);
            }}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left",
              isDateOpen ? "bg-neutral-50" : "hover:bg-neutral-50"
            )}
            aria-expanded={isDateOpen}
            aria-label="选择日期"
          >
            <Calendar className="text-rose-500 shrink-0" size={20} />
            <div className="flex-1">
              <p className="text-xs font-medium text-neutral-500">日期</p>
              <p className="text-sm font-medium text-neutral-800">
                {searchData.checkIn && searchData.checkOut
                  ? `${formatDate(searchData.checkIn)} - ${formatDate(searchData.checkOut)}`
                  : "选择日期"}
              </p>
            </div>
            <ChevronDown
              size={16}
              className={cn(
                "text-neutral-400 transition-transform",
                isDateOpen && "rotate-180"
              )}
            />
          </button>

          {/* Guests Row */}
          <button
            onClick={() => {
              setIsGuestsOpen(!isGuestsOpen);
              setIsLocationOpen(false);
              setIsDateOpen(false);
            }}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left",
              isGuestsOpen ? "bg-neutral-50" : "hover:bg-neutral-50"
            )}
            aria-expanded={isGuestsOpen}
            aria-controls="guests-dropdown-mobile"
            aria-label="选择人数"
          >
            <Users className="text-rose-500 shrink-0" size={20} />
            <div className="flex-1">
              <p className="text-xs font-medium text-neutral-500">人数</p>
              <p className="text-sm font-medium text-neutral-800">
                {searchData.guests} 位房客
              </p>
            </div>
            <ChevronDown
              size={16}
              className={cn(
                "text-neutral-400 transition-transform",
                isGuestsOpen && "rotate-180"
              )}
            />
          </button>

          {/* Mobile Location Dropdown */}
          {isLocationOpen && (
            <div id="location-dropdown-mobile" className="bg-white rounded-xl border border-neutral-100 p-3">
              <p className="text-xs font-medium text-neutral-500 mb-2">热门位置</p>
              <div className="grid grid-cols-2 gap-2">
                {popularLocations.map((location) => (
                  <button
                    key={location}
                    onClick={() => {
                      setSearchData({ ...searchData, location });
                      setIsLocationOpen(false);
                    }}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-neutral-50 transition-colors text-left"
                  >
                      <MapPin size={16} className="text-neutral-400" />
                      <span className="text-sm text-neutral-700">{location}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Mobile Guests Dropdown */}
          {isGuestsOpen && (
            <div id="guests-dropdown-mobile" className="bg-white rounded-xl border border-neutral-100 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-700">房客</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() =>
                      setSearchData({
                        ...searchData,
                        guests: Math.max(1, searchData.guests - 1),
                      })
                    }
                    disabled={searchData.guests <= 1}
                    className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center disabled:opacity-40"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-6 text-center font-medium">{searchData.guests}</span>
                  <button
                    onClick={() =>
                      setSearchData({
                        ...searchData,
                        guests: Math.min(10, searchData.guests + 1),
                      })
                    }
                    disabled={searchData.guests >= 10}
                    className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center disabled:opacity-40"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Search Button */}
          <button
            onClick={handleSearch}
            className="w-full flex items-center justify-center gap-2 bg-rose-500 text-white rounded-xl py-3 font-medium hover:bg-rose-600 transition-colors"
            aria-label="搜索房源"
          >
            <Search size={20} />
            搜索
          </button>
        </div>
      </div>

      {/* Date Picker Modal */}
      {isDateOpen && (
        <AirbnbCalendar 
          checkIn={searchData.checkIn}
          checkOut={searchData.checkOut}
          onSelectCheckIn={(date) => setSearchData({ ...searchData, checkIn: date })}
          onSelectCheckOut={(date) => setSearchData({ ...searchData, checkOut: date })}
          onClose={() => setIsDateOpen(false)}
          onClearDates={() => setSearchData({ ...searchData, checkIn: '', checkOut: '' })}
          minNights={1}
          rating={4.9}
          currency="CAD"
        />
      )}
    </div>
  );
}
