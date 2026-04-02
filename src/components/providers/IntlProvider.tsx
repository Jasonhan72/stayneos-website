'use client';

import { NextIntlClientProvider } from 'next-intl';
import { ReactNode } from 'react';

interface IntlProviderProps {
  children: ReactNode;
  messages: Record<string, unknown>;
  locale: string;
  timeZone: string;
  now: Date;
}

export default function IntlProvider({
  children,
  messages,
  locale,
  timeZone,
  now
}: IntlProviderProps) {
  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
      timeZone={timeZone}
      now={now}
      // 错误处理
      onError={(error) => {
        if (process.env.NODE_ENV === 'development') {
          console.error('NextIntl error:', error);
        }
      }}
      // 获取缺失的翻译
      getMessageFallback={({ namespace, key, error }) => {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`Missing translation: ${namespace}.${key}`, error);
        }
        return `[${key}]`;
      }}
    >
      {children}
    </NextIntlClientProvider>
  );
}