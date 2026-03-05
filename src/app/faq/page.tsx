import { Metadata } from 'next';
import FAQContent from './FAQContent';

export const metadata: Metadata = {
  title: 'FAQ - StayNeos',
  description: 'Frequently asked questions about StayNeos booking, payments, cancellations, and more.',
};

export default function FAQPage() {
  return <FAQContent />;
}
