'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, CalendarDays, LogOut, Menu, X, Stethoscope } from 'lucide-react';
import { LanguageSwitch } from '@/components/LanguageSwitch';
import { getToken, removeToken } from '@/lib/api';
import { cn } from '@/lib/utils';

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations('admin');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Guard: redirect to login if no token
  useEffect(() => {
    if (!getToken()) router.replace(`/${locale}/admin/login`);
  }, [locale, router]);

  const handleLogout = () => {
    removeToken();
    router.push(`/${locale}/admin/login`);
  };

  const navItems = [
    {
      href: `/${locale}/admin/dashboard`,
      label: t('allBookings'),
      icon: CalendarDays,
    },
  ];

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <aside
      className={cn(
        'flex flex-col bg-[hsl(var(--sidebar))] border-e border-[hsl(var(--sidebar-border))]',
        mobile ? 'w-64 h-full' : 'hidden lg:flex w-64 min-h-screen'
      )}
    >
      {/* Brand */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-[hsl(var(--sidebar-border))]">
        <div className="w-9 h-9 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
          <Stethoscope className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold text-[hsl(var(--sidebar-foreground))]">Clinic</p>
          <p className="text-xs text-slate-400">{t('dashboard')}</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const active = pathname.includes('/dashboard');
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                active
                  ? 'bg-primary/20 text-primary'
                  : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
              )}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-[hsl(var(--sidebar-border))]">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {t('logout')}
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex min-h-screen bg-slate-950">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 lg:hidden"
            />
            <motion.div
              initial={{ x: locale === 'ar' ? '100%' : '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: locale === 'ar' ? '100%' : '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 start-0 z-50 lg:hidden"
            >
              <Sidebar mobile />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 flex items-center justify-between h-14 px-4 bg-slate-900/80 backdrop-blur-sm border-b border-slate-800">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden text-slate-400 hover:text-white transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden lg:flex items-center gap-1.5 text-sm text-slate-400">
              <LayoutDashboard className="h-4 w-4" />
              <span>{t('dashboard')}</span>
            </div>
          </div>
          {/* Language switch in navbar */}
          <LanguageSwitch />
        </header>

        {/* Page content */}
        <motion.main
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex-1 p-6"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
