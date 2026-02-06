import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "登录 - StayNeos",
  description: "登录您的 StayNeos 账号",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Image background */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1920&q=80")',
          }}
        />
        <div className="absolute inset-0 bg-primary/70" />
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
          <Link href="/" className="mb-6">
            <Image
              src="/logo.png"
              alt="StayNeos"
              width={200}
              height={70}
              className="h-16 w-auto object-contain"
              priority
            />
          </Link>
          <p className="text-lg text-white/90 text-center max-w-md leading-relaxed">
            探索精选的豪华公寓与度假屋，享受独一无二的住宿体验
          </p>
          
          <div className="mt-12 flex gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">2+</div>
              <div className="text-sm text-white/80">精选房源</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">100%</div>
              <div className="text-sm text-white/80">满意度</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">24/7</div>
              <div className="text-sm text-white/80">客服支持</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form area */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-8 lg:p-16 bg-neutral-50">
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
              欢迎回来
            </h1>
            <p className="text-neutral-600">
              登录您的账号以继续
            </p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-neutral-200">
            <LoginForm />
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-neutral-500">
              继续即表示您同意我们的{" "}
              <Link
                href="/terms"
                className="text-primary hover:text-accent transition-colors"
              >
                服务条款
              </Link>{" "}
              和{" "}
              <Link
                href="/privacy"
                className="text-primary hover:text-accent transition-colors"
              >
                隐私政策
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
