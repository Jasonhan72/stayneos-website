"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import PropertyCard from "@/components/property/PropertyCard";
import { mockProperties } from "@/lib/data";
import { SlidersHorizontal, Grid3X3, List, ChevronDown } from "lucide-react";

export default function PropertiesPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("recommended");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const sortOptions = [
    { value: "recommended", label: "推荐" },
    { value: "price-low", label: "价格从低到高" },
    { value: "price-high", label: "价格从高到低" },
    { value: "rating", label: "评分最高" },
  ];

  const filteredProperties = [...mockProperties].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "rating":
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

  return (
    <main className="min-h-screen bg-amber-50">
      <Navbar />

      {/* Header */}
      <div className="pt-24 pb-6 bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900">全部房源</h1>
            <p className="text-gray-600">
              共 {mockProperties.length} 套精选行政公寓
            </p>
          </div>
        </div>
      </div>

      {/* Filters & Sort */}
      <div className="sticky top-16 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Filter Button */}
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
            >
              <SlidersHorizontal size={18} />
              <span className="font-medium">筛选</span>
            </button>

            <div className="flex items-center gap-4">
              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-transparent pr-8 pl-3 py-2 text-sm font-medium text-gray-700 focus:outline-none cursor-pointer"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 transition-colors ${
                    viewMode === "grid"
                      ? "bg-gray-800 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Grid3X3 size={18} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 transition-colors ${
                    viewMode === "list"
                      ? "bg-gray-800 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <List size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      {isFilterOpen && (
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="container mx-auto px-4 py-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  价格范围
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="最低价"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <span className="text-gray-400">-</span>
                  <input
                    type="number"
                    placeholder="最高价"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Bedrooms */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  卧室数量
                </label>
                <div className="flex flex-wrap gap-2">
                  {["1室", "2室", "3室", "4室+"].map((item) => (
                    <button
                      key={item}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:border-blue-500 hover:text-blue-600 transition-colors"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amenities */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  配套设施
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    "WiFi",
                    "空调",
                    "洗衣机",
                    "厨房",
                    "健身房",
                    "游泳池",
                    "停车位",
                    "管家服务",
                  ].map((item) => (
                    <button
                      key={item}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:border-blue-500 hover:text-blue-600 transition-colors"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => setIsFilterOpen(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                重置
              </button>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                应用筛选
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Properties Grid */}
      <div className="container mx-auto px-4 py-8">
        <div
          className={`gap-6 ${
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              : "flex flex-col"
          }`}
        >
          {filteredProperties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredProperties.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500">没有找到符合条件的房源</p>
          </div>
        )}

        {/* Load More */}
        {filteredProperties.length > 0 && (
          <div className="text-center mt-12">
            <button className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
              加载更多
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
