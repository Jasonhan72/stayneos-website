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
} from "lucide-react";

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

  return (
    <div className="w-full max-w-4xl mx-auto" role="search" aria-label="搜索房源">
      <div className="bg-white rounded-2xl shadow-xl p-2 md:p-4">
        <div className="flex flex-col md:flex-row gap-2 md:gap-0">
          {/* Location */}
          <div className="relative flex-1 md:border-r md:border-gray-200">
            <button
              onClick={() => {
                setIsLocationOpen(!isLocationOpen);
                setIsDateOpen(false);
                setIsGuestsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                isLocationOpen ? "bg-gray-50" : "hover:bg-gray-50"
              }`}
              aria-expanded={isLocationOpen}
              aria-controls="location-dropdown"
              aria-label="选择位置"
            >
              <MapPin className="text-blue-500 shrink-0" size={20} aria-hidden="true" />
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-500">位置</p>
                <p className="text-sm font-medium text-gray-800 truncate">
                  {searchData.location || "选择位置"}
                </p>
              </div>
              <ChevronDown
                size={16}
                className={`text-gray-400 transition-transform ${
                  isLocationOpen ? "rotate-180" : ""
                }`}
                aria-hidden="true"
              />
            </button>

            {isLocationOpen && (
              <div id="location-dropdown" className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 p-4 z-20">
                <p className="text-xs font-medium text-gray-500 mb-3">热门位置</p>
                <div className="grid grid-cols-2 gap-2" role="listbox" aria-label="热门位置">
                  {popularLocations.map((location) => (
                    <button
                      key={location}
                      onClick={() => {
                        setSearchData({ ...searchData, location });
                        setIsLocationOpen(false);
                      }}
                      className="flex items-center gap-2 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left focus:outline-none focus:ring-2 focus:ring-blue-500"
                      role="option"
                      aria-selected={searchData.location === location}
                    >
                      <MapPin size={16} className="text-gray-400" aria-hidden="true" />
                      <span className="text-sm text-gray-700">{location}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Dates */}
          <div className="relative flex-1 md:border-r md:border-gray-200">
            <button
              onClick={() => {
                setIsDateOpen(!isDateOpen);
                setIsLocationOpen(false);
                setIsGuestsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                isDateOpen ? "bg-gray-50" : "hover:bg-gray-50"
              }`}
              aria-expanded={isDateOpen}
              aria-controls="date-dropdown"
              aria-label="选择日期"
            >
              <Calendar className="text-blue-500 shrink-0" size={20} aria-hidden="true" />
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-500">日期</p>
                <p className="text-sm font-medium text-gray-800">
                  {searchData.checkIn && searchData.checkOut
                    ? `${searchData.checkIn} - ${searchData.checkOut}`
                    : "选择日期"}
                </p>
              </div>
              <ChevronDown
                size={16}
                className={`text-gray-400 transition-transform ${
                  isDateOpen ? "rotate-180" : ""
                }`}
                aria-hidden="true"
              />
            </button>

            {isDateOpen && (
              <div id="date-dropdown" className="absolute top-full left-0 right-0 md:left-auto md:w-80 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 p-4 z-20">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="checkin-date" className="block text-xs font-medium text-gray-500 mb-2">
                      入住日期
                    </label>
                    <input
                      id="checkin-date"
                      type="date"
                      value={searchData.checkIn}
                      onChange={(e) =>
                        setSearchData({ ...searchData, checkIn: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label htmlFor="checkout-date" className="block text-xs font-medium text-gray-500 mb-2">
                      退房日期
                    </label>
                    <input
                      id="checkout-date"
                      type="date"
                      value={searchData.checkOut}
                      onChange={(e) =>
                        setSearchData({ ...searchData, checkOut: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    onClick={() => setIsDateOpen(false)}
                    className="w-full bg-blue-600 text-white rounded-lg py-2 font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    确定
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Guests */}
          <div className="relative flex-1">
            <button
              onClick={() => {
                setIsGuestsOpen(!isGuestsOpen);
                setIsLocationOpen(false);
                setIsDateOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                isGuestsOpen ? "bg-gray-50" : "hover:bg-gray-50"
              }`}
              aria-expanded={isGuestsOpen}
              aria-controls="guests-dropdown"
              aria-label="选择人数"
            >
              <Users className="text-blue-500 shrink-0" size={20} aria-hidden="true" />
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-500">人数</p>
                <p className="text-sm font-medium text-gray-800">
                  {searchData.guests} 位房客
                </p>
              </div>
              <ChevronDown
                size={16}
                className={`text-gray-400 transition-transform ${
                  isGuestsOpen ? "rotate-180" : ""
                }`}
                aria-hidden="true"
              />
            </button>

            {isGuestsOpen && (
              <div id="guests-dropdown" className="absolute top-full left-0 right-0 md:left-auto md:w-64 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 p-4 z-20">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700" id="guests-label">房客</span>
                  <div className="flex items-center gap-3" role="group" aria-labelledby="guests-label">
                    <button
                      onClick={() =>
                        setSearchData({
                          ...searchData,
                          guests: Math.max(1, searchData.guests - 1),
                        })
                      }
                      disabled={searchData.guests <= 1}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-40 hover:border-blue-500 hover:text-blue-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label="减少房客数量"
                    >
                      <Minus size={16} aria-hidden="true" />
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
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-40 hover:border-blue-500 hover:text-blue-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label="增加房客数量"
                    >
                      <Plus size={16} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Search Button */}
          <div className="md:pl-2">
            <button
              onClick={handleSearch}
              className="w-full md:w-auto flex items-center justify-center gap-2 bg-amber-500 text-white rounded-xl py-3 px-6 font-medium hover:bg-amber-600 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
              aria-label="搜索房源"
            >
              <Search size={20} aria-hidden="true" />
              <span className="md:hidden">搜索</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
