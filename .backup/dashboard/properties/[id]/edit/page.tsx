import { PropertyFormClient } from "./PropertyFormClient";

export const dynamic = "force-dynamic";

export default function EditPropertyPage({ params }: { params: { id: string } }) {
  return <PropertyFormClient propertyId={params.id} />;
}
