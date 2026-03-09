import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import RegisterFormClient from './RegisterFormClient';

export const metadata: Metadata = {
  title: 'Sign Up - StayNeos',
  description: 'Create your StayNeos account and start your luxury living journey',
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Hero section */}
      <div className="hidden lg:flex lg:w-[55%] xl:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center scale-105" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=2000&q=80")' }} />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-primary/50" />
        <div className="relative z-10 flex flex-col justify-between h-full p-12 xl:p-16">
          <Link href="/" className="inline-block">
            <Image src="/logo.png" alt="StayNeos" width={180} height={60} className="h-12 w-auto object-contain brightness-0 invert" priority />
          </Link>
          <div className="max-w-md">
            <h1 className="text-4xl xl:text-5xl font-bold text-white mb-6 leading-tight">
              Welcome to Your<br /><span className="text-accent">New Home</span>
            </h1>
            <p className="text-lg text-white/80 leading-relaxed">Premium furnished apartments in the world&apos;s best neighborhoods</p>
            <div className="flex gap-8 mt-10">
              <div><div className="text-3xl font-bold text-accent">15K+</div><div className="text-sm text-white/70">Apartments</div></div>
              <div><div className="text-3xl font-bold text-accent">50+</div><div className="text-sm text-white/70">Cities</div></div>
              <div><div className="text-3xl font-bold text-accent">98%</div><div className="text-sm text-white/70">Satisfaction</div></div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 max-w-md">
            <p className="text-white/90 italic mb-4">&ldquo;StayNeos made my relocation effortless. I moved into a beautiful, fully-furnished apartment within days.&rdquo;</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent/30 flex items-center justify-center text-white font-semibold">SM</div>
              <div><div className="text-white font-medium">Sarah Mitchell</div><div className="text-sm text-white/60">Product Manager, Google</div></div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form section */}
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

            {/* Server-rendered form - Raw HTML to bypass React serialization */}
            <div
              dangerouslySetInnerHTML={{
                __html: `
                  <form class="space-y-6" method="POST" action="/api/auth/register">
                    <!-- Social Login Buttons - Static HTML -->
                    <div class="space-y-3">
                      <button
                        type="button"
                        class="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                      >
                        <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Continue with Google
                      </button>
                      <button
                        type="button"
                        disabled
                        class="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-500 bg-gray-100 cursor-not-allowed transition-colors"
                      >
                        <svg class="w-5 h-5 mr-2" fill="#1877F2" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                        Continue with Facebook (Coming Soon)
                      </button>
                    </div>

                    <div class="relative">
                      <div class="absolute inset-0 flex items-center">
                        <div class="w-full border-t border-gray-300"></div>
                      </div>
                      <div class="relative flex justify-center text-sm">
                        <span class="px-2 bg-white text-gray-500">Or register with email</span>
                      </div>
                    </div>

                    <!-- All form inputs - CRITICAL for SSR -->
                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <label for="firstName" class="block text-sm font-medium text-gray-700 mb-2">
                          First Name
                        </label>
                        <input
                          id="firstName"
                          name="firstName"
                          type="text"
                          placeholder="John"
                          required
                          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label for="lastName" class="block text-sm font-medium text-gray-700 mb-2">
                          Last Name
                        </label>
                        <input
                          id="lastName"
                          name="lastName"
                          type="text"
                          placeholder="Doe"
                          required
                          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="john@example.com"
                        required
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
                        Password
                      </label>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="At least 6 characters"
                        required
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-2">
                        Confirm Password
                      </label>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        placeholder="Confirm your password"
                        required
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <!-- Submit Button -->
                    <button
                      type="submit"
                      class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      Create Account
                    </button>

                    <!-- Login Link -->
                    <div class="text-center">
                      <p class="text-sm text-gray-600">
                        Already have an account?
                        <a href="/login" class="font-medium text-blue-600 hover:text-blue-500">Sign in</a>
                      </p>
                    </div>
                  </form>
                `,
              }}
            />

            {/* Client-side enhancement - only adds interactivity */}
            <RegisterFormClient />
          </div>
        </div>
        <div className="px-6 sm:px-10 lg:px-12 xl:px-16 py-4 border-t border-neutral-100">
          <p className="text-xs text-neutral-400 text-center">&copy; {new Date().getFullYear()} StayNeos. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}