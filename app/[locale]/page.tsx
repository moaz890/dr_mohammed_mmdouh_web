import { useTranslations } from 'next-intl';

export default function HomePage() {
  const t = useTranslations('booking');

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-3xl font-bold">{t('title')}</h1>
      <p className="mt-2 text-gray-500">{t('subtitle')}</p>
    </main>
  );
}
