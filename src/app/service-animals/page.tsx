import { Metadata } from 'next';
import ServiceAnimalsContent from './ServiceAnimalsContent';

export const metadata: Metadata = {
  title: 'Service Animals Policy | NEOS',
  description: 'NEOS policy on service animals and assistance animals.',
};

export default function ServiceAnimalsPage() {
  return <ServiceAnimalsContent />;
}
