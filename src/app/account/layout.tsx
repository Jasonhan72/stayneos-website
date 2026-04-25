import type { Metadata } from "next";
import AccountSidebar from "@/components/account/AccountSidebar";
import AccountErrorBoundary from "@/components/account/AccountErrorBoundary";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Account settings · NEOS",
  description: "Manage your NEOS account, personal info, security and preferences.",
  alternates: { canonical: "/account" },
};

export default function AccountLayout({ children }: { children: React.ReactNode }) {
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
