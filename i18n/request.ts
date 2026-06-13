import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  // Validate that the incoming locale is supported
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as 'en' | 'ar')) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    // Dynamically import only the needed locale file — keeps bundles lean
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
