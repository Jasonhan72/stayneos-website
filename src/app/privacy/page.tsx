import { Metadata } from 'next';
import PrivacyContent from './PrivacyContent';

export const metadata: Metadata = {
  title: 'Privacy Policy - StayNeos',
  description: 'Learn how StayNeos collects, uses, and protects your personal information.',
};

export default function PrivacyPage() {
  return <PrivacyContent />;
}
