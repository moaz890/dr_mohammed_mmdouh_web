import { getTranslations, getLocale } from 'next-intl/server';
import Link from 'next/link';
import { CalendarCheck, Shield, Clock, Phone } from 'lucide-react';
import { LanguageSwitch } from '@/components/LanguageSwitch';

export default async function HomePage() {
  const t = await getTranslations('booking');
  const nav = await getTranslations('nav');
  const locale = await getLocale();

  const features = [
    { icon: CalendarCheck, title: locale === 'ar' ? 'حجز سريع وسهل' : 'Quick & Easy Booking', desc: locale === 'ar' ? 'احجز موعدك في دقائق معدودة' : 'Book your appointment in minutes' },
    { icon: Shield, title: locale === 'ar' ? 'دفع آمن' : 'Secure Payment', desc: locale === 'ar' ? 'مدفوعات آمنة عبر بوابة جيديا' : 'Secure payments via Geidea gateway' },
    { icon: Clock, title: locale === 'ar' ? 'تأكيد فوري' : 'Instant Confirmation', desc: locale === 'ar' ? 'تأكيد فوري بعد الدفع' : 'Instant confirmation after payment' },
    { icon: Phone, title: locale === 'ar' ? 'تواصل مباشر' : 'Direct Contact', desc: locale === 'ar' ? 'سيتواصل معك فريقنا على واتساب' : 'Our team will contact you via WhatsApp' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
              <CalendarCheck className="w-4 h-4 text-primary" />
            </div>
            <span className="font-bold text-white text-sm">
              {locale === 'ar' ? 'عيادة د. محمد ممدوح' : 'Dr. Mohammed Mamdouh Clinic'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/${locale}/admin/login`}
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              {nav('admin')}
            </Link>
            <LanguageSwitch />
          </div>
        </div>
      </nav>

      {/* Hero section */}
      <section className="relative max-w-6xl mx-auto px-4 pt-24 pb-20 text-center">
        {/* Glow blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            {locale === 'ar' ? 'احجز موعدك الآن' : 'Book Your Appointment Now'}
          </span>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
            {locale === 'ar' ? (
              <>عيادة <span className="text-primary">د. محمد ممدوح</span></>
            ) : (
              <><span className="text-primary">Dr. Mohammed Mamdouh</span> Clinic</>
            )}
          </h1>

          <p className="text-slate-400 text-lg max-w-xl mx-auto mb-10">
            {t('subtitle')}
          </p>

          <Link
            href={`/${locale}/book`}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary/90 hover:shadow-primary/40 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
          >
            <CalendarCheck className="w-5 h-5" />
            {nav('book')}
          </Link>
        </div>
      </section>

      {/* Features grid */}
      <section className="max-w-6xl mx-auto px-4 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <div
              key={i}
              className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 hover:border-primary/30 hover:bg-slate-900 transition-all duration-300 group"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <f.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-white text-sm mb-1.5">{f.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
