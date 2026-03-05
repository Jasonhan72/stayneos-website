import { PropertyFormClient } from "./PropertyFormClient";
import { mockProperties } from '@/lib/data';

// 静态导出需要的参数生成 - ID 必须与 mockProperties 中的 id 匹配
export function generateStaticParams() {
  return mockProperties.map(p => ({ id: p.id }));
}

export default function EditPropertyPage({ params }: { params: { id: string } }) {
  return <PropertyFormClient propertyId={params.id} />;
}
