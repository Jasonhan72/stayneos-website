import { Metadata } from 'next';
import PrivacyContent from './PrivacyContent';

export const metadata: Metadata = {
  title: 'Privacy Policy - NEOS',
  description: 'Learn how NEOS collects, uses, and protects your personal information.',
};

export default function PrivacyPage() {
  return <PrivacyContent />;
}
