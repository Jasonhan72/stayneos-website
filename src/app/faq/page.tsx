import { Metadata } from 'next';
import FAQContent from './FAQContent';

export const metadata: Metadata = {
  title: 'FAQ - NEOS',
  description: 'Frequently asked questions about NEOS booking, payments, cancellations, and more.',
};

export const revalidate = 3600;

export default function FAQPage() {
  return <FAQContent />;
}
