'use client';

import { useSearchParams } from 'next/navigation';
import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginFormClient() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get('callbackUrl') || searchParams?.get('callback') || searchParams?.get('redirect') || '/';
  return <LoginForm callbackUrl={callbackUrl} />;
}
