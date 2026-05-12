import { Metadata } from 'next';
import TermsContent from './TermsContent';

export const metadata: Metadata = {
  title: 'Terms of Service - NEOS',
  description: 'Please read these Terms of Service carefully before using NEOS website and services.',
};

export default function TermsPage() {
  return <TermsContent />;
}
