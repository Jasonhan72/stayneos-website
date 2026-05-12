"use client";

import { PropertiesList } from "@/components/property/PropertiesList";
import { useI18n } from "@/lib/i18n";

export default function HostListingsPage() {
  const { t } = useI18n();
  return (
    <main className="min-h-screen bg-neutral-50 pb-12">
      <div className="mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t("dashboard.propertyManagement", "Property Management")}</h1>
          <p className="mt-2 text-gray-600">{t("dashboard.propertyManagementDesc", "Manage all your properties, add new listings or edit existing ones")}</p>
        </div>
        <PropertiesList />
      </div>
    </main>
  );
}
