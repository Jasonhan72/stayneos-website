export const dynamic = 'force-dynamic';
import AdminLayout from '@/components/admin/AdminLayout';
import PropertyEditor from '@/components/admin/PropertyEditor';

export default function NewPropertyPage() {
  return (
    <AdminLayout title="新建物业">
      <PropertyEditor />
    </AdminLayout>
  );
}
