import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Sign Up - StayNeos",
  description: "Create your StayNeos account and start your luxury living journey",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Brand image/video section */}
      <div className="hidden lg:flex lg:w-[55%] xl:w-1/2 relative overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center scale-105"
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=2000&q=80")',
          }}
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-primary/50" />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between h-full p-12 xl:p-16">
          {/* Logo */}
          <Link href="/" className="inline-block">
            <Image
              src="/logo.png"
              alt="StayNeos"
              width={180}
              height={60}
              className="h-12 w-auto object-contain brightness-0 invert"
              priority
            />
          </Link>
          
          {/* Brand Message */}
          <div className="max-w-md">
            <h1 className="text-4xl xl:text-5xl font-bold text-white mb-6 leading-tight">
              Luxury living,
              <br />
              <span className="text-accent">made simple.</span>
            </h1>
            <p className="text-lg text-white/80 leading-relaxed">
              Join thousands of professionals who have discovered the future of furnished rentals. 
              Fully-equipped apartments, flexible terms, seamless experience.
            </p>
            
            {/* Stats */}
            <div className="flex gap-8 mt-10">
              <div>
                <div className="text-3xl font-bold text-accent">15K+</div>
                <div className="text-sm text-white/70">Apartments</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-accent">50+</div>
                <div className="text-sm text-white/70">Cities</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-accent">30+</div>
                <div className="text-sm text-white/70">Countries</div>
              </div>
            </div>
          </div>
          
          {/* Testimonial */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 max-w-md">
            <p className="text-white/90 italic mb-4">
              &ldquo;StayNeos made my relocation effortless. I moved into a beautiful, fully-furnished apartment within days.&rdquo;
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent/30 flex items-center justify-center text-white font-semibold">
                SM
              </div>
              <div>
                <div className="text-white font-medium">Sarah Mitchell</div>
                <div className="text-sm text-white/60">Product Manager, Google</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form area */}
      <div className="w-full lg:w-[45%] xl:w-1/2 flex flex-col bg-white">
        {/* Mobile Logo */}
        <div className="lg:hidden p-6 border-b border-neutral-100">
          <Link href="/" className="inline-block">
            <Image
              src="/logo.png"
              alt="StayNeos"
              width={140}
              height={48}
              className="h-10 w-auto object-contain"
              priority
            />
          </Link>
        </div>
        
        {/* Form Container */}
        <div className="flex-1 flex flex-col justify-center px-6 sm:px-10 lg:px-12 xl:px-16 py-8 lg:py-12 overflow-y-auto">
          <div className="w-full max-w-md mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">
                Create your account
              </h2>
              <p className="text-neutral-500">
                Start your journey to seamless living
              </p>
            </div>

            {/* Register Form */}
            <RegisterForm />
          </div>
        </div>
        
        {/* Footer */}
        <div className="px-6 sm:px-10 lg:px-12 xl:px-16 py-4 border-t border-neutral-100">
          <p className="text-xs text-neutral-400 text-center">
            © {new Date().getFullYear()} StayNeos. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
