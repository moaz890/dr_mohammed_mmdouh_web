'use client';

import { useEffect, useState } from 'react';
import { use } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Phone, Mail, Calendar, Clock, CreditCard, Hash, FileText } from 'lucide-react';
import { fetchBookingById, updateBooking, type Booking } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function StatusBadge({ status }: { status: string }) {
  const t = useTranslations('admin.status');
  const map: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
    confirmed: 'success', paid: 'success',
    pending: 'warning',
    cancelled: 'danger', failed: 'danger',
  };
  return <Badge variant={map[status] || 'secondary'}>{t(status as 'pending')}</Badge>;
}

function DetailRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-800 last:border-0">
      <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div>
        <p className="text-xs text-slate-500 mb-0.5">{label}</p>
        <p className="text-sm font-medium text-white">{value}</p>
      </div>
    </div>
  );
}

export default function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const t = useTranslations('admin');
  const locale = useLocale();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchBookingById(id)
      .then((res) => setBooking(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleUpdate = async () => {
    if (!updatingStatus || !booking) return;
    setUpdating(true);
    try {
      const res = await updateBooking(id, { bookingStatus: updatingStatus });
      setBooking(res.data);
      setUpdatingStatus('');
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 max-w-2xl">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-32 rounded-xl bg-slate-800 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="text-center py-20 text-slate-400">
        <p>Booking not found</p>
        <Link href={`/${locale}/admin/dashboard`} className="text-primary hover:underline text-sm mt-2 inline-block">
          {t('back')}
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-2xl space-y-6"
    >
      {/* Back button */}
      <Link
        href={`/${locale}/admin/dashboard`}
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
        {t('back')}
      </Link>

      {/* Header card */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="text-white text-lg">{t('bookingDetails')}</CardTitle>
            <div className="flex gap-2 flex-wrap">
              <StatusBadge status={booking.paymentStatus} />
              <StatusBadge status={booking.bookingStatus} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DetailRow icon={User} label={t('columns.patient')} value={booking.patientName} />
          <DetailRow icon={Phone} label={t('columns.phone')} value={booking.phone} />
          <DetailRow icon={Mail} label="Email" value={booking.email} />
          <DetailRow icon={Calendar} label={t('columns.date')} value={booking.appointmentDate} />
          <DetailRow icon={Clock} label={t('columns.time')} value={booking.appointmentTime} />
          <DetailRow icon={CreditCard} label={t('amount')} value={booking.amount ? `EGP ${booking.amount}` : undefined} />
          <DetailRow icon={Hash} label={t('transactionId')} value={booking.transactionId} />
          <DetailRow icon={FileText} label={t('notes')} value={booking.notes} />
        </CardContent>
      </Card>

      {/* Task 27: Status update panel */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-base">{t('updateStatus')}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-3 flex-wrap">
          <select
            value={updatingStatus || booking.bookingStatus}
            onChange={(e) => setUpdatingStatus(e.target.value)}
            className="h-9 flex-1 rounded-md border border-slate-700 bg-slate-800 text-sm text-white px-3 focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="pending">{t('status.pending')}</option>
            <option value="confirmed">{t('status.confirmed')}</option>
            <option value="cancelled">{t('status.cancelled')}</option>
          </select>
          <Button
            onClick={handleUpdate}
            disabled={updating || !updatingStatus || updatingStatus === booking.bookingStatus}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            {updating ? t('updating') : t('updateStatus')}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
