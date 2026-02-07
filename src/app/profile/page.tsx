'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useUser } from '@/lib/context/UserContext';
import AvatarUpload from '@/components/user/AvatarUpload';
import Button from '@/components/ui/Button';
import { Card, Container } from '@/components/ui';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar,
  Shield,
  ChevronLeft,
  Check,
  Flag,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Country list for nationality dropdown
const countries = [
  'Canada',
  'United States',
  'China',
  'United Kingdom',
  'France',
  'Germany',
  'Australia',
  'Japan',
  'Singapore',
  'Other'
];

export default function ProfilePage() {
  const { user, updateProfile, isLoading } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dateOfBirth: user?.dateOfBirth || '',
    nationality: user?.nationality || '',
    emergencyContactName: user?.emergencyContact?.name || '',
    emergencyContactPhone: user?.emergencyContact?.phone || '',
    emergencyContactRelationship: user?.emergencyContact?.relationship || '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    await updateProfile({
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
      dateOfBirth: formData.dateOfBirth,
      nationality: formData.nationality,
      emergencyContact: {
        name: formData.emergencyContactName,
        phone: formData.emergencyContactPhone,
        relationship: formData.emergencyContactRelationship,
      },
    });
    setIsEditing(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      dateOfBirth: user?.dateOfBirth || '',
      nationality: user?.nationality || '',
      emergencyContactName: user?.emergencyContact?.name || '',
      emergencyContactPhone: user?.emergencyContact?.phone || '',
      emergencyContactRelationship: user?.emergencyContact?.relationship || '',
    });
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-50 pt-24 pb-12">
        <Container>
          <div className="text-center">
            <p className="text-neutral-600">Please log in to view your profile.</p>
            <Link href="/login">
              <Button className="mt-4">Log in</Button>
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-50 pt-24 pb-12">
      <Container>
        {/* Back Link */}
        <Link 
          href="/dashboard" 
          className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-900 mb-6"
        >
          <ChevronLeft size={20} />
          <span>Back to Dashboard</span>
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900">Personal details</h1>
          <p className="text-neutral-600 mt-2">Manage your personal information and contact details</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Photo */}
          <div className="lg:col-span-1">
            <Card className="p-6 text-center">
              <h3 className="text-lg font-semibold text-neutral-900 mb-6">Profile Photo</h3>
              <div className="flex justify-center mb-4">
                <AvatarUpload size="xl" />
              </div>
              <p className="text-sm text-neutral-500">
                Click on the photo to upload a new one
              </p>
              <p className="text-xs text-neutral-400 mt-2">
                JPG, PNG or GIF. Max 5MB.
              </p>
            </Card>

            {/* Member Info Card */}
            <Card className="mt-6 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                  <Shield className="text-accent" size={20} />
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Member since</p>
                  <p className="font-medium text-neutral-900">{user.memberSince}</p>
                </div>
              </div>
              <div className="pt-4 border-t border-neutral-200">
                <p className="text-sm text-neutral-500">Member level</p>
                <p className="font-semibold text-accent">{user.memberLevel}</p>
              </div>
            </Card>
          </div>

          {/* Right Column - Form */}
          <div className="lg:col-span-2">
            <Card>
              {/* Card Header */}
              <div className="p-6 border-b border-neutral-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-neutral-900">Basic Information</h2>
                    <p className="text-sm text-neutral-500 mt-1">Update your personal details</p>
                  </div>
                  {!isEditing ? (
                    <Button variant="outline" onClick={() => setIsEditing(true)}>
                      Edit
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="ghost" onClick={handleCancel}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleSave} 
                        isLoading={isLoading}
                      >
                        {isLoading ? 'Saving...' : <><Check size={18} /> Save</>}
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Success Message */}
              {showSuccess && (
                <div className="mx-6 mt-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
                  <Check size={18} />
                  <span>Your profile has been updated successfully!</span>
                </div>
              )}

              {/* Form Fields */}
              <div className="p-6 space-y-6">
                {/* Name Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      First Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => handleChange('firstName', e.target.value)}
                        disabled={!isEditing}
                        className={cn(
                          "w-full pl-10 pr-4 py-3 border rounded-lg transition-colors",
                          isEditing 
                            ? "border-neutral-300 focus:border-accent focus:ring-2 focus:ring-accent/20" 
                            : "border-neutral-200 bg-neutral-50 text-neutral-500"
                        )}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Last Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => handleChange('lastName', e.target.value)}
                        disabled={!isEditing}
                        className={cn(
                          "w-full pl-10 pr-4 py-3 border rounded-lg transition-colors",
                          isEditing 
                            ? "border-neutral-300 focus:border-accent focus:ring-2 focus:ring-accent/20" 
                            : "border-neutral-200 bg-neutral-50 text-neutral-500"
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                    <input
                      type="email"
                      value={formData.email}
                      disabled
                      className="w-full pl-10 pr-4 py-3 border border-neutral-200 bg-neutral-50 rounded-lg text-neutral-500"
                    />
                  </div>
                  <p className="text-xs text-neutral-500 mt-1 flex items-center gap-1">
                    <AlertCircle size={12} />
                    Email cannot be changed. Contact support if needed.
                  </p>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      disabled={!isEditing}
                      placeholder="+1 (XXX) XXX-XXXX"
                      className={cn(
                        "w-full pl-10 pr-4 py-3 border rounded-lg transition-colors",
                        isEditing 
                          ? "border-neutral-300 focus:border-accent focus:ring-2 focus:ring-accent/20" 
                          : "border-neutral-200 bg-neutral-50 text-neutral-500"
                      )}
                    />
                  </div>
                </div>

                {/* Date of Birth & Nationality */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Date of Birth
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                      <input
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                        disabled={!isEditing}
                        className={cn(
                          "w-full pl-10 pr-4 py-3 border rounded-lg transition-colors",
                          isEditing 
                            ? "border-neutral-300 focus:border-accent focus:ring-2 focus:ring-accent/20" 
                            : "border-neutral-200 bg-neutral-50 text-neutral-500"
                        )}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Nationality
                    </label>
                    <div className="relative">
                      <Flag className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                      <select
                        value={formData.nationality}
                        onChange={(e) => handleChange('nationality', e.target.value)}
                        disabled={!isEditing}
                        className={cn(
                          "w-full pl-10 pr-4 py-3 border rounded-lg transition-colors appearance-none bg-white",
                          isEditing 
                            ? "border-neutral-300 focus:border-accent focus:ring-2 focus:ring-accent/20" 
                            : "border-neutral-200 bg-neutral-50 text-neutral-500"
                        )}
                      >
                        <option value="">Select nationality</option>
                        {countries.map(country => (
                          <option key={country} value={country}>{country}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Emergency Contact Section */}
              <div className="border-t border-neutral-200">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-1">Emergency Contact</h3>
                  <p className="text-sm text-neutral-500 mb-6">
                    Someone we can contact in case of emergency
                  </p>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Contact Name
                        </label>
                        <input
                          type="text"
                          value={formData.emergencyContactName}
                          onChange={(e) => handleChange('emergencyContactName', e.target.value)}
                          disabled={!isEditing}
                          placeholder="Full name"
                          className={cn(
                            "w-full px-4 py-3 border rounded-lg transition-colors",
                            isEditing 
                              ? "border-neutral-300 focus:border-accent focus:ring-2 focus:ring-accent/20" 
                              : "border-neutral-200 bg-neutral-50 text-neutral-500"
                          )}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Relationship
                        </label>
                        <input
                          type="text"
                          value={formData.emergencyContactRelationship}
                          onChange={(e) => handleChange('emergencyContactRelationship', e.target.value)}
                          disabled={!isEditing}
                          placeholder="e.g., Spouse, Parent, Friend"
                          className={cn(
                            "w-full px-4 py-3 border rounded-lg transition-colors",
                            isEditing 
                              ? "border-neutral-300 focus:border-accent focus:ring-2 focus:ring-accent/20" 
                              : "border-neutral-200 bg-neutral-50 text-neutral-500"
                          )}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Contact Phone
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                        <input
                          type="tel"
                          value={formData.emergencyContactPhone}
                          onChange={(e) => handleChange('emergencyContactPhone', e.target.value)}
                          disabled={!isEditing}
                          placeholder="+1 (XXX) XXX-XXXX"
                          className={cn(
                            "w-full pl-10 pr-4 py-3 border rounded-lg transition-colors",
                            isEditing 
                              ? "border-neutral-300 focus:border-accent focus:ring-2 focus:ring-accent/20" 
                              : "border-neutral-200 bg-neutral-50 text-neutral-500"
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Container>
    </main>
  );
}
