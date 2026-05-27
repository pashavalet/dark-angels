import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, Outlet } from 'react-router-dom';
import { useTelegram, getTelegram } from '../../lib/telegram.js';
import { useTelegramAuth } from '../../api/telegram.js';
import { useAuthStore } from '../../stores/auth.js';
import { useLocaleStore } from '../../stores/locale.js';
import type { SupportedLocale } from '../../stores/locale.js';
import i18n from '../../i18n/index.js';
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
  const setTelegramSession = useAuthStore((s) => s.setTelegramSession);
  const { locale, setLocale } = useLocaleStore();

  useEffect(() => {
    ready();
    expand();
  }, []);

  useEffect(() => {
    const t = getTelegram();
    if (!t) return;

    const tp = t.themeParams;
    const docEl = document.documentElement;
    if (tp?.bg_color) docEl.style.setProperty('--tg-bg', tp.bg_color);
    if (tp?.text_color) docEl.style.setProperty('--tg-text', tp.text_color);
    if (tp?.button_color) docEl.style.setProperty('--tg-button', tp.button_color);
    if (tp?.button_text_color) docEl.style.setProperty('--tg-button-text', tp.button_text_color);
    if (tp?.secondary_bg_color) docEl.style.setProperty('--tg-secondary-bg', tp.secondary_bg_color);

    const handleTheme = () => {
      const updatedTg = getTelegram();
      if (!updatedTg) return;
      const newTp = updatedTg.themeParams;
      if (newTp?.bg_color) docEl.style.setProperty('--tg-bg', newTp.bg_color);
      if (newTp?.text_color) docEl.style.setProperty('--tg-text', newTp.text_color);
      if (newTp?.button_color) docEl.style.setProperty('--tg-button', newTp.button_color);
      if (newTp?.button_text_color) docEl.style.setProperty('--tg-button-text', newTp.button_text_color);
      if (newTp?.secondary_bg_color) docEl.style.setProperty('--tg-secondary-bg', newTp.secondary_bg_color);
    };

    t.onEvent('themeChanged', handleTheme);
    return () => {
      t.offEvent('themeChanged', handleTheme);
    };
  }, []);

  useEffect(() => {
    const t = getTelegram();
    const tgUser = t?.initDataUnsafe?.user;
    if (tgUser?.language_code && !locale) {
      const supported = ['ru', 'en', 'kk', 'uz', 'ky', 'uk'];
      const lang = tgUser.language_code.slice(0, 2);
      if (supported.includes(lang)) {
        setLocale(lang as SupportedLocale);
        i18n.changeLanguage(lang);
      }
    }
  }, []);

  useEffect(() => {
    const t = getTelegram();
    if (!t?.initDataUnsafe?.user) return;
    if (telegramAuth.isPending) return;

    const rawInitData = t.initData;
    if (!rawInitData) return;

    telegramAuth.mutate(rawInitData, {
      onSuccess: (data) => {
        setTelegramSession(
          data.access_token,
          data.user.telegram_id,
          data.user.username,
          data.user.is_subscribed,
          data.user.is_admin,
        );
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
