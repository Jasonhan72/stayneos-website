import WizardShell from "@/components/host/listings/wizard/WizardShell";

export const dynamic = "force-dynamic";

export default function NewListingWizardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <WizardShell>{children}</WizardShell>;
}
