import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // StayNeos 品牌色彩系统
      colors: {
        // 主色 - 深海蓝
        primary: {
          DEFAULT: "#003B5C",
          50: "#E6F0F5",
          100: "#CCE0EB",
          200: "#99C2D7",
          300: "#66A3C3",
          400: "#3385AF",
          500: "#003B5C",
          600: "#002F4A",
          700: "#002A42",
          800: "#001F31",
          900: "#001521",
        },
        // 强调色 - 金色 (品牌色)
        accent: {
          DEFAULT: "#C9A962",
          50: "#FAF7F0",
          100: "#F5F0E1",
          200: "#EBE0C3",
          300: "#E0D1A5",
          400: "#D4C287",
          500: "#C9A962",
          600: "#B8984F",
          700: "#A08545",
          800: "#88723B",
          900: "#6F5E30",
        },
        // 中性色
        neutral: {
          50: "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#CBD5E1",
          400: "#94A3B8",
          500: "#64748B",
          600: "#475569",
          700: "#334155",
          800: "#1E293B",
          900: "#0F172A",
          950: "#020617",
        },
        // 状态色
        success: {
          DEFAULT: "#059669",
          50: "#ECFDF5",
          100: "#D1FAE5",
        },
        warning: {
          DEFAULT: "#D97706",
          50: "#FFFBEB",
          100: "#FEF3C7",
        },
        error: {
          DEFAULT: "#DC2626",
          50: "#FEF2F2",
          100: "#FEE2E2",
        },
        info: {
          DEFAULT: "#0284C7",
          50: "#EFF6FF",
          100: "#DBEAFE",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        display: ["Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        // 字体层级系统
        "display-1": ["clamp(2.5rem, 5vw, 3.5rem)", { lineHeight: "1.1", fontWeight: "700", letterSpacing: "-0.02em" }],
        "display-2": ["clamp(2rem, 4vw, 2.75rem)", { lineHeight: "1.2", fontWeight: "700", letterSpacing: "-0.01em" }],
        "heading-1": ["clamp(1.5rem, 3vw, 2.25rem)", { lineHeight: "1.2", fontWeight: "600" }],
        "heading-2": ["clamp(1.25rem, 2.5vw, 1.75rem)", { lineHeight: "1.3", fontWeight: "600" }],
        "heading-3": ["clamp(1.125rem, 2vw, 1.5rem)", { lineHeight: "1.4", fontWeight: "600" }],
        "heading-4": ["1.25rem", { lineHeight: "1.4", fontWeight: "600" }],
        "body-lg": ["1.125rem", { lineHeight: "1.6", fontWeight: "400" }],
        "body": ["1rem", { lineHeight: "1.6", fontWeight: "400" }],
        "body-sm": ["0.875rem", { lineHeight: "1.5", fontWeight: "400" }],
        "caption": ["0.75rem", { lineHeight: "1.5", fontWeight: "400" }],
      },
      spacing: {
        // 8px 网格系统
        "0": "0",
        "1": "4px",
        "2": "8px",
        "3": "12px",
        "4": "16px",
        "5": "20px",
        "6": "24px",
        "7": "28px",
        "8": "32px",
        "9": "36px",
        "10": "40px",
        "11": "44px",
        "12": "48px",
        "14": "56px",
        "16": "64px",
        "18": "72px",
        "20": "80px",
        "24": "96px",
        "32": "128px",
      },
      borderRadius: {
        // 现代圆角系统
        "none": "0",
        "sm": "4px",
        DEFAULT: "8px",
        "md": "8px",
        "lg": "12px",
        "xl": "16px",
        "2xl": "20px",
        "3xl": "24px",
        "full": "9999px",
      },
      boxShadow: {
        // 精致阴影系统
        "sm": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        DEFAULT: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        "md": "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        "lg": "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
        "xl": "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
        "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
        "accent": "0 4px 6px -1px rgb(201 169 98 / 0.3)",
        "primary": "0 4px 6px -1px rgb(0 59 92 / 0.3)",
      },
      transitionDuration: {
        "fast": "150ms",
        "normal": "200ms",
        "slow": "300ms",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "slide-down": "slideDown 0.4s ease-out",
        "scale-in": "scaleIn 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [
    // 添加组件插件
    function ({ addComponents, theme }: any) {
      addComponents({
        // 容器
        ".container-custom": {
          maxWidth: theme("maxWidth.7xl"),
          marginLeft: "auto",
          marginRight: "auto",
          paddingLeft: theme("spacing.4"),
          paddingRight: theme("spacing.4"),
          "@screen sm": {
            paddingLeft: theme("spacing.6"),
            paddingRight: theme("spacing.6"),
          },
          "@screen lg": {
            paddingLeft: theme("spacing.8"),
            paddingRight: theme("spacing.8"),
          },
        },
      });
    },
  ],
};

export default config;
