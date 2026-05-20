import { useState } from 'react';
import { useTelegram } from './lib/telegram.js';
import { cn } from './lib/cn.js';

export default function App() {
  const { user, expand, ready } = useTelegram();
  const [count, setCount] = useState(0);

  useState(() => {
    ready();
    expand();
  });

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 p-4">
      <h1 className="text-2xl font-bold text-accent">Dark Angels</h1>

      {user && (
        <p className="text-text-secondary">
          Welcome, {user.first_name}
        </p>
      )}

      <button
        onClick={() => setCount((c) => c + 1)}
        className={cn(
          'rounded-lg bg-accent px-6 py-3 text-bg-primary font-semibold',
          'transition-opacity hover:opacity-90 active:opacity-80',
        )}
      >
        Count: {count}
      </button>
    </div>
  );
}