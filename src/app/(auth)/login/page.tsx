import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { LoginForm } from '@/components/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Log In - NEOS',
  description: 'Log in to your NEOS account to manage bookings and access premium furnished apartments.',
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ callbackUrl?: string; callback?: string; redirect?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const callbackUrl = resolvedSearchParams?.redirect || resolvedSearchParams?.callbackUrl || resolvedSearchParams?.callback || '/';

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-[55%] relative">
        <Image src="/images/cooper-55-e98a880d.jpg" alt="Toronto skyline view from a NEOS property" fill className="object-cover" priority={true} />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
        <div className="relative z-10 flex flex-col justify-between h-full p-12">
          <div>
            <Link href="/" className="inline-block">
              <Image src="/logo.png" alt="NEOS" width={180} height={60} className="h-14 w-auto object-contain brightness-0 invert" priority={true} />
            </Link>
          </div>
          <div className="max-w-lg">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">Welcome Back to<br />Your Home Away From Home</h1>
            <p className="text-lg text-white/90 leading-relaxed">Access your account and manage your luxury living experience</p>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-[45%] flex flex-col justify-center items-center p-6 sm:p-8 lg:p-16 bg-white">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex justify-center mb-8">
            <Link href="/">
              <Image src="/logo.png" alt="NEOS" width={150} height={50} className="h-12 w-auto object-contain" priority={true} />
            </Link>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">Welcome Back</h1>
            <p className="text-neutral-600">Sign in to access your account</p>
          </div>

          <LoginForm callbackUrl={callbackUrl} />
        </div>
      </div>
    </div>
  );
}
