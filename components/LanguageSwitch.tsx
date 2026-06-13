'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';

export function LanguageSwitch() {
  const locale = useLocale();
  const t = useTranslations('nav');
  const router = useRouter();
  const pathname = usePathname();

  const toggleLanguage = () => {
    // Swap the locale prefix in the URL
    // e.g. /ar/admin/dashboard → /en/admin/dashboard
    const newLocale = locale === 'ar' ? 'en' : 'ar';
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
  };

  return (
    <motion.button
      onClick={toggleLanguage}
      className="flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title="Switch language"
    >
      <Globe className="h-3.5 w-3.5 text-primary" />
      <span>{t('language')}</span>
    </motion.button>
  );
}
