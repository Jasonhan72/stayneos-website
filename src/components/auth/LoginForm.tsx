"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, AlertCircle } from "lucide-react";
import Button from "@/components/ui/Button";

interface LoginFormProps {
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");

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
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "登录失败");
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "登录失败，请重试");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
      {/* 服务器错误提示 */}
      {serverError && (
        <div className="p-4 bg-error-50 border border-error-200 rounded-lg flex items-start gap-3 animate-fade-in">
          <AlertCircle className="w-5 h-5 text-error shrink-0 mt-0.5" />
          <span className="text-sm text-error-800">{serverError}</span>
        </div>
      )}

      {/* 邮箱输入 */}
      <div className="form-group">
        <label htmlFor="email" className="form-label">
          邮箱地址
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
            className={`form-input !pl-12 ${errors.email ? "error" : ""}`}
            placeholder="请输入您的邮箱"
            disabled={isLoading}
          />
        </div>
        {errors.email && (
          <p className="form-error">{errors.email}</p>
        )}
      </div>

      {/* 密码输入 */}
      <div className="form-group">
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="password" className="form-label mb-0">
            密码
          </label>
          <Link
            href="/forgot-password"
            className="text-sm text-primary hover:text-accent transition-colors"
          >
            忘记密码？
          </Link>
        </div>
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
            className={`form-input !pl-12 !pr-12 ${errors.password ? "error" : ""}`}
            placeholder="请输入您的密码"
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
          <p className="form-error">{errors.password}</p>
        )}
      </div>

      {/* 提交按钮 */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        isLoading={isLoading}
      >
        {isLoading ? "登录中..." : "登录"}
      </Button>

      {/* 注册链接 */}
      <div className="text-center pt-2">
        <p className="text-sm text-neutral-600">
          还没有账号？{" "}
          <Link
            href="/register"
            className="text-primary font-semibold hover:text-accent transition-colors"
          >
            立即注册
          </Link>
        </p>
      </div>
    </form>
  );
}
