"use client";

import { usePathname } from "next/navigation";
import AccountSidebar from "@/components/account/AccountSidebar";
import AccountErrorBoundary from "@/components/account/AccountErrorBoundary";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // On the root /account listing page, render without sidebar
  // On sub-pages (personal-info, security, etc.), show sidebar + padding
  const isRootPage = pathname === "/account";

  if (isRootPage) {
    return <main className="min-h-screen bg-white"><AccountErrorBoundary>{children}</AccountErrorBoundary></main>;
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
            Account settings
          </h1>
        </header>
        <div className="flex gap-10">
          <AccountSidebar />
          <AccountErrorBoundary>
            <section className="min-w-0 flex-1">{children}</section>
          </AccountErrorBoundary>
        </div>
      </div>
    </main>
  );
}
