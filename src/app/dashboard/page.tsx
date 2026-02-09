"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/lib/context/UserContext";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { mockProperties } from "@/lib/data";
import {
  User,
  Calendar,
  Heart,
  Settings,
  LogOut,
  MapPin,
  Star,
  CheckCircle,
  XCircle,
  Edit3,
  Camera,
} from "lucide-react";

// 模拟预订数据
const mockBookings = [
  {
    id: "booking-1",
    property: mockProperties[0],
    checkIn: "2024-03-15",
    checkOut: "2024-03-18",
    guests: 2,
    totalPrice: 1050,
    status: "upcoming" as const,
    createdAt: "2024-02-01",
  },
  {
    id: "booking-2",
    property: mockProperties[1],
    checkIn: "2024-02-10",
    checkOut: "2024-02-12",
    guests: 2,
    totalPrice: 560,
    status: "completed" as const,
    createdAt: "2024-01-20",
  },
];

// 模拟收藏房源
const mockFavorites = [mockProperties[0], mockProperties[1]];

function DashboardContent() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<"bookings" | "favorites" | "profile">("bookings");
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    memberSince: "2024年1月",
  });

  const tabs = [
    { id: "bookings", label: "我的预订", icon: Calendar },
    { id: "favorites", label: "收藏房源", icon: Heart },
    { id: "profile", label: "个人信息", icon: User },
  ];

  const getStatusBadge = (status: string) => {
    const styles = {
      upcoming: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-gray-100 text-gray-800",
    };
    const labels = {
      upcoming: "即将入住",
      completed: "已完成",
      cancelled: "已取消",
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${
          styles[status as keyof typeof styles]
        }`}
      >
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const handleSaveProfile = () => {
    setIsEditing(false);
    alert("个人信息已更新！");
  };

  return (
    <main className="min-h-screen bg-amber-50 pt-20">
      <div className="pt-4 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <UserAvatar
                name={user?.name || ""}
                image={user?.image || null}
                size="xl"
                className="shrink-0"
              />
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  欢迎回来，{(user?.name?.split(" ").filter(n => n)[0]) || user?.email?.split("@")[0] || "User"}
                </h1>
                <p className="text-gray-500">会员自 {userData.memberSince}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setActiveTab("profile")}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Settings size={18} />
                  设置
                </button>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <LogOut size={18} />
                  退出
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <nav className="p-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() =>
                          setActiveTab(tab.id as typeof activeTab)
                        }
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                          activeTab === tab.id
                            ? "bg-amber-100 text-amber-900"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <Icon size={20} />
                        <span className="font-medium">{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Quick Stats */}
              <div className="bg-white rounded-xl shadow-sm mt-4 p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">
                  账户概览
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">已完成预订</span>
                    <span className="font-semibold">1</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">即将入住</span>
                    <span className="font-semibold">1</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">收藏房源</span>
                    <span className="font-semibold">{mockFavorites.length}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Bookings Tab */}
              {activeTab === "bookings" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">我的预订</h2>
                    <Link
                      href="/properties"
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      浏览房源 →
                    </Link>
                  </div>

                  {mockBookings.length > 0 ? (
                    mockBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex flex-col md:flex-row gap-4">
                          <Link
                            href={`/properties/${booking.property.id}`}
                            className="relative w-full md:w-48 h-32 rounded-lg overflow-hidden shrink-0"
                          >
                            <Image
                              src={booking.property.images[0]}
                              alt={booking.property.title}
                              fill
                              className="object-cover"
                            />
                          </Link>

                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <Link
                                href={`/properties/${booking.property.id}`}
                                className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                              >
                                {booking.property.title}
                              </Link>
                              {getStatusBadge(booking.status)}
                            </div>

                            <div className="flex items-center gap-1 text-gray-500 text-sm mb-3">
                              <MapPin size={14} />
                              <span>{booking.property.location}</span>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 text-sm">
                              <div className="flex items-center gap-1 text-gray-600">
                                <Calendar size={14} />
                                <span>
                                  {booking.checkIn} ~ {booking.checkOut}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-gray-600">
                                <User size={14} />
                                <span>{booking.guests}位房客</span>
                              </div>
                              <div className="font-semibold text-gray-900">
                                ¥{booking.totalPrice.toLocaleString()}
                              </div>
                            </div>

                            <div className="flex gap-2 mt-4">
                              {booking.status === "upcoming" && (
                                <>
                                  <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                                    查看详情
                                  </button>
                                  <button className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors">
                                    取消预订
                                  </button>
                                </>
                              )}
                              {booking.status === "completed" && (
                                <>
                                  <button className="px-4 py-2 bg-amber-500 text-white text-sm rounded-lg hover:bg-amber-600 transition-colors">
                                    写评价
                                  </button>
                                  <button className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors">
                                    再次预订
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-white rounded-xl p-12 text-center">
                      <Calendar size={48} className="text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        暂无预订
                      </h3>
                      <p className="text-gray-500 mb-6">您还没有任何预订记录</p>
                      <Link
                        href="/properties"
                        className="inline-block px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                      >
                        浏览房源
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Favorites Tab */}
              {activeTab === "favorites" && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">收藏房源</h2>

                  {mockFavorites.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {mockFavorites.map((property) => (
                        <div
                          key={property.id}
                          className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                        >
                          <Link
                            href={`/properties/${property.id}`}
                            className="relative aspect-[4/3] overflow-hidden block"
                          >
                            <Image
                              src={property.images[0]}
                              alt={property.title}
                              fill
                              className="object-cover"
                            />
                            <div className="absolute top-3 right-3 p-2 rounded-full bg-white/90">
                              <Heart size={18} className="text-red-500 fill-red-500" />
                            </div>
                          </Link>

                          <div className="p-4">
                            <Link
                              href={`/properties/${property.id}`}
                              className="font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                            >
                              {property.title}
                            </Link>
                            <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
                              <MapPin size={14} />
                              <span className="truncate">
                                {property.location}
                              </span>
                            </div>
                            <div className="flex items-center justify-between mt-3">
                              <div className="flex items-center gap-1">
                                <Star size={16} className="text-amber-400 fill-amber-400" />
                                <span className="font-medium">{property.rating}</span>
                              </div>
                              <div className="text-right">
                                <span className="font-bold text-gray-900">
                                  ¥{property.price.toLocaleString()}
                                </span>
                                <span className="text-sm text-gray-500">
                                  /{property.priceUnit}
                                </span>
                              </div>
                            </div>

                            <div className="flex gap-2 mt-4">
                              <Link
                                href={`/properties/${property.id}`}
                                className="flex-1 px-4 py-2 bg-amber-500 text-white text-sm text-center rounded-lg hover:bg-amber-600 transition-colors"
                              >
                                立即预订
                              </Link>
                              <button className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors">
                                取消收藏
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white rounded-xl p-12 text-center">
                      <Heart size={48} className="text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        暂无收藏
                      </h3>
                      <p className="text-gray-500 mb-6">您还没有收藏任何房源</p>
                      <Link
                        href="/properties"
                        className="inline-block px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                      >
                        浏览房源
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Profile Tab */}
              {activeTab === "profile" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">个人信息</h2>
                    <button
                      onClick={() =>
                        isEditing ? handleSaveProfile() : setIsEditing(true)
                      }
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {isEditing ? (
                        <>保存</>
                      ) : (
                        <>
                          <Edit3 size={16} />
                          编辑
                        </>
                      )}
                    </button>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    {/* Avatar */}
                    <div className="flex flex-col items-center mb-8">
                      <div className="relative">
                        <UserAvatar
                          name={user?.name || null}
                          image={user?.image || null}
                          size="xl"
                        />
                        {isEditing && (
                          <button className="absolute inset-0 bg-black/50 flex items-center justify-center text-white rounded-full">
                            <Camera size={24} />
                          </button>
                        )}
                      </div>
                      {isEditing && (
                        <p className="text-sm text-gray-500 mt-2">点击更换头像</p>
                      )}
                    </div>

                    {/* Form Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          姓名
                        </label>
                        <input
                          type="text"
                          value={userData.name}
                          onChange={(e) =>
                            setUserData({ ...userData, name: e.target.value })
                          }
                          disabled={!isEditing}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          邮箱
                        </label>
                        <input
                          type="email"
                          value={userData.email}
                          onChange={(e) =>
                            setUserData({ ...userData, email: e.target.value })
                          }
                          disabled={!isEditing}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          手机号
                        </label>
                        <input
                          type="tel"
                          value={userData.phone}
                          onChange={(e) =>
                            setUserData({ ...userData, phone: e.target.value })
                          }
                          disabled={!isEditing}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          注册时间
                        </label>
                        <input
                          type="text"
                          value={userData.memberSince}
                          disabled
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Security */}
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">账户安全</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <CheckCircle size={20} className="text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">登录密码</p>
                            <p className="text-sm text-gray-500">已设置</p>
                          </div>
                        </div>
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                          修改
                        </button>
                      </div>

                      <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-yellow-100 rounded-lg">
                            <CheckCircle size={20} className="text-yellow-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">手机验证</p>
                            <p className="text-sm text-gray-500">
                              {userData.phone || "未设置"}
                            </p>
                          </div>
                        </div>
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                          修改
                        </button>
                      </div>

                      <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            <XCircle size={20} className="text-gray-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">双重验证</p>
                            <p className="text-sm text-gray-500">未开启</p>
                          </div>
                        </div>
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                          开启
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
