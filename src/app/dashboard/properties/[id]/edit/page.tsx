import { PropertyFormClient } from "./PropertyFormClient";

// 静态导出需要的参数生成
export function generateStaticParams() {
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
  ];
}

export default function EditPropertyPage({ params }: { params: { id: string } }) {
  return <PropertyFormClient propertyId={params.id} />;
}
