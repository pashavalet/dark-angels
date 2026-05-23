import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTours, useDeleteTour, useUpdateTour } from '../../api/tours.js';
import { useLocalized } from '../../hooks/useLocalized.js';
import VipBadge from '../../components/ui/VipBadge.js';
import type { Tour } from '@dark-angels/types';

export default function TourAdminListPage() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const { data, isLoading } = useTours({ limit: 100 });
  const deleteMutation = useDeleteTour();
  const updateMutation = useUpdateTour();

  const tours: Tour[] = data?.data ?? [];

  const handleDelete = useCallback(
    (tour: Tour) => {
      if (!confirm(t('delete_confirm'))) return;
      deleteMutation.mutate(tour.id);
    },
    [deleteMutation, t],
  );

  const handleTogglePublish = useCallback(
    (tour: Tour) => {
      updateMutation.mutate({ id: tour.id, is_published: !tour.is_published });
    },
    [updateMutation],
  );

  return (
    <div className="flex flex-col gap-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl font-bold text-accent">{t('all_tours')}</h1>
        <button
          onClick={() => navigate('/admin/tours/new')}
          className="min-h-[44px] min-w-[44px] rounded-lg px-6 py-2.5 text-sm font-medium bg-accent text-bg-primary hover:opacity-90 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
        >
          {t('create_tour')}
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-bg-card animate-pulse" />
          ))}
        </div>
      ) : tours.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-center text-text-muted">
          <p>{t('no_tours')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tours.map((tour) => (
            <TourRow
              key={tour.id}
              tour={tour}
              onEdit={() => navigate(`/admin/tours/${tour.id}`)}
              onDelete={() => handleDelete(tour)}
              onTogglePublish={() => handleTogglePublish(tour)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TourRow({
  tour,
  onEdit,
  onDelete,
  onTogglePublish,
}: {
  tour: Tour;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePublish: () => void;
}) {
  const { t } = useTranslation('common');
  const title = useLocalized(tour.title);

  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-bg-card p-4">
      {tour.image_url ? (
        <img
          src={tour.image_url}
          alt=""
          className="h-10 w-10 shrink-0 rounded-lg object-cover"
        />
      ) : (
        <div className="h-10 w-10 shrink-0 rounded-lg bg-bg-elevated" />
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-text-primary truncate">{title}</p>
          {tour.is_vip && <VipBadge level="vip" />}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span
            className={`shrink-0 text-xs ${
              tour.is_published ? 'text-green-400' : 'text-text-muted'
            }`}
          >
            {tour.is_published ? t('published') : t('draft')}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onTogglePublish();
          }}
          className="min-h-[44px] min-w-[44px] rounded-lg px-3 py-2 text-xs font-medium border border-border text-text-secondary hover:border-accent/30 transition-colors focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
        >
          {tour.is_published ? t('unpublish') : t('publish')}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="min-h-[44px] min-w-[44px] rounded-lg px-3 py-2 text-xs font-medium border border-border text-text-secondary hover:border-accent/30 transition-colors focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
        >
          {t('edit')}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="min-h-[44px] min-w-[44px] rounded-lg px-3 py-2 text-xs font-medium border border-red-500/40 text-red-400 hover:bg-red-500/10 transition-colors focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
        >
          {t('delete')}
        </button>
      </div>
    </div>
  );
}
