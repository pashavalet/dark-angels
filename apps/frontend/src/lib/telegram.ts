interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

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
    setParams: (params: { color?: string; text_color?: string }) => void;
  };
  BackButton: {
    show: () => void;
    hide: () => void;
    onClick: (fn: () => void) => void;
    offClick: (fn: () => void) => void;
  };
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy') => void;
    notificationOccurred: (type: 'success' | 'warning' | 'error') => void;
    selectionChanged: () => void;
  };
  themeParams: Record<string, string>;
  initDataUnsafe: {
    user?: TelegramUser;
    query_id?: string;
  };
  initData: string;
  colorScheme: 'light' | 'dark';
  platform: string;
  onEvent: (event: string, callback: () => void) => void;
  offEvent: (event: string, callback: () => void) => void;
  SettingsButton: {
    show: () => void;
    hide: () => void;
    onClick: (fn: () => void) => void;
  };
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

export function isInTelegram(): boolean {
  return !!getTelegram();
}

export function getInitData(): string {
  return getTelegram()?.initData ?? '';
}

export function getTelegramUser(): TelegramUser | null {
  return getTelegram()?.initDataUnsafe?.user ?? null;
}

export function useTelegram() {
  const tg = getTelegram();

  if (!tg) {
    return {
      tg: null,
      user: null,
      initData: '',
      ready: () => {},
      expand: () => {},
      close: () => {},
    };
  }

  return {
    tg,
    user: tg.initDataUnsafe.user ?? null,
    initData: tg.initData,
    ready: () => tg.ready(),
    expand: () => tg.expand(),
    close: () => tg.close(),
  };
}