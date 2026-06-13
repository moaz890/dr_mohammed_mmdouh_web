'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { Search, Filter, CalendarDays, RefreshCw } from 'lucide-react';
import { fetchAllBookings, updateBooking, type Booking } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// ── Status badge mapping ──────────────────────────────────────────────────────
function BookingStatusBadge({ status }: { status: string }) {
  const t = useTranslations('admin.status');
  const variants: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'secondary'> = {
    confirmed: 'success',
    pending: 'warning',
    cancelled: 'danger',
    paid: 'success',
    failed: 'danger',
  };
  return <Badge variant={variants[status] || 'secondary'}>{t(status as 'pending')}</Badge>;
}

// ── Row animation container ───────────────────────────────────────────────────
const rowVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.04, duration: 0.3 },
  }),
};

export default function DashboardPage() {
  const t = useTranslations('admin');
  const locale = useLocale();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [bookingFilter, setBookingFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadBookings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchAllBookings({
        search: search || undefined,
        bookingStatus: bookingFilter || undefined,
        paymentStatus: paymentFilter || undefined,
      });
      setBookings(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, bookingFilter, paymentFilter]);

  // Reload when filters change (with debounce on search)
  useEffect(() => {
    const t = setTimeout(() => loadBookings(), search ? 400 : 0);
    return () => clearTimeout(t);
  }, [loadBookings, search]);

  // Task 27: Update booking status inline from the table
  const handleStatusUpdate = async (id: string, bookingStatus: string) => {
    setUpdatingId(id);
    try {
      await updateBooking(id, { bookingStatus });
      setBookings((prev) =>
        prev.map((b) => (b._id === id ? { ...b, bookingStatus: bookingStatus as Booking['bookingStatus'] } : b))
      );
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <CalendarDays className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white">{t('allBookings')}</h1>
            <p className="text-sm text-slate-400">{t('totalBookings')}: {bookings.length}</p>
          </div>
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={loadBookings}
          className="text-slate-400 hover:text-white"
        >
          <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
        </Button>
      </div>

      {/* Task 28: Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('search')}
            className="ps-9 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400 flex-shrink-0" />
          <select
            value={bookingFilter}
            onChange={(e) => setBookingFilter(e.target.value)}
            className="h-9 rounded-md border border-slate-700 bg-slate-800 text-sm text-white px-2 focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">{t('allStatuses')}</option>
            <option value="pending">{t('status.pending')}</option>
            <option value="confirmed">{t('status.confirmed')}</option>
            <option value="cancelled">{t('status.cancelled')}</option>
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="h-9 rounded-md border border-slate-700 bg-slate-800 text-sm text-white px-2 focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">{t('allStatuses')}</option>
            <option value="paid">{t('status.paid')}</option>
            <option value="pending">{t('status.pending')}</option>
            <option value="failed">{t('status.failed')}</option>
          </select>
        </div>
      </div>

      {/* Task 25: Bookings Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-800/50">
                {['patient', 'phone', 'date', 'time', 'paymentStatus', 'bookingStatus', 'actions'].map((col) => (
                  <th
                    key={col}
                    className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wider text-slate-400"
                  >
                    {t(`columns.${col}` as 'columns.patient')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                // Skeleton rows while loading
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-slate-800/50">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 rounded bg-slate-800 animate-pulse" style={{ width: `${60 + Math.random() * 40}%` }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                    {t('noBookings')}
                  </td>
                </tr>
              ) : (
                bookings.map((booking, i) => (
                  <motion.tr
                    key={booking._id}
                    custom={i}
                    initial="hidden"
                    animate="visible"
                    variants={rowVariants}
                    className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-white">{booking.patientName}</td>
                    <td className="px-4 py-3 text-slate-300 font-mono text-xs">{booking.phone}</td>
                    <td className="px-4 py-3 text-slate-300">{booking.appointmentDate}</td>
                    <td className="px-4 py-3 text-slate-300">{booking.appointmentTime}</td>
                    <td className="px-4 py-3"><BookingStatusBadge status={booking.paymentStatus} /></td>
                    <td className="px-4 py-3">
                      {/* Inline status selector — Task 27 */}
                      <select
                        value={booking.bookingStatus}
                        disabled={updatingId === booking._id}
                        onChange={(e) => handleStatusUpdate(booking._id, e.target.value)}
                        className="h-7 rounded-md border border-slate-700 bg-slate-800 text-xs text-white px-2 focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                      >
                        <option value="pending">{t('status.pending')}</option>
                        <option value="confirmed">{t('status.confirmed')}</option>
                        <option value="cancelled">{t('status.cancelled')}</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/${locale}/admin/dashboard/${booking._id}`}
                        className="text-primary hover:underline text-xs font-medium"
                      >
                        {t('viewDetails')}
                      </Link>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
