import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, Outlet } from 'react-router-dom';
import { useTelegram } from '../../lib/telegram.js';
import BottomNav from './BottomNav.js';

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  enter: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export default function AppLayout() {
  const location = useLocation();
  const { tg, expand, ready } = useTelegram();
  const showNav = !location.pathname.startsWith('/admin');

  useState(() => {
    ready();
    expand();
    if (tg) {
      document.documentElement.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color ?? '#0a0a0b');
      document.documentElement.style.setProperty('--tg-theme-text-color', tg.themeParams.text_color ?? '#f5f5f5');
    }
  });

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
    </div>
  );
}

import { useState } from 'react';