import { HostPropertyFormClient } from "@/components/host/listings/HostPropertyFormClient";

export const dynamic = "force-dynamic";

export default function HostEditPropertyPage({ params }: { params: { id: string } }) {
  return <HostPropertyFormClient propertyId={params.id} />;
}
