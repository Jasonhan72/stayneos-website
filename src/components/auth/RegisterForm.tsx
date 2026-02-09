"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  AlertCircle,
  Check,
  X
} from "lucide-react";
import Button from "@/components/ui/Button";

// Password strength indicator
function PasswordStrength({ password }: { password: string }) {
  const getStrength = (pwd: string): { score: number; label: string; color: string } => {
    if (!pwd) return { score: 0, label: "", color: "bg-neutral-200" };
    
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[^a-zA-Z0-9]/.test(pwd)) score++;
    
    if (score <= 2) return { score, label: "Weak", color: "bg-red-500" };
    if (score <= 4) return { score, label: "Medium", color: "bg-yellow-500" };
    return { score, label: "Strong", color: "bg-green-500" };
  };
  
  const { score, label, color } = getStrength(password);
  
  if (!password) return null;
  
  return (
    <div className="mt-2">
      <div className="flex gap-1 h-1 mb-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`flex-1 rounded-full transition-colors duration-200 ${
              i <= score ? color : "bg-neutral-200"
            }`}
          />
        ))}
      </div>
      <div className="flex justify-between items-center text-xs">
        <span className="text-neutral-500">Password strength</span>
        <span className={`font-medium ${
          score <= 2 ? "text-red-500" : score <= 4 ? "text-yellow-600" : "text-green-600"
        }`}>
          {label}
        </span>
      </div>
    </div>
  );
}

// Validation requirements display
function PasswordRequirements({ password }: { password: string }) {
  const requirements = [
    { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
    { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
    { label: "One lowercase letter", test: (p: string) => /[a-z]/.test(p) },
    { label: "One number", test: (p: string) => /\d/.test(p) },
  ];
  
  if (!password) return null;
  
  return (
    <div className="mt-2 space-y-1">
      {requirements.map((req) => {
        const met = req.test(password);
        return (
          <div key={req.label} className="flex items-center gap-2 text-xs">
            {met ? (
              <Check className="w-3.5 h-3.5 text-green-500" />
            ) : (
              <X className="w-3.5 h-3.5 text-neutral-300" />
            )}
            <span className={met ? "text-green-600" : "text-neutral-400"}>
              {req.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [serverError, setServerError] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [termsError, setTermsError] = useState(false);

  // Real-time validation
  const validateField = useCallback((field: string, value: string): string => {
    switch (field) {
      case "firstName":
        if (!value.trim()) return "First name is required";
        if (value.trim().length < 2) return "First name must be at least 2 characters";
        return "";
      
      case "lastName":
        if (!value.trim()) return "Last name is required";
        if (value.trim().length < 2) return "Last name must be at least 2 characters";
        return "";
      
      case "email":
        if (!value.trim()) return "Email is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Please enter a valid email address";
        return "";
      
      case "password":
        if (!value) return "Password is required";
        if (value.length < 8) return "Password must be at least 8 characters";
        if (!/(?=.*[a-z])/.test(value)) return "Password must contain a lowercase letter";
        if (!/(?=.*[A-Z])/.test(value)) return "Password must contain an uppercase letter";
        if (!/(?=.*\d)/.test(value)) return "Password must contain a number";
        return "";
      
      case "confirmPassword":
        if (!value) return "Please confirm your password";
        if (value !== formData.password) return "Passwords do not match";
        return "";
      
      default:
        return "";
    }
  }, [formData.password]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
    
    // Real-time validation for already-touched fields
    if (touched[field]) {
      const error = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: error }));
    }
    
    // Special case: re-validate confirm password when password changes
    if (field === "password" && formData.confirmPassword && touched.confirmPassword) {
      const confirmError = validateField("confirmPassword", formData.confirmPassword);
      setErrors((prev) => ({ ...prev, confirmPassword: confirmError }));
    }
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field as keyof typeof formData]);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    Object.keys(formData).forEach((field) => {
      const error = validateField(field, formData[field as keyof typeof formData]);
      if (error) newErrors[field] = error;
    });
    
    setErrors(newErrors);
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      password: true,
      confirmPassword: true,
    });
    
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");
    
    if (!validateForm()) {
      return;
    }
    
    if (!agreedToTerms) {
      setTermsError(true);
      return;
    }
    
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      // Auto-login after registration
      const signInResult = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (signInResult?.error) {
        router.push("/login?registered=true");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    setSocialLoading(provider);
    try {
      await signIn(provider, { callbackUrl: "/dashboard" });
    } catch {
      setSocialLoading(null);
    }
  };

  // Input field component with error styling
  const InputField = ({
    id,
    label,
    type = "text",
    value,
    placeholder,
    icon: Icon,
    showPasswordToggle,
    showPassword: showPwd,
    onTogglePassword,
    error,
    onChange,
    onBlur,
    autoComplete,
  }: {
    id: string;
    label: string;
    type?: string;
    value: string;
    placeholder: string;
    icon: React.ElementType;
    showPasswordToggle?: boolean;
    showPassword?: boolean;
    onTogglePassword?: () => void;
    error?: string;
    onChange: (value: string) => void;
    onBlur: () => void;
    autoComplete?: string;
  }) => (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-neutral-700">
        {label}
      </label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
          <Icon className="w-5 h-5" />
        </div>
        <input
          id={id}
          type={showPasswordToggle ? (showPwd ? "text" : "password") : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          autoComplete={autoComplete}
          className={`w-full pl-10 ${showPasswordToggle ? "pr-10" : "pr-4"} py-3 rounded-lg border text-neutral-900 placeholder:text-neutral-400 transition-all duration-200 ${
            error
              ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100"
              : "border-neutral-200 bg-white hover:border-neutral-300 focus:border-primary focus:ring-2 focus:ring-primary/10"
          }`}
          placeholder={placeholder}
          disabled={isLoading}
        />
        {showPasswordToggle && onTogglePassword && (
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
            aria-label={showPwd ? "Hide password" : "Show password"}
          >
            {showPwd ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        )}
      </div>
      {error && (
        <div className="flex items-center gap-1.5 text-sm text-red-600">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Server Error */}
      {serverError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <span className="text-sm text-red-700">{serverError}</span>
        </div>
      )}

      {/* Social Login Buttons */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => handleSocialLogin("google")}
          disabled={!!socialLoading}
          className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-lg border border-neutral-200 bg-white text-neutral-700 font-medium hover:bg-neutral-50 hover:border-neutral-300 transition-all duration-200 disabled:opacity-50"
        >
          {socialLoading === "google" ? (
            <div className="w-5 h-5 border-2 border-neutral-300 border-t-neutral-600 rounded-full animate-spin" />
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          )}
          Continue with Google
        </button>

        <button
          type="button"
          onClick={() => handleSocialLogin("facebook")}
          disabled={!!socialLoading}
          className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-lg bg-[#1877F2] text-white font-medium hover:bg-[#166fe5] transition-all duration-200 disabled:opacity-50"
        >
          {socialLoading === "facebook" ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          )}
          Continue with Facebook
        </button>
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-neutral-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-neutral-400">or</span>
        </div>
      </div>

      {/* Name Fields - Side by side */}
      <div className="grid grid-cols-2 gap-4">
        <InputField
          id="firstName"
          label="First Name"
          value={formData.firstName}
          placeholder="John"
          icon={User}
          error={touched.firstName ? errors.firstName : undefined}
          onChange={(value) => handleChange("firstName", value)}
          onBlur={() => handleBlur("firstName")}
          autoComplete="given-name"
        />

        <InputField
          id="lastName"
          label="Last Name"
          value={formData.lastName}
          placeholder="Doe"
          icon={User}
          error={touched.lastName ? errors.lastName : undefined}
          onChange={(value) => handleChange("lastName", value)}
          onBlur={() => handleBlur("lastName")}
          autoComplete="family-name"
        />
      </div>

      {/* Email Field */}
      <InputField
        id="email"
        label="Email"
        type="email"
        value={formData.email}
        placeholder="john.doe@example.com"
        icon={Mail}
        error={touched.email ? errors.email : undefined}
        onChange={(value) => handleChange("email", value)}
        onBlur={() => handleBlur("email")}
        autoComplete="email"
      />

      {/* Password Field */}
      <div className="space-y-1.5">
        <label htmlFor="password" className="block text-sm font-medium text-neutral-700">
          Password
        </label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
            <Lock className="w-5 h-5" />
          </div>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={(e) => handleChange("password", e.target.value)}
            onBlur={() => handleBlur("password")}
            autoComplete="new-password"
            className={`w-full pl-10 pr-10 py-3 rounded-lg border text-neutral-900 placeholder:text-neutral-400 transition-all duration-200 ${
              touched.password && errors.password
                ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                : "border-neutral-200 bg-white hover:border-neutral-300 focus:border-primary focus:ring-2 focus:ring-primary/10"
            }`}
            placeholder="Create a strong password"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>
        {touched.password && errors.password ? (
          <div className="flex items-center gap-1.5 text-sm text-red-600">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errors.password}</span>
          </div>
        ) : (
          <>
            <PasswordStrength password={formData.password} />
            <PasswordRequirements password={formData.password} />
          </>
        )}
      </div>

      {/* Confirm Password Field */}
      <InputField
        id="confirmPassword"
        label="Confirm Password"
        value={formData.confirmPassword}
        placeholder="Confirm your password"
        icon={Lock}
        showPasswordToggle
        showPassword={showConfirmPassword}
        onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
        error={touched.confirmPassword ? errors.confirmPassword : undefined}
        onChange={(value) => handleChange("confirmPassword", value)}
        onBlur={() => handleBlur("confirmPassword")}
        autoComplete="new-password"
      />

      {/* Terms Checkbox */}
      <div className="space-y-2">
        <label className={`flex items-start gap-3 p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
          termsError && !agreedToTerms
            ? "border-red-500 bg-red-50"
            : "border-neutral-200 hover:border-neutral-300 bg-white"
        }`}>
          <input
            type="checkbox"
            checked={agreedToTerms}
            onChange={(e) => {
              setAgreedToTerms(e.target.checked);
              if (e.target.checked) setTermsError(false);
            }}
            className="mt-0.5 w-5 h-5 rounded border-neutral-300 text-primary focus:ring-primary cursor-pointer"
          />
          <span className="text-sm text-neutral-600">
            I agree to the{" "}
            <Link href="/terms" className="text-primary hover:text-primary/80 font-medium underline underline-offset-2">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-primary hover:text-primary/80 font-medium underline underline-offset-2">
              Privacy Policy
            </Link>
          </span>
        </label>
        
        {termsError && !agreedToTerms && (
          <div className="flex items-center gap-1.5 text-sm text-red-600">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>You must agree to the terms to continue</span>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        isLoading={isLoading}
        className="bg-primary hover:bg-primary/90 text-white"
      >
        {isLoading ? "Creating account..." : "Create Account"}
      </Button>

      {/* Login Link */}
      <div className="text-center pt-2">
        <p className="text-sm text-neutral-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-primary font-semibold hover:text-primary/80 transition-colors"
          >
            Log in
          </Link>
        </p>
      </div>
    </form>
  );
}
