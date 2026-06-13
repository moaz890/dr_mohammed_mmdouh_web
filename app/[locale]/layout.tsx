import type { Metadata } from 'next';
import { Cairo } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { notFound } from 'next/navigation';
import '../globals.css';

// Cairo covers both Arabic and Latin scripts — one font for both languages
// avoids font-switching flicker when switching locales
const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  variable: '--font-cairo',
  display: 'swap',
});

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Reject any locale that isn't in our supported list
  if (!routing.locales.includes(locale as 'en' | 'ar')) {
    notFound();
  }

  // Load only this locale's messages for the client provider
  const messages = await getMessages();

  // Arabic is RTL — dir must be set on <html> for TailwindCSS RTL utilities to work
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir} className={`${cairo.variable} h-full`}>
      <body className="min-h-full flex flex-col font-[family-name:var(--font-cairo)] antialiased">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
