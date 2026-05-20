interface TelegramWebApp {
  ready: () => void;
  expand: () => void;
  close: () => void;
  MainButton: {
    setText: (text: string) => void;
    show: () => void;
    hide: () => void;
    onClick: (fn: () => void) => void;
    offClick: (fn: () => void) => void;
    showProgress: () => void;
    hideProgress: () => void;
    enable: () => void;
    disable: () => void;
  };
  BackButton: {
    show: () => void;
    hide: () => void;
    onClick: (fn: () => void) => void;
  };
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy') => void;
    notificationOccurred: (type: 'success' | 'warning' | 'error') => void;
    selectionChanged: () => void;
  };
  themeParams: Record<string, string>;
  initDataUnsafe: {
    user?: {
      id: number;
      first_name: string;
      language_code?: string;
    };
    query_id?: string;
  };
  colorScheme: 'light' | 'dark';
  platform: string;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

export function getTelegram(): TelegramWebApp | null {
  return window.Telegram?.WebApp ?? null;
}

export function useTelegram() {
  const tg = getTelegram();

  if (!tg) {
    return {
      tg: null,
      user: null,
      ready: () => {},
      expand: () => {},
      close: () => {},
    };
  }

  return {
    tg,
    user: tg.initDataUnsafe.user ?? null,
    ready: () => tg.ready(),
    expand: () => tg.expand(),
    close: () => tg.close(),
  };
}