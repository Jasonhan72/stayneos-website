// User Profile Page
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Shield,
  CreditCard,
  Bell,
  ChevronRight,
  Camera,
  Check
} from 'lucide-react';
import { Button, Container, Card } from '@/components/ui';
import BackToHomeButton from '@/components/navigation/BackToHomeButton';

// Mock user data
const mockUser = {
  id: '1',
  name: '张三',
  email: 'zhangsan@example.com',
  phone: '+1 (416) 123-4567',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
  location: 'Toronto, ON',
  joinDate: '2024-01-15',
  verified: true,
  memberLevel: '黄金会员',
  totalBookings: 3,
  totalNights: 45,
};

const menuItems = [
  { 
    icon: User, 
    label: '个人信息', 
    href: '/profile',
    description: '管理您的基本资料和联系方式'
  },
  { 
    icon: CreditCard, 
    label: '支付方式', 
    href: '/profile/payment',
    description: '管理您的信用卡和支付方式'
  },
  { 
    icon: Shield, 
    label: '安全设置', 
    href: '/profile/security',
    description: '密码、双重认证等安全选项'
  },
  { 
    icon: Bell, 
    label: '通知偏好', 
    href: '/profile/notifications',
    description: '管理邮件和推送通知设置'
  },
];

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(mockUser);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSave = () => {
    // Simulate API call
    setTimeout(() => {
      setIsEditing(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 500);
  };

  return (
    <main className="min-h-screen bg-neutral-50 pt-24 pb-12">
      <Container>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900">个人中心</h1>
          <p className="text-neutral-600 mt-2">管理您的账户信息和偏好设置</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="mb-6">
              <div className="p-6 text-center">
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <Image
                    src={mockUser.avatar}
                    alt={mockUser.name}
                    fill
                    className="object-cover"
                  />
                  <button className="absolute bottom-0 right-0 p-2 bg-primary text-white hover:bg-primary-700 transition-colors">
                    <Camera size={14} />
                  </button>
                </div>
                
                <h2 className="text-xl font-semibold text-neutral-900">{mockUser.name}</h2>
                <p className="text-sm text-neutral-500">{mockUser.email}</p>
                
                <div className="mt-4 inline-flex items-center gap-1 px-3 py-1 bg-accent/10 text-accent text-sm font-medium">
                  <Shield size={14} />
                  {mockUser.memberLevel}
                </div>
              </div>
            </Card>

            <Card>
              <nav className="divide-y divide-neutral-200">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.href === '/profile';
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 p-4 hover:bg-neutral-50 transition-colors ${
                        isActive ? 'bg-primary/5 border-l-4 border-l-primary' : 'border-l-4 border-l-transparent'
                      }`}
                    >
                      <Icon size={20} className={isActive ? 'text-primary' : 'text-neutral-400'} />
                      <span className={`font-medium ${isActive ? 'text-primary' : 'text-neutral-700'}`}>
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
              </nav>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 flex items-center justify-center">
                    <Calendar className="text-primary" size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">总预订次数</p>
                    <p className="text-2xl font-bold text-neutral-900">{mockUser.totalBookings}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-accent/10 flex items-center justify-center">
                    <User className="text-accent" size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">累计入住天数</p>
                    <p className="text-2xl font-bold text-neutral-900">{mockUser.totalNights}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-success/10 flex items-center justify-center">
                    <Shield className="text-success" size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">会员等级</p>
                    <p className="text-2xl font-bold text-neutral-900">{mockUser.memberLevel}</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Profile Form */}
            <Card>
              <div className="p-6 border-b border-neutral-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900">个人信息</h3>
                    <p className="text-sm text-neutral-500 mt-1">更新您的基本资料</p>
                  </div>
                  
                  {!isEditing ? (
                    <Button variant="outline" onClick={() => setIsEditing(true)}>
                      编辑资料
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="ghost" onClick={() => setIsEditing(false)}>
                        取消
                      </Button>
                      <Button onClick={handleSave}>
                        保存更改
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6">
                {showSuccess && (
                  <div className="mb-6 p-4 bg-success/10 border border-success/20 text-success flex items-center gap-2">
                    <Check size={18} />
                    <span>个人资料已成功更新！</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      姓名
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        disabled={!isEditing}
                        className="w-full pl-10 pr-4 py-3 border border-neutral-300 bg-white disabled:bg-neutral-50 disabled:text-neutral-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      邮箱地址
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        disabled={!isEditing}
                        className="w-full pl-10 pr-4 py-3 border border-neutral-300 bg-white disabled:bg-neutral-50 disabled:text-neutral-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    {mockUser.verified && (
                      <div className="flex items-center gap-1 mt-2 text-success text-sm">
                        <Check size={14} />
                        <span>已验证</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      联系电话
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        disabled={!isEditing}
                        className="w-full pl-10 pr-4 py-3 border border-neutral-300 bg-white disabled:bg-neutral-50 disabled:text-neutral-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      所在城市
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        disabled={!isEditing}
                        className="w-full pl-10 pr-4 py-3 border border-neutral-300 bg-white disabled:bg-neutral-50 disabled:text-neutral-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Recent Bookings Preview */}
            <Card>
              <div className="p-6 border-b border-neutral-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900">最近预订</h3>
                    <p className="text-sm text-neutral-500 mt-1">查看您的预订历史</p>
                  </div>
                  <Link 
                    href="/bookings"
                    className="flex items-center gap-1 text-primary hover:text-primary-700 font-medium"
                  >
                    查看全部
                    <ChevronRight size={16} />
                  </Link>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  {[
                    {
                      id: '1',
                      property: 'Cooper St 豪华湖景公寓',
                      checkIn: '2024-03-01',
                      checkOut: '2024-03-31',
                      status: 'upcoming',
                      totalPrice: 17680,
                    },
                    {
                      id: '2',
                      property: 'Simcoe St 高层精品公寓',
                      checkIn: '2024-01-15',
                      checkOut: '2024-02-15',
                      status: 'completed',
                      totalPrice: 12150,
                    },
                  ].map((booking) => (
                    <div 
                      key={booking.id}
                      className="flex items-center justify-between p-4 bg-neutral-50 border border-neutral-200"
                    >
                      <div>
                        <p className="font-medium text-neutral-900">{booking.property}</p>
                        <p className="text-sm text-neutral-500 mt-1">
                          {booking.checkIn} 至 {booking.checkOut}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`px-2 py-1 text-xs font-medium ${
                            booking.status === 'upcoming' 
                              ? 'bg-primary/10 text-primary' 
                              : 'bg-neutral-200 text-neutral-600'
                          }`}>
                            {booking.status === 'upcoming' ? '即将入住' : '已完成'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-neutral-900">
                          ${booking.totalPrice.toLocaleString()} CAD
                        </p>
                        <Link 
                          href={`/bookings/${booking.id}`}
                          className="text-sm text-primary hover:text-primary-700 mt-1"
                        >
                          查看详情
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Container>

      {/* Back to Home Button */}
      <BackToHomeButton />
    </main>
  );
}
