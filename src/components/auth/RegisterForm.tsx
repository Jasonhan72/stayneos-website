"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, User, AlertCircle } from "lucide-react";
import Button from "@/components/ui/Button";

interface RegisterFormProps {
  onSuccess?: () => void;
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const validateForm = (field?: string) => {
    const newErrors: Record<string, string> = {};

    if (!field || field === "name") {
      if (!name.trim()) {
        newErrors.name = "请输入姓名";
      } else if (name.trim().length < 2) {
        newErrors.name = "姓名至少需要2个字符";
      }
    }

    if (!field || field === "email") {
      if (!email.trim()) {
        newErrors.email = "请输入邮箱地址";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        newErrors.email = "请输入有效的邮箱地址";
      }
    }

    if (!field || field === "password") {
      if (!password) {
        newErrors.password = "请输入密码";
      } else if (password.length < 6) {
        newErrors.password = "密码至少需要6位字符";
      } else if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(password)) {
        newErrors.password = "密码需要包含字母和数字";
      }
    }

    if (!field || field === "confirmPassword") {
      if (!confirmPassword) {
        newErrors.confirmPassword = "请确认密码";
      } else if (password !== confirmPassword) {
        newErrors.confirmPassword = "两次输入的密码不一致";
      }
    }

    setErrors((prev) => ({ ...prev, ...newErrors }));
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
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "注册失败");
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/login?registered=true");
      }
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "注册失败，请重试");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md space-y-5">
      {/* 服务器错误提示 */}
      {serverError && (
        <div className="p-4 bg-error-50 border border-error-200 rounded-lg flex items-start gap-3 animate-fade-in">
          <AlertCircle className="w-5 h-5 text-error shrink-0 mt-0.5" />
          <span className="text-sm text-error-800">{serverError}</span>
        </div>
      )}

      {/* 姓名输入 */}
      <div className="form-group">
        <label htmlFor="name" className="form-label">
          姓名
        </label>
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
            <User className="w-5 h-5" />
          </div>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
            }}
            onBlur={() => validateForm("name")}
            className={`form-input pl-12 ${errors.name ? "error" : ""}`}
            placeholder="请输入您的姓名"
            disabled={isLoading}
          />
        </div>
        {errors.name && (
          <p className="form-error">{errors.name}</p>
        )}
      </div>

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
            onBlur={() => validateForm("email")}
            className={`form-input pl-12 ${errors.email ? "error" : ""}`}
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
        <label htmlFor="password" className="form-label">
          密码
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
            onBlur={() => validateForm("password")}
            className={`form-input pl-12 pr-12 ${errors.password ? "error" : ""}`}
            placeholder="请设置密码（至少6位，含字母和数字）"
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
        {errors.password ? (
          <p className="form-error">{errors.password}</p>
        ) : (
          <p className="form-help">密码需包含至少6个字符，包括字母和数字</p>
        )}
      </div>

      {/* 确认密码输入 */}
      <div className="form-group">
        <label htmlFor="confirmPassword" className="form-label">
          确认密码
        </label>
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
            <Lock className="w-5 h-5" />
          </div>
          <input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: "" }));
            }}
            onBlur={() => validateForm("confirmPassword")}
            className={`form-input pl-12 pr-12 ${errors.confirmPassword ? "error" : ""}`}
            placeholder="请再次输入密码"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
            aria-label={showConfirmPassword ? "隐藏密码" : "显示密码"}
          >
            {showConfirmPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="form-error">{errors.confirmPassword}</p>
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
        {isLoading ? "注册中..." : "注册"}
      </Button>

      {/* 登录链接 */}
      <div className="text-center pt-2">
        <p className="text-sm text-neutral-600">
          已有账号？{" "}
          <Link
            href="/login"
            className="text-primary font-semibold hover:text-accent transition-colors"
          >
            立即登录
          </Link>
        </p>
      </div>
    </form>
  );
}
