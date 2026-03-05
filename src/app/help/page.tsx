import { Metadata } from 'next';
import HelpContent from './HelpContent';

export const metadata: Metadata = {
  title: 'Help Center - StayNeos',
  description: 'Find answers to common questions about booking, payments, check-in, and more.',
};

export default function HelpPage() {
  return <HelpContent />;
}
