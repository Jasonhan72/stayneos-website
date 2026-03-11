import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { RegisterForm } from '@/components/auth/RegisterForm';

export const metadata: Metadata = {
  title: 'Sign Up - StayNeos',
  description: 'Create your StayNeos account and start your luxury living journey',
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-[55%] xl:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center scale-105" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=2000&q=80")' }} />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-primary/50" />
        <div className="relative z-10 flex flex-col justify-between h-full p-12 xl:p-16">
          <Link href="/" className="inline-block">
            <Image src="/logo.png" alt="StayNeos" width={180} height={60} className="h-12 w-auto object-contain brightness-0 invert" priority />
          </Link>
        </div>
      </div>

      <div className="w-full lg:w-[45%] xl:w-1/2 flex flex-col bg-white">
        <div className="lg:hidden p-6 border-b border-neutral-100">
          <Link href="/" className="inline-block"><Image src="/logo.png" alt="StayNeos" width={140} height={48} className="h-10 w-auto object-contain" priority /></Link>
        </div>
        <div className="flex-1 flex flex-col justify-center px-6 sm:px-10 lg:px-12 xl:px-16 py-8 lg:py-12 overflow-y-auto">
          <div className="w-full max-w-md mx-auto">
            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">Create Account</h2>
              <p className="text-neutral-500">Join thousands who found their perfect home</p>
            </div>
            <RegisterForm />
          </div>
        </div>
      </div>
    </div>
  );
}
