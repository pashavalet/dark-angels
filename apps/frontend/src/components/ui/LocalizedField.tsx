import { useState } from 'react';
import type { LocalizedString } from '@dark-angels/types';

interface LocalizedFieldProps {
  label: string;
  value: LocalizedString;
  onChange: (value: LocalizedString) => void;
  multiline?: boolean;
  rows?: number;
}

const TABS: Array<{ key: keyof LocalizedString; label: string }> = [
  { key: 'ru', label: 'RU' },
  { key: 'en', label: 'EN' },
];

export default function LocalizedField({ label, value, onChange, multiline, rows }: LocalizedFieldProps) {
  const [activeTab, setActiveTab] = useState<keyof LocalizedString>('ru');

  const current = value?.[activeTab] ?? '';

  const handleChange = (val: string) => {
    onChange({ ...value, [activeTab]: val });
  };

  const inputClass =
    'w-full rounded-lg border border-border bg-bg-elevated px-4 py-3 text-sm text-text-primary placeholder:text-text-muted/50 transition-colors focus:border-accent/50 focus:outline-none focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2';

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-text-secondary">{label}</span>
        <div className="flex gap-1 rounded-lg border border-border bg-bg-primary p-0.5">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`min-h-[36px] min-w-[40px] rounded-md px-3 text-xs font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-accent/20 text-accent'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      {multiline ? (
        <textarea
          value={current}
          onChange={(e) => handleChange(e.target.value)}
          rows={rows ?? 4}
          className={inputClass}
        />
      ) : (
        <input
          type="text"
          value={current}
          onChange={(e) => handleChange(e.target.value)}
          className={inputClass}
        />
      )}
    </div>
  );
}
