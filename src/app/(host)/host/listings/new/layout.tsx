import WizardShell from "@/components/host/listings/wizard/WizardShell";
import HostGuard from "@/components/host/HostGuard";

export const dynamic = "force-dynamic";

export default function NewListingWizardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <HostGuard>
      <WizardShell>{children}</WizardShell>
    </HostGuard>
  );
}
