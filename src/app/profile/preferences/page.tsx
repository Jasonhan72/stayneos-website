'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useUser } from '@/lib/context/UserContext';
import Button from '@/components/ui/Button';
import { Card, Container } from '@/components/ui';
import { 
  ChevronLeft,
  Mail,
  MessageSquare,
  Megaphone,
  Globe,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Language options
const languages = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
];

// Currency options
const currencies = [
  { code: 'CAD', label: 'Canadian Dollar', symbol: '$' },
  { code: 'USD', label: 'US Dollar', symbol: '$' },
  { code: 'EUR', label: 'Euro', symbol: '€' },
  { code: 'CNY', label: 'Chinese Yuan', symbol: '¥' },
];

export default function PreferencesPage() {
  const { user, updatePreferences, isLoading } = useUser();
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [preferences, setPreferences] = useState({
    language: user?.preferences.language || 'en',
    currency: user?.preferences.currency || 'CAD',
    notifications: {
      email: user?.preferences.notifications.email ?? true,
      sms: user?.preferences.notifications.sms ?? true,
      marketing: user?.preferences.notifications.marketing ?? false,
    },
  });

  const handleNotificationChange = (key: 'email' | 'sms' | 'marketing') => {
    setPreferences(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key],
      },
    }));
  };

  const handleSave = async () => {
    await updatePreferences(preferences);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const hasChanges = 
    preferences.language !== user?.preferences.language ||
    preferences.currency !== user?.preferences.currency ||
    preferences.notifications.email !== user?.preferences.notifications.email ||
    preferences.notifications.sms !== user?.preferences.notifications.sms ||
    preferences.notifications.marketing !== user?.preferences.notifications.marketing;

  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-50 pt-24 pb-12">
        <Container>
          <div className="text-center">
            <p className="text-neutral-600">Please log in to view your preferences.</p>
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
          href="/profile" 
          className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-900 mb-6"
        >
          <ChevronLeft size={20} />
          <span>Back to Profile</span>
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900">Preferences</h1>
          <p className="text-neutral-600 mt-2">Manage your communication preferences, language, and currency settings</p>
        </div>

        <div className="max-w-2xl">
          {/* Communication Preferences */}
          <Card className="mb-6">
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Mail className="text-blue-600" size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-neutral-900">Communication preferences</h2>
                  <p className="text-sm text-neutral-500">Choose how you want to hear from us</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Email Notifications */}
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <Mail className="text-neutral-400" size={20} />
                  <div>
                    <p className="font-medium text-neutral-900">Email notifications</p>
                    <p className="text-sm text-neutral-500">Receive booking confirmations and updates</p>
                  </div>
                </div>
                <button
                  onClick={() => handleNotificationChange('email')}
                  className={cn(
                    "relative w-12 h-6 rounded-full transition-colors",
                    preferences.notifications.email ? "bg-accent" : "bg-neutral-300"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-1 w-4 h-4 bg-white rounded-full transition-transform",
                      preferences.notifications.email ? "left-7" : "left-1"
                    )}
                  />
                </button>
              </div>

              {/* SMS Notifications */}
              <div className="flex items-center justify-between py-3 border-t border-neutral-100">
                <div className="flex items-center gap-3">
                  <MessageSquare className="text-neutral-400" size={20} />
                  <div>
                    <p className="font-medium text-neutral-900">SMS notifications</p>
                    <p className="text-sm text-neutral-500">Get text messages for important updates</p>
                  </div>
                </div>
                <button
                  onClick={() => handleNotificationChange('sms')}
                  className={cn(
                    "relative w-12 h-6 rounded-full transition-colors",
                    preferences.notifications.sms ? "bg-accent" : "bg-neutral-300"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-1 w-4 h-4 bg-white rounded-full transition-transform",
                      preferences.notifications.sms ? "left-7" : "left-1"
                    )}
                  />
                </button>
              </div>

              {/* Marketing Emails */}
              <div className="flex items-center justify-between py-3 border-t border-neutral-100">
                <div className="flex items-center gap-3">
                  <Megaphone className="text-neutral-400" size={20} />
                  <div>
                    <p className="font-medium text-neutral-900">Marketing emails</p>
                    <p className="text-sm text-neutral-500">Receive offers, discounts, and news</p>
                  </div>
                </div>
                <button
                  onClick={() => handleNotificationChange('marketing')}
                  className={cn(
                    "relative w-12 h-6 rounded-full transition-colors",
                    preferences.notifications.marketing ? "bg-accent" : "bg-neutral-300"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-1 w-4 h-4 bg-white rounded-full transition-transform",
                      preferences.notifications.marketing ? "left-7" : "left-1"
                    )}
                  />
                </button>
              </div>
            </div>
          </Card>

          {/* Language & Currency */}
          <Card className="mb-6">
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Globe className="text-green-600" size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-neutral-900">Language & Currency</h2>
                  <p className="text-sm text-neutral-500">Set your preferred language and currency</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Language Selection */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-3">
                  Language
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setPreferences(prev => ({ ...prev, language: lang.code as 'en' | 'zh' | 'fr' }))}
                      className={cn(
                        "flex items-center gap-2 p-3 rounded-lg border transition-all",
                        preferences.language === lang.code
                          ? "border-accent bg-accent/5"
                          : "border-neutral-200 hover:border-neutral-300"
                      )}
                    >
                      <span className="text-2xl">{lang.flag}</span>
                      <span className={cn(
                        "font-medium",
                        preferences.language === lang.code ? "text-accent" : "text-neutral-700"
                      )}>
                        {lang.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Currency Selection */}
              <div className="pt-4 border-t border-neutral-100">
                <label className="block text-sm font-medium text-neutral-700 mb-3">
                  Currency
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {currencies.map((curr) => (
                    <button
                      key={curr.code}
                      onClick={() => setPreferences(prev => ({ ...prev, currency: curr.code as 'CAD' | 'USD' | 'EUR' | 'CNY' }))}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border transition-all",
                        preferences.currency === curr.code
                          ? "border-accent bg-accent/5"
                          : "border-neutral-200 hover:border-neutral-300"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center font-bold",
                        preferences.currency === curr.code ? "bg-accent text-primary" : "bg-neutral-100 text-neutral-600"
                      )}>
                        {curr.symbol}
                      </div>
                      <div className="text-left">
                        <p className={cn(
                          "font-medium",
                          preferences.currency === curr.code ? "text-accent" : "text-neutral-700"
                        )}>
                          {curr.code}
                        </p>
                        <p className="text-xs text-neutral-500">{curr.label}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Save Button */}
          {showSuccess && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
              <Check size={18} />
              <span>Your preferences have been saved!</span>
            </div>
          )}

          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              isLoading={isLoading}
              disabled={!hasChanges}
            >
              {!isLoading && <Check size={18} />} Save Changes
            </Button>
          </div>
        </div>
      </Container>
    </main>
  );
}
