import HostSidebar from "@/components/host/HostSidebar";
import HostGuard from "@/components/host/HostGuard";

export const dynamic = "force-dynamic";

export default function HostLayout({ children }: { children: React.ReactNode }) {
  return (
    <HostGuard>
      <main className="min-h-screen bg-neutral-50">
        <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
          <HostSidebar />
          <section className="min-w-0 flex-1">{children}</section>
        </div>
      </main>
    </HostGuard>
  );
}
