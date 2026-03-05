import { Metadata } from 'next';
import LoginContent from './LoginContent';

export const metadata: Metadata = {
  title: 'Log In - StayNeos',
  description: 'Log in to your StayNeos account to manage bookings and access premium furnished apartments.',
};

export default function LoginPage() {
  return <LoginContent />;
}
