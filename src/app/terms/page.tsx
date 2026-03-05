import { Metadata } from 'next';
import TermsContent from './TermsContent';

export const metadata: Metadata = {
  title: 'Terms of Service - StayNeos',
  description: 'Please read these Terms of Service carefully before using StayNeos website and services.',
};

export default function TermsPage() {
  return <TermsContent />;
}
