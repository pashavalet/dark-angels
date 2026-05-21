import { useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useHomepageCollections, useReorderCollections, useSetCollections } from '../../api/homepage.js';
import { useLocalized } from '../../hooks/useLocalized.js';
import SortableList from '../../components/admin/SortableList.js';
import type { FeaturedTour, FeaturedService, FeaturedBlog } from '../../api/homepage.js';

type SectionKey = 'featured_tours' | 'featured_services' | 'featured_blog';
type FeaturedItem = FeaturedTour | FeaturedService | FeaturedBlog;

const sections: { key: SectionKey; labelKey: string }[] = [
  { key: 'featured_tours', labelKey: 'featured_tours' },
  { key: 'featured_services', labelKey: 'featured_services' },
  { key: 'featured_blog', labelKey: 'featured_blog' },
];

export default function CollectionsPage() {
  const { t } = useTranslation('common');
  const { data, isLoading } = useHomepageCollections();
  const reorderMutation = useReorderCollections();
  const setMutation = useSetCollections();
  const [section, setSection] = useState<SectionKey>('featured_tours');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const items: FeaturedItem[] = data?.[section] ?? [];

  const handleReorder = useCallback(
    (reordered: FeaturedItem[]) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        reorderMutation.mutate({
          section,
          orders: reordered.map((item, idx) => ({ id: item.id, sort_order: idx })),
        });
      }, 300);
    },
    [section, reorderMutation],
  );

  const handleTogglePin = useCallback(
    (item: FeaturedItem) => {
      setMutation.mutate({
        section,
        items: [{ id: item.id, is_pinned: !item.is_pinned }],
      });
    },
    [section, setMutation],
  );

  const handleRemove = useCallback(
    (item: FeaturedItem) => {
      setMutation.mutate({
        section,
        items: [{ id: item.id, _remove: true }],
      });
    },
    [section, setMutation],
  );

  return (
    <div className="flex flex-col gap-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl font-bold text-accent">{t('collections')}</h1>
        <p className="text-sm text-text-muted">{t('drag_to_reorder')}</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {sections.map(({ key, labelKey }) => (
          <button
            key={key}
            onClick={() => setSection(key)}
            className={`shrink-0 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors min-h-[44px] min-w-[44px] ${
              section === key
                ? 'bg-accent text-bg-primary'
                : 'border border-border bg-bg-card text-text-secondary hover:border-accent/30'
            }`}
          >
            {t(labelKey)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-bg-card animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-center text-text-muted">
          <p>{t('no_featured_tours')}</p>
        </div>
      ) : (
        <SortableList<FeaturedItem> items={items} onReorder={handleReorder} renderItem={(item) => (
          <CollectionRow
            item={item}
            onTogglePin={() => handleTogglePin(item)}
            onRemove={() => handleRemove(item)}
          />
        )} />
      )}
    </div>
  );
}

function CollectionRow({
  item,
  onTogglePin,
  onRemove,
}: {
  item: FeaturedItem;
  onTogglePin: () => void;
  onRemove: () => void;
}) {
  const title = useLocalized(item.title);

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-bg-card p-4 mb-2">
      <div className="flex items-center justify-center w-[44px] h-[44px] shrink-0 text-text-muted cursor-grab active:cursor-grabbing touch-none">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
          <circle cx="9" cy="5" r="1.5" />
          <circle cx="15" cy="5" r="1.5" />
          <circle cx="9" cy="12" r="1.5" />
          <circle cx="15" cy="12" r="1.5" />
          <circle cx="9" cy="19" r="1.5" />
          <circle cx="15" cy="19" r="1.5" />
        </svg>
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-text-primary truncate">{title}</p>
        <p className="text-xs text-text-muted">{item.id}</p>
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); onTogglePin(); }}
        className={`flex items-center justify-center w-[44px] h-[44px] rounded-lg transition-colors ${
          item.is_pinned ? 'text-accent' : 'text-text-muted hover:text-accent'
        }`}
        aria-label={item.is_pinned ? 'Unpin' : 'Pin'}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={item.is_pinned ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
        </svg>
      </button>

      <button
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        className="flex items-center justify-center w-[44px] h-[44px] rounded-lg text-text-muted hover:text-danger transition-colors"
        aria-label="Remove"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
        </svg>
      </button>
    </div>
  );
}
