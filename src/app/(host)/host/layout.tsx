import HostSidebar from "@/components/host/HostSidebar";
import HostGuard from "@/components/host/HostGuard";

export const dynamic = "force-dynamic";

export default function HostLayout({ children }: { children: React.ReactNode }) {
  return (
    <HostGuard>
      <main className="min-h-screen bg-neutral-50">
        {/* HostSidebar renders mobile tabs (block, full-width) on small screens
            and a sticky sidebar (flex item) on md+.
            We must NOT wrap both in a flex row on mobile, otherwise the
            tab-bar div becomes a flex item and squeezes the section to 0 width. */}
        <div className="mx-auto w-full max-w-[1680px] px-4 sm:px-6 lg:px-8 xl:px-10 md:flex md:gap-5 lg:gap-6 md:py-6">
          <HostSidebar />
          <section className="min-w-0 flex-1 px-0 py-4 md:py-0">{children}</section>
        </div>
      </main>
    </HostGuard>
  );
}
