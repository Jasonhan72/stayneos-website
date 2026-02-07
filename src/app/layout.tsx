import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { UserProvider } from "@/lib/context/UserContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#1a1a1a",
};

export const metadata: Metadata = {
  title: {
    default: "StayNeos | 高端行政公寓出租平台",
    template: "%s | StayNeos",
  },
  description:
    "StayNeos是专为商务人士打造的高端行政公寓平台，提供优质房源、灵活租期、24小时管家服务。在上海静安、陆家嘴、新天地等核心地段精选豪华公寓。",
  keywords: [
    "行政公寓",
    "高端公寓出租",
    "上海公寓",
    "商务公寓",
    "短期租赁",
    "豪华公寓",
    "StayNeos",
    "serviced apartment",
    "luxury apartment",
  ],
  authors: [{ name: "StayNeos" }],
  creator: "StayNeos",
  publisher: "StayNeos",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: "https://stayneos.com",
    siteName: "StayNeos",
    title: "StayNeos | 高端行政公寓出租平台",
    description:
      "专为商务人士打造的高端行政公寓平台，提供优质的居住体验和贴心的管家服务",
    images: [
      {
        url: "https://stayneos.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "StayNeos 高端行政公寓",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "StayNeos | 高端行政公寓出租平台",
    description:
      "专为商务人士打造的高端行政公寓平台，提供优质的居住体验和贴心的管家服务",
    images: ["https://stayneos.com/og-image.jpg"],
    creator: "@stayneos",
  },
  alternates: {
    canonical: "https://stayneos.com",
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    other: [
      {
        rel: "mask-icon",
        url: "/safari-pinned-tab.svg",
        color: "#c9a962",
      },
    ],
  },
  appleWebApp: {
    title: "StayNeos",
    statusBarStyle: "black-translucent",
  },
  other: {
    "msapplication-TileColor": "#c9a962",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      className={`${inter.variable} ${playfair.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased">
        <AuthProvider>
          <UserProvider>
            <I18nProvider>
              <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-gray-900 focus:rounded-lg focus:shadow-lg"
              >
                Skip to main content
              </a>
              <Navbar />
              {children}
              <Footer />
            </I18nProvider>
          </UserProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
