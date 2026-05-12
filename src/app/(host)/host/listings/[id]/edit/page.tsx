import { HostPropertyFormClient } from "@/components/host/listings/HostPropertyFormClient";

export const dynamic = "force-dynamic";

export default async function HostEditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <HostPropertyFormClient propertyId={id} />;
}
