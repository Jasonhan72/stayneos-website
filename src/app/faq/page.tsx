import { Metadata } from 'next';
import FAQContent from './FAQContent';

export const metadata: Metadata = {
  title: 'FAQ - NEOS',
  description: 'Frequently asked questions about NEOS booking, payments, cancellations, and more.',
};

export default function FAQPage() {
  return <FAQContent />;
}
