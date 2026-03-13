import { Metadata } from 'next';
import CancellationContent from './CancellationContent';

export const metadata: Metadata = {
  title: 'Cancellation Policy | NEOS',
  description: 'NEOS cancellation and refund policy for apartment bookings.',
};

export default function CancellationPolicyPage() {
  return <CancellationContent />;
}
