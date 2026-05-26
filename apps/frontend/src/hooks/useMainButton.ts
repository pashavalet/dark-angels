import { useEffect, useCallback, useRef } from 'react';
import { getTelegram } from '../lib/telegram.js';

export function useMainButton(text: string, onAction?: () => void, visible = false) {
  const onActionRef = useRef(onAction);
  onActionRef.current = onAction;

  useEffect(() => {
    const tg = getTelegram();
    if (!tg) return;

    if (visible) {
      tg.MainButton.setText(text);
      tg.MainButton.show();
      tg.MainButton.enable();
    } else {
      tg.MainButton.hide();
    }

    return () => {
      tg.MainButton.hide();
    };
  }, [text, visible]);

  useEffect(() => {
    const tg = getTelegram();
    if (!tg) return;

    const handler = () => onActionRef.current?.();
    tg.MainButton.onClick(handler);

    return () => {
      tg.MainButton.offClick(handler);
    };
  }, []);

  const setProgress = useCallback((loading: boolean) => {
    const tg = getTelegram();
    if (!tg) return;
    if (loading) {
      tg.MainButton.showProgress();
      tg.MainButton.disable();
    } else {
      tg.MainButton.hideProgress();
      tg.MainButton.enable();
    }
  }, []);

  const hide = useCallback(() => {
    getTelegram()?.MainButton.hide();
  }, []);

  return { setProgress, hide };
}