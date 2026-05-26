import { useEffect } from 'react';
import { getTelegram } from '../lib/telegram.js';

export function useBackButton(onBack?: () => void) {
  useEffect(() => {
    const tg = getTelegram();
    if (!tg) return;

    tg.BackButton.show();

    const handler = () => onBack?.();
    tg.BackButton.onClick(handler);

    return () => {
      tg.BackButton.offClick(handler);
      tg.BackButton.hide();
    };
  }, [onBack]);
}