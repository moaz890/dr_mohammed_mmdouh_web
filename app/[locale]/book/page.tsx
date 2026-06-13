'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CalendarCheck, User, Phone, Mail, Calendar, Clock, FileText, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LanguageSwitch } from '@/components/LanguageSwitch';
import { createBooking, createPaymentSession } from '@/lib/api';

// Task 32: Zod validation schema (mirrors backend validation)
const bookingSchema = z.object({
  patientName: z.string().min(2, 'Name must be at least 2 characters').trim(),
  phone: z
    .string()
    .regex(/^(\+?20|0)?1[0125]\d{8}$/, 'Invalid Egyptian phone number'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  appointmentDate: z
    .string()
    .min(1, 'Date is required')
    .refine((d) => new Date(d) >= new Date(new Date().setHours(0, 0, 0, 0)), 'Date cannot be in the past'),
  appointmentTime: z.string().min(1, 'Time is required'),
  notes: z.string().max(500).optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

// Today's date formatted as YYYY-MM-DD for the min attribute on the date input
const todayStr = new Date().toISOString().split('T')[0];

// Appointment time slots — clinic defines available times
const TIME_SLOTS = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00'];

// Consultation fee — in a real system this might come from an API
const CONSULTATION_FEE = 200;

export default function BookingPage() {
  const t = useTranslations('booking');
  const errT = useTranslations('errors');
  const nav = useTranslations('nav');
  const locale = useLocale();
  const router = useRouter();

  const [step, setStep] = useState<'form' | 'submitting' | 'redirecting'>('form');
  const [submitError, setSubmitError] = useState('');

  // Task 31: React Hook Form integration with Zod resolver
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
  });

  // Tasks 33 & 34: Submit booking then redirect to Geidea payment
  const onSubmit = async (data: BookingFormData) => {
    setSubmitError('');
    setStep('submitting');

    try {
      // Task 33: Create booking — status starts as pending
      const bookingRes = await createBooking({
        ...data,
        email: data.email || undefined,
        amount: CONSULTATION_FEE,
      });

      const bookingId = bookingRes.data._id;

      setStep('redirecting');

      // Task 34: Create Geidea payment session and redirect
      const paymentRes = await createPaymentSession(bookingId);
      window.location.href = paymentRes.data.checkoutUrl;
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong');
      setStep('form');
    }
  };

  const isLoading = step !== 'form';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href={`/${locale}`}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
            {nav('home')}
          </Link>
          <LanguageSwitch />
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
            <CalendarCheck className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-white">{t('title')}</h1>
          <p className="text-slate-400 mt-1 text-sm">{t('subtitle')}</p>
        </motion.div>

        {/* Form card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm p-6 md:p-8"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Patient Name */}
            <div className="space-y-1.5">
              <Label className="text-slate-300 flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-primary" />
                {t('fields.name')}
              </Label>
              <Input
                {...register('patientName')}
                placeholder={t('placeholders.name')}
                className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-primary"
              />
              {errors.patientName && (
                <p className="text-xs text-red-400">{errors.patientName.message}</p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <Label className="text-slate-300 flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-primary" />
                {t('fields.phone')}
              </Label>
              <Input
                {...register('phone')}
                type="tel"
                dir="ltr"
                placeholder={t('placeholders.phone')}
                className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-primary"
              />
              {errors.phone && (
                <p className="text-xs text-red-400">{errors.phone.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label className="text-slate-300 flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-primary" />
                {t('fields.email')}
              </Label>
              <Input
                {...register('email')}
                type="email"
                placeholder={t('placeholders.email')}
                className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-primary"
              />
              {errors.email && (
                <p className="text-xs text-red-400">{errors.email.message}</p>
              )}
            </div>

            {/* Date + Time row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-slate-300 flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-primary" />
                  {t('fields.date')}
                </Label>
                <Input
                  {...register('appointmentDate')}
                  type="date"
                  min={todayStr}
                  className="bg-slate-800/50 border-slate-700 text-white focus-visible:ring-primary [color-scheme:dark]"
                />
                {errors.appointmentDate && (
                  <p className="text-xs text-red-400">{errors.appointmentDate.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-300 flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  {t('fields.time')}
                </Label>
                <select
                  {...register('appointmentTime')}
                  className="flex h-9 w-full rounded-md border border-slate-700 bg-slate-800/50 px-3 py-1 text-sm text-white shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="">--:--</option>
                  {TIME_SLOTS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                {errors.appointmentTime && (
                  <p className="text-xs text-red-400">{errors.appointmentTime.message}</p>
                )}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label className="text-slate-300 flex items-center gap-2">
                <FileText className="h-3.5 w-3.5 text-primary" />
                {t('fields.notes')}
              </Label>
              <textarea
                {...register('notes')}
                rows={3}
                placeholder={t('placeholders.notes')}
                className="flex w-full rounded-md border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm text-white placeholder:text-slate-500 shadow-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              />
            </div>

            {/* Consultation fee display */}
            <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-slate-300">
                {locale === 'ar' ? 'رسوم الاستشارة' : 'Consultation Fee'}
              </span>
              <span className="font-bold text-primary text-lg">EGP {CONSULTATION_FEE}</span>
            </div>

            {/* Error */}
            {submitError && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-red-400 bg-red-400/10 rounded-md px-3 py-2"
              >
                {submitError}
              </motion.p>
            )}

            {/* Submit */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-semibold text-base"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {step === 'submitting'
                    ? (locale === 'ar' ? 'جارٍ إنشاء الحجز...' : 'Creating booking...')
                    : (locale === 'ar' ? 'جارٍ التحويل للدفع...' : 'Redirecting to payment...')}
                </span>
              ) : (
                t('submit')
              )}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
