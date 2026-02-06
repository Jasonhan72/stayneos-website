"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("请输入有效的邮箱地址");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "请求失败");
      }

      setIsSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "发送失败，请重试");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Image background */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1920&q=80")',
          }}
        />
        <div className="absolute inset-0 bg-[#003B5C]/60" />
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
          <Link href="/" className="mb-4">
            <Image
              src="/logo.png"
              alt="StayNeos"
              width={200}
              height={70}
              className="h-16 w-auto object-contain"
            />
          </Link>
          <p className="text-lg text-white/80 text-center max-w-md">
            我们帮助您找回账号访问权限
          </p>
        </div>
      </div>

      {/* Right side - Form area */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 lg:p-16 bg-white">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              忘记密码？
            </h1>
            <p className="text-gray-600">
              输入您的邮箱地址，我们将发送重置密码链接
            </p>
          </div>

          {isSubmitted ? (
            <div className="text-center">
              <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700">
                <svg
                  className="w-12 h-12 mx-auto mb-3 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <p className="font-medium">重置链接已发送！</p>
                <p className="text-sm mt-2">
                  请检查您的邮箱 {email}，按照邮件中的说明重置密码。
                </p>
              </div>
              <Link
                href="/login"
                className="inline-block py-3 px-6 bg-[#003B5C] text-white font-medium hover:bg-[#002a42] transition-colors"
              >
                返回登录
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="w-full">
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div className="mb-6">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  邮箱地址
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 focus:border-[#003B5C] focus:outline-none transition-colors"
                  placeholder="请输入您的注册邮箱"
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-[#003B5C] text-white font-medium hover:bg-[#002a42] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "发送中..." : "发送重置链接"}
              </button>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  记起密码了？{" "}
                  <Link
                    href="/login"
                    className="text-[#003B5C] font-medium hover:underline"
                  >
                    返回登录
                  </Link>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
