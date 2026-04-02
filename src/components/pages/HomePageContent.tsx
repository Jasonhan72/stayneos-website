'use client';

import { useTranslations } from 'next-intl';

export default function HomePageContent() {
  const t = useTranslations('home');
  
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-8">
          {t('title')}
        </h1>
        <p className="text-xl text-gray-600 text-center max-w-2xl mx-auto">
          {t('description')}
        </p>
        
        {/* 这里可以添加更多主页内容 */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold mb-4">Premium Properties</h3>
            <p className="text-gray-600">
              Curated selection of executive apartments in prime Toronto locations.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold mb-4">Flexible Leases</h3>
            <p className="text-gray-600">
              Short-term and long-term options tailored for business professionals.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold mb-4">24/7 Concierge</h3>
            <p className="text-gray-600">
              Dedicated support for all your accommodation needs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}