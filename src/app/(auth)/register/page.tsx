import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "注册 - StayNeos",
  description: "创建您的 StayNeos 账号",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Image background */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1920&q=80")',
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
            加入我们，开启您的奢华度假之旅
          </p>
          
          <div className="mt-12 w-full max-w-sm">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-primary font-bold text-xl">
                  新
                </div>
                <div>
                  <div className="font-semibold">新用户专享</div>
                  <div className="text-sm text-white/80">首次预订享9折优惠</div>
                </div>
              </div>
              <p className="text-sm text-white/70">
                注册即可获得新人礼包，包含首单折扣和优先预订特权
              </p>
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
              创建账号
            </h1>
            <p className="text-neutral-600">
              填写以下信息开始您的旅程
            </p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-neutral-200">
            <RegisterForm />
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-neutral-500">
              注册即表示您同意我们的{" "}
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
