import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n";
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
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://stayneos.com'),
  title: {
    default: "StayNeos | Premium Furnished Apartments",
    template: "%s | StayNeos",
  },
  description:
    "StayNeos is a premium executive apartment platform for business professionals, offering quality properties, flexible leases, and 24/7 concierge service across major cities in Canada and North America.",
  keywords: [
    "executive apartments",
    "premium furnished rentals",
    "corporate housing",
    "business travel",
    "short-term rental",
    "luxury apartments",
    "StayNeos",
    "serviced apartment",
    "luxury apartment",
    "flexible lease",
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
    locale: "en_US",
    url: "https://stayneos.com",
    siteName: "StayNeos",
    title: "StayNeos | Premium Furnished Apartments",
    description:
      "Premium furnished apartment platform for professionals with exceptional living experience and concierge service across major cities",
    images: [
      {
        url: "https://stayneos.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "StayNeos Premium Executive Apartments",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "StayNeos | Premium Furnished Apartments",
    description:
      "Premium furnished apartment platform for professionals with exceptional living experience and concierge service",
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
      </body>
    </html>
  );
}
