import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useServices, useDeleteService, useUpdateService } from '../../api/services.js';
import { useLocalized } from '../../hooks/useLocalized.js';
import type { Service } from '@dark-angels/types';

export default function ServiceAdminListPage() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const { data, isLoading } = useServices({ limit: 100 });
  const deleteMutation = useDeleteService();
  const updateMutation = useUpdateService();

  const services: Service[] = data?.data ?? [];

  const handleDelete = useCallback(
    (service: Service) => {
      if (!confirm(t('delete_confirm'))) return;
      deleteMutation.mutate(service.id);
    },
    [deleteMutation, t],
  );

  const handleTogglePublish = useCallback(
    (service: Service) => {
      updateMutation.mutate({ id: service.id, is_published: !service.is_published });
    },
    [updateMutation],
  );

  return (
    <div className="flex flex-col gap-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl font-bold text-accent">{t('all_services')}</h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="min-h-[44px] min-w-[44px] rounded-lg border border-border px-4 py-2.5 text-sm text-text-secondary hover:border-accent/30 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
          >
            {t('back')}
          </button>
          <button
            onClick={() => navigate('/admin/services/new')}
            className="min-h-[44px] min-w-[44px] rounded-lg px-6 py-2.5 text-sm font-medium bg-accent text-bg-primary hover:opacity-90 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
          >
            {t('create_service')}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-bg-card animate-pulse" />
          ))}
        </div>
      ) : services.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-center text-text-muted">
          <p>{t('no_services_yet')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {services.map((service) => (
            <ServiceRow
              key={service.id}
              service={service}
              onEdit={() => navigate(`/admin/services/${service.id}`)}
              onDelete={() => handleDelete(service)}
              onTogglePublish={() => handleTogglePublish(service)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ServiceRow({
  service,
  onEdit,
  onDelete,
  onTogglePublish,
}: {
  service: Service;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePublish: () => void;
}) {
  const { t } = useTranslation('common');
  const title = useLocalized(service.title);

  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-bg-card p-4">
      {service.image_url ? (
        <img
          src={service.image_url}
          alt=""
          className="h-10 w-10 shrink-0 rounded-lg object-cover"
        />
      ) : (
        <div className="h-10 w-10 shrink-0 rounded-lg bg-bg-elevated" />
      )}

      <div className="flex-1 min-w-0">
        <p className="font-medium text-text-primary truncate">{title}</p>
        <div className="flex items-center gap-2 mt-1">
          {service.price && (
            <span className="text-xs text-text-secondary">{service.price}</span>
          )}
          <span
            className={`shrink-0 text-xs ${
              service.is_published ? 'text-green-400' : 'text-text-muted'
            }`}
          >
            {service.is_published ? t('published') : t('draft')}
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
          {service.is_published ? t('unpublish') : t('publish')}
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
