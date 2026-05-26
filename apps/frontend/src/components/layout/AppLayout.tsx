import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, Outlet } from 'react-router-dom';
import { useTelegram, getTelegram } from '../../lib/telegram.js';
import { useTelegramAuth } from '../../api/telegram.js';
import { useAuthStore } from '../../stores/auth.js';
import BottomNav from './BottomNav.js';
import LanguageSwitcher from '../ui/LanguageSwitcher.js';

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  enter: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export default function AppLayout() {
  const location = useLocation();
  const { tg, expand, ready } = useTelegram();
  const showNav = !location.pathname.startsWith('/admin');
  const telegramAuth = useTelegramAuth();
  const setTelegramAuth = useAuthStore((s) => s.setTelegramAuth);

  useState(() => {
    ready();
    expand();
    if (tg) {
      document.documentElement.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color ?? '#0a0a0b');
      document.documentElement.style.setProperty('--tg-theme-text-color', tg.themeParams.text_color ?? '#f5f5f5');
    }
  });

  useEffect(() => {
    const t = getTelegram();
    if (!t?.initDataUnsafe?.user) return;
    if (telegramAuth.isPending) return;

    const existingToken = localStorage.getItem('tg_access_token');
    if (existingToken) return;

    const w = t as any;
    const rawInitData = w.initData ?? '';
    if (!rawInitData) return;

    telegramAuth.mutate(rawInitData, {
      onSuccess: (data) => {
        localStorage.setItem('tg_access_token', data.access_token);
        setTelegramAuth(data.user.telegram_id, data.user.username, data.user.is_subscribed);
      },
    });
  }, []);

  return (
    <div className="min-h-dvh bg-bg-primary">
      <div className={showNav ? 'pb-[72px]' : ''}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="enter"
            exit="exit"
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </div>
      {showNav && <BottomNav />}
      {showNav && <LanguageSwitcher />}
    </div>
  );
}