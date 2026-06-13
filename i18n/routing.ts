import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  // All supported locales
  locales: ['en', 'ar'],

  // Default locale when no prefix is detected
  defaultLocale: 'ar',
});
