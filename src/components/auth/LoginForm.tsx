"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, AlertCircle, ChevronDown, ChevronUp, MessageCircle, Phone, FileText, Shield } from "lucide-react";

interface LoginFormProps {
  callbackUrl?: string;
}

const TOKEN_KEY = "stayneos_auth_token";
const USER_KEY = "stayneos_user_data";

export function LoginForm({ callbackUrl = "/" }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [showSupport, setShowSupport] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!email.trim()) {
      newErrors.email = "请输入邮箱地址";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "请输入有效的邮箱地址";
    }

    if (!password) {
      newErrors.password = "请输入密码";
    } else if (password.length < 6) {
      newErrors.password = "密码至少需要6位字符";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Call Cloudflare Function API directly
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setServerError(data.message || "邮箱或密码错误");
        setIsLoading(false);
        return;
      }

      // Save to localStorage
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));

      // Dispatch storage event to notify other components
      window.dispatchEvent(new StorageEvent("storage", {
        key: USER_KEY,
        newValue: JSON.stringify(data.user),
      }));
      
      // Dispatch custom event for immediate update
      window.dispatchEvent(new CustomEvent("localStorageChange"));

      // Redirect
      router.push(callbackUrl);
      router.refresh();
    } catch {
      setServerError("登录失败，请重试");
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setIsLoading(true);
    // TODO: Implement Google OAuth
    window.location.href = "/api/auth/oauth/google";
  };

  const handleFacebookLogin = () => {
    setIsLoading(true);
    // TODO: Implement Facebook OAuth
    window.location.href = "/api/auth/oauth/facebook";
  };

  return (
    <div className="w-full space-y-6">
      {/* 第三方登录按钮 */}
      <div className="space-y-3">
        {/* Google 登录按钮 */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#4285F4] text-white font-medium rounded-lg hover:bg-[#357ABD] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        {/* Facebook 登录按钮 */}
        <button
          type="button"
          onClick={handleFacebookLogin}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#1877F2] text-white font-medium rounded-lg hover:bg-[#166fe5] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          Continue with Facebook
        </button>
      </div>

      {/* 分隔线 */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-neutral-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-neutral-500">or</span>
        </div>
      </div>

      {/* 服务器错误提示 */}
      {serverError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 animate-fade-in">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <span className="text-sm text-red-800">{serverError}</span>
        </div>
      )}

      {/* 邮箱登录表单 */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* 邮箱输入 */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
            Email
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
              <Mail className="w-5 h-5" />
            </div>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
              }}
              className={`w-full pl-12 pr-4 py-3 border rounded-lg text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 ${
                errors.email 
                  ? "border-red-500 focus:border-red-500" 
                  : "border-neutral-300 focus:border-primary"
              }`}
              placeholder="your@email.com"
              disabled={isLoading}
            />
          </div>
          {errors.email && (
            <p className="mt-1.5 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        {/* 密码输入 */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
            Password
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
              <Lock className="w-5 h-5" />
            </div>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
              }}
              className={`w-full pl-12 pr-12 py-3 border rounded-lg text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 ${
                errors.password 
                  ? "border-red-500 focus:border-red-500" 
                  : "border-neutral-300 focus:border-primary"
              }`}
              placeholder="Enter your password"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
              aria-label={showPassword ? "隐藏密码" : "显示密码"}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1.5 text-sm text-red-600">{errors.password}</p>
          )}
        </div>

        {/* 登录按钮 */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 px-6 bg-primary text-white font-semibold rounded-full hover:bg-primary-700 active:bg-primary-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              Logging in...
            </span>
          ) : (
            "Log in"
          )}
        </button>
      </form>

      {/* 忘记密码链接 */}
      <div className="text-center">
        <Link
          href="/forgot-password"
          className="text-sm text-primary hover:text-accent font-medium transition-colors"
        >
          Forgot your password?
        </Link>
      </div>

      {/* 注册引导 */}
      <div className="text-center pt-2">
        <p className="text-sm text-neutral-600">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="text-primary font-semibold hover:text-accent transition-colors"
          >
            Sign up
          </Link>
        </p>
      </div>

      {/* 支持和资源 - 折叠区域 */}
      <div className="pt-4 border-t border-neutral-200">
        <button
          type="button"
          onClick={() => setShowSupport(!showSupport)}
          className="w-full flex items-center justify-between py-2 text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
        >
          <span className="font-medium">Support & other resources</span>
          {showSupport ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
        
        {showSupport && (
          <div className="mt-3 space-y-2 animate-slide-down">
            <a
              href="https://wa.me/1234567890"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-2.5 text-sm text-neutral-600 hover:text-primary hover:bg-neutral-50 rounded-lg transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp Support
            </a>
            <a
              href="tel:+1234567890"
              className="flex items-center gap-3 px-3 py-2.5 text-sm text-neutral-600 hover:text-primary hover:bg-neutral-50 rounded-lg transition-colors"
            >
              <Phone className="w-4 h-4" />
              Call us
            </a>
            <Link
              href="/faq"
              className="flex items-center gap-3 px-3 py-2.5 text-sm text-neutral-600 hover:text-primary hover:bg-neutral-50 rounded-lg transition-colors"
            >
              <FileText className="w-4 h-4" />
              FAQ
            </Link>
            <Link
              href="/privacy"
              className="flex items-center gap-3 px-3 py-2.5 text-sm text-neutral-600 hover:text-primary hover:bg-neutral-50 rounded-lg transition-colors"
            >
              <Shield className="w-4 h-4" />
              Privacy Policy
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}