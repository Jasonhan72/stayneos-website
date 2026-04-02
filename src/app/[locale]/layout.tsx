import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { notFound } from 'next/navigation';
import { ReactNode } from 'react';
import { getMessages } from 'next-intl/server';
import { isValidLocale } from '@/i18n.config';
import IntlProvider from '@/components/providers/IntlProvider';
import { I18nProvider } from "@/lib/i18n";
import { UserProvider } from "@/lib/context/UserContext";
import { WishlistProvider } from "@/lib/context/WishlistContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { CustomerChat } from "@/components/layout/CustomerChat";
import { StructuredData } from "@/components/seo/StructuredData";
import { getBaseUrl } from "@/lib/config/env";
import "../globals.css";

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

interface LocaleLayoutProps {
  children: ReactNode;
  params: { locale: string };
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params;
  
  if (!isValidLocale(locale)) {
    notFound();
  }

  // 从翻译文件中获取元数据
  const messages = await getMessages({ locale });
  
  const title = messages.metadata?.title as string || "NEOS | Premium Executive Apartment Rentals";
  const description = messages.metadata?.description as string || 
    "NEOS is a premium executive apartment platform for business professionals, offering quality properties, flexible leases, and 24/7 concierge service.";

  const BASE_URL = getBaseUrl();

  return {
    metadataBase: new URL(BASE_URL),
    title,
    description,
    keywords: ["executive apartments", "corporate housing", "luxury rentals", "Toronto apartments", "business accommodation"],
    authors: [{ name: "NEOS" }],
    creator: "NEOS",
    publisher: "NEOS",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    openGraph: {
      type: "website",
      locale: locale === 'zh' ? 'zh_CN' : locale === 'fr' ? 'fr_CA' : 'en_US',
      url: `${BASE_URL}/${locale}`,
      title,
      description,
      siteName: "NEOS",
      images: [
        {
          url: `${BASE_URL}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: "NEOS Premium Executive Apartments",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${BASE_URL}/og-image.jpg`],
      creator: "@stayneos",
    },
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
    verification: {
      google: "google-site-verification-code",
    },
  };
}

export default async function LocaleLayout({
  children,
  params
}: LocaleLayoutProps) {
  const { locale } = await params;
  
  if (!isValidLocale(locale)) {
    notFound();
  }

  // 获取翻译消息
  const messages = await getMessages({ locale });
  
  // 设置时区
  const timeZone = 'America/Toronto';
  const now = new Date();

  return (
    <html lang={locale} className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-screen bg-white text-gray-900 antialiased">
        <IntlProvider
          locale={locale}
          messages={messages}
          timeZone={timeZone}
          now={now}
        >
          <I18nProvider>
            <UserProvider>
              <WishlistProvider>
                <div className="flex min-h-screen flex-col">
                  <Navbar locale={locale} />
                  <main className="flex-1">
                    {children}
                  </main>
                  <Footer locale={locale} />
                  <CustomerChat />
                  <StructuredData locale={locale} />
                </div>
              </WishlistProvider>
            </UserProvider>
          </I18nProvider>
        </IntlProvider>
      </body>
    </html>
  );
}