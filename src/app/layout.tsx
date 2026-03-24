import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n";
import { UserProvider } from "@/lib/context/UserContext";
import { WishlistProvider } from "@/lib/context/WishlistContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getBaseUrl } from "@/lib/config/env";

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

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "NEOS | Premium Furnished Apartments",
    template: "%s | NEOS",
  },
  description:
    "NEOS is a premium executive apartment platform for business professionals, offering quality properties, flexible leases, and 24/7 concierge service across major cities in Canada and North America.",
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
    locale: "en_US",
    url: BASE_URL,
    siteName: "NEOS",
    title: "NEOS | Premium Furnished Apartments",
    description:
      "Premium furnished apartment platform for professionals with exceptional living experience and concierge service across major cities",
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
    title: "NEOS | Premium Furnished Apartments",
    description:
      "Premium furnished apartment platform for professionals with exceptional living experience and concierge service",
    images: [`${BASE_URL}/og-image.jpg`],
    creator: "@stayneos",
  },
  alternates: {
    canonical: BASE_URL,
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

const resolveInitialLocale = async (): Promise<"en" | "fr" | "zh"> => {
  const cookieStore = await cookies();
  const locale = cookieStore.get("stayneos_locale")?.value;
  return locale === "zh" || locale === "fr" || locale === "en" ? locale : "en";
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      className={`${inter.variable} ${playfair.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://images.unsplash.com" />
      </head>
      <body className="font-sans antialiased">
        <UserProvider>
          <WishlistProvider>
          <I18nProvider initialLocale={await resolveInitialLocale()}>
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
          </WishlistProvider>
        </UserProvider>
      </body>
    </html>
  );
}
