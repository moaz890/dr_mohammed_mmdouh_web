'use client';

import { useEffect, useState } from 'react';
import { use } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Clock, Loader2, CalendarCheck, Phone } from 'lucide-react';
import { fetchBookingById, type Booking } from '@/lib/api';
import { Button } from '@/components/ui/button';

// This single page handles both success (Task 35) and failure (Task 36)
// Why: Geidea redirects to /booking/[id]?status=success or ?status=failed
// The page fetches the real booking status from the DB (not just the URL param)
// so even if the URL param is wrong, the displayed status is accurate

export default function BookingStatusPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const t = useTranslations('booking');
  const locale = useLocale();
  const searchParams = useSearchParams();
  const urlStatus = searchParams.get('status'); // 'success' | 'failed' | null

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Poll once — give the webhook a moment to process before first fetch
    const timer = setTimeout(() => {
      fetchBookingById(id)
        .then((res) => setBooking(res.data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }, 1500); // 1.5s delay — webhook usually fires within 1s of redirect

    return () => clearTimeout(timer);
  }, [id]);

  // Determine actual status from DB (more reliable than URL param)
  const isSuccess = booking?.paymentStatus === 'paid' || urlStatus === 'success';
  const isFailed = booking?.paymentStatus === 'failed' || urlStatus === 'failed';

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-slate-400 text-sm">
          {locale === 'ar' ? 'جارٍ التحقق من حالة الدفع...' : 'Verifying payment status...'}
        </p>
      </div>
    );
  }

  // Task 35: Success state
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 180, damping: 12 }}
          className="mb-6"
        >
          <CheckCircle2 className="h-20 w-20 text-emerald-400" />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h1 className="text-2xl font-bold text-white mb-2">{t('success')}</h1>
          <p className="text-slate-400 mb-6 max-w-sm">{t('successMessage')}</p>

          {booking && (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5 mb-6 text-start max-w-sm mx-auto space-y-3">
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <CalendarCheck className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                <span>{booking.appointmentDate} — {booking.appointmentTime}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <Phone className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                <span dir="ltr">{booking.phone}</span>
              </div>
            </div>
          )}

          <Button asChild className="bg-primary hover:bg-primary/90 text-white">
            <Link href={`/${locale}`}>
              {locale === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
            </Link>
          </Button>
        </motion.div>
      </div>
    );
  }

  // Task 36: Failure state
  if (isFailed) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 180, damping: 12 }}
          className="mb-6"
        >
          <XCircle className="h-20 w-20 text-red-400" />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h1 className="text-2xl font-bold text-white mb-2">{t('failure')}</h1>
          <p className="text-slate-400 mb-6 max-w-sm">{t('failureMessage')}</p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild className="bg-primary hover:bg-primary/90 text-white">
              <Link href={`/${locale}/book`}>{t('tryAgain')}</Link>
            </Button>
            <Button asChild variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
              <Link href={`/${locale}`}>
                {locale === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Pending / unknown — webhook hasn't fired yet
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4 text-center">
      <Clock className="h-16 w-16 text-amber-400 mb-4" />
      <h1 className="text-xl font-bold text-white mb-2">
        {locale === 'ar' ? 'جارٍ معالجة الدفع' : 'Payment Processing'}
      </h1>
      <p className="text-slate-400 text-sm mb-6 max-w-sm">
        {locale === 'ar'
          ? 'يتم معالجة دفعتك. سنتواصل معك بعد التأكيد.'
          : 'Your payment is being processed. We will contact you after confirmation.'}
      </p>
      <Button asChild variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
        <Link href={`/${locale}`}>
          {locale === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
        </Link>
      </Button>
    </div>
  );
}
