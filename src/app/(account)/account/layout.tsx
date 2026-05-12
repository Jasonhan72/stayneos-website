import type { Metadata } from "next";
import AccountErrorBoundary from "@/components/account/AccountErrorBoundary";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Account settings · NEOS",
  description: "Manage your NEOS account settings.",
  alternates: { canonical: "/account" },
};

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-white">
      <AccountErrorBoundary>{children}</AccountErrorBoundary>
    </main>
  );
}
