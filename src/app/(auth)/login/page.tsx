import Link from "next/link";
import Image from "next/image";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Luxury apartment image background */}
      <div className="hidden lg:flex lg:w-[55%] relative">
        <Image
          src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1920&q=80"
          alt="Luxury apartment interior"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
        <div className="relative z-10 flex flex-col justify-between h-full p-12">
          {/* Logo */}
          <div>
            <Link href="/" className="inline-block">
              <Image
                src="/logo.png"
                alt="StayNeos"
                width={180}
                height={60}
                className="h-14 w-auto object-contain brightness-0 invert"
                priority
              />
            </Link>
          </div>

          {/* Content */}
          <div className="max-w-lg">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Find your perfect
              <br />
              home away from home
            </h1>
            <p className="text-lg text-white/90 leading-relaxed">
              Access premium furnished apartments in top cities worldwide. 
              Flexible stays, seamless booking, and exceptional service.
            </p>
          </div>

          {/* Stats */}
          <div className="flex gap-12">
            <div>
              <div className="text-3xl font-bold text-accent">500+</div>
              <div className="text-sm text-white/80">Premium Properties</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent">15+</div>
              <div className="text-sm text-white/80">Global Cities</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent">4.9</div>
              <div className="text-sm text-white/80">Guest Rating</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login form area */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center items-center p-6 sm:p-8 lg:p-16 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <Link href="/">
              <Image
                src="/logo.png"
                alt="StayNeos"
                width={150}
                height={50}
                className="h-12 w-auto object-contain"
                priority
              />
            </Link>
          </div>
          
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">
              Log in
            </h1>
            <p className="text-neutral-600">
              Welcome back to StayNeos
            </p>
          </div>

          <LoginForm />
        </div>
      </div>
    </div>
  );
}
