import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { defaultLocale } from '@/i18n.config';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'NEOS | Premium Executive Apartment Rentals',
  description: 'NEOS is a premium executive apartment platform for business professionals.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 这个布局只用于重定向，实际内容在 [locale]/layout.tsx 中
  return (
    <html lang={defaultLocale} className={inter.className}>
      <body>
        {children}
      </body>
    </html>
  );
}