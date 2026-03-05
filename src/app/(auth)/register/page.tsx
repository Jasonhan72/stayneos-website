import { Metadata } from 'next';
import RegisterContent from './RegisterContent';

export const metadata: Metadata = {
  title: 'Sign Up - StayNeos',
  description: 'Create your StayNeos account and start your luxury living journey',
};

export default function RegisterPage() {
  return <RegisterContent />;
}
