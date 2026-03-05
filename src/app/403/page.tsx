import { Metadata } from 'next';
import ForbiddenContent from './ForbiddenContent';

export const metadata: Metadata = {
  title: '403 - Access Forbidden | StayNeos',
  description: 'You do not have permission to access this page.',
};

export default function ForbiddenPage() {
  return <ForbiddenContent />;
}
