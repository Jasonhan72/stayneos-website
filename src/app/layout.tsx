import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n";
import { UserProvider } from "@/lib/context/UserContext";
import { WishlistProvider } from "@/lib/context/WishlistContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { CustomerChat } from "@/components/layout/CustomerChat";
import { ToastProvider } from "@/components/ui/Toast";
import { getBaseUrl } from "@/lib/config/env";
import {
  getHtmlLang,
  getOgLocale,
  getServerTranslation,
  resolveRequestLocale,
} from "@/lib/i18n-server";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const BASE_URL = getBaseUrl();

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

export async function generateMetadata(): Promise<Metadata> {
  const locale = await resolveRequestLocale();
  const title = getServerTranslation(locale, "metadata.title", "NEOS | Premium Executive Apartment Rentals");
  const description = getServerTranslation(
    locale,
    "metadata.description",
    "NEOS is a premium executive apartment platform for business professionals, offering quality properties, flexible leases, and 24/7 concierge service."
  );

  return {
    metadataBase: new URL(BASE_URL),
    title: {
      default: title,
      template: "%s | NEOS",
    },
    description,
    keywords: [
      "executive apartments",
      "premium furnished rentals",
      "corporate housing",
      "business travel",
      "short-term rental",
      "luxury apartments",
      "NEOS",
      "serviced apartment",
      "luxury apartment",
      "flexible lease",
    ],
    authors: [{ name: "NEOS" }],
    creator: "NEOS",
    publisher: "NEOS",
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
      locale: getOgLocale(locale),
      alternateLocale: ["en_US", "fr_CA", "zh_CN"].filter((value) => value !== getOgLocale(locale)),
      url: BASE_URL,
      siteName: "NEOS",
      title,
      description,
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
    alternates: {
      canonical: "/",
      languages: {
        "en-CA": "/",
        "fr-CA": "/",
        "zh-CN": "/",
        "x-default": "/",
      },
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
      title: "NEOS",
      statusBarStyle: "black-translucent",
    },
    other: {
      "msapplication-TileColor": "#c9a962",
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await resolveRequestLocale();
  const skipToMainContentLabel =
    locale === "zh" ? "跳到主要内容" : locale === "fr" ? "Aller au contenu principal" : "Skip to main content";

  return (
    <html
      lang={getHtmlLang(locale)}
      className={`${inter.variable} ${playfair.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        {/* Cloudflare Web Analytics */}
        <script
          defer
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon='{"token": "d3c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0"}'
        ></script>
      </head>
      <body className="font-sans antialiased overflow-x-hidden">
        <ToastProvider>
          <UserProvider>
          <WishlistProvider>
          <I18nProvider initialLocale={locale}>
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-gray-900 focus:rounded-lg focus:shadow-lg"
            >
              {skipToMainContentLabel}
            </a>
            <Navbar />
            {children}
            <Footer />
            <CustomerChat />
          </I18nProvider>
          </WishlistProvider>
          </UserProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
