import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { RegisterForm } from '@/components/auth/RegisterForm';

export const metadata: Metadata = {
  title: 'Sign Up - NEOS',
  description: 'Create your NEOS account and start your luxury living journey',
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-[55%] xl:w-1/2 relative min-h-screen overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center scale-105" style={{ backgroundImage: 'url("/images/cooper-55-e98a880d.jpg")' }} />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-primary/50" />
        <div className="absolute inset-0 z-10 flex flex-col justify-end p-12 xl:p-16">
          <div className="max-w-lg">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">Your Premium<br />Living Starts Here</h1>
            <p className="text-lg text-white/90 leading-relaxed">Create your account and explore luxury furnished apartments in prime locations</p>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-[45%] xl:w-1/2 flex flex-col bg-white">
        <div className="lg:hidden p-6 border-b border-neutral-100">
          <Link href="/" className="inline-block"><Image src="/logo.png" alt="NEOS" width={140} height={48} className="h-10 w-auto object-contain" priority={true} /></Link>
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
