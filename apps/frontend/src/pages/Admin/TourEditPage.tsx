import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AdminFormLayout from '../../components/admin/AdminFormLayout.js';
import LocalizedField from '../../components/ui/LocalizedField.js';
import ImageUploader from '../../components/ui/ImageUploader.js';
import { useTour, useCreateTour, useUpdateTour, useDeleteTour } from '../../api/tours.js';
import type { TourInput } from '../../api/tours.js';
import type { LocalizedString } from '@dark-angels/types';

interface FormState {
  title: LocalizedString;
  description: LocalizedString;
  country: LocalizedString;
  city: LocalizedString;
  agency: LocalizedString;
  earnings: string;
  contacts: string;
  is_vip: boolean;
  hidden_vip: boolean;
  requires_subscription: boolean;
  tags: string;
  image_url: string | null;
}

const EMPTY_LOCALIZED: LocalizedString = { ru: '', en: '' };

const INITIAL_FORM: FormState = {
  title: { ...EMPTY_LOCALIZED },
  description: { ...EMPTY_LOCALIZED },
  country: { ...EMPTY_LOCALIZED },
  city: { ...EMPTY_LOCALIZED },
  agency: { ...EMPTY_LOCALIZED },
  earnings: '',
  contacts: '',
  is_vip: false,
  hidden_vip: false,
  requires_subscription: false,
  tags: '',
  image_url: null,
};

export default function TourEditPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation('common');
  const isEdit = !!id;

  const { data: tourData, isLoading } = useTour(id ?? '');
  const createMutation = useCreateTour();
  const updateMutation = useUpdateTour();
  const deleteMutation = useDeleteTour();

  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  if (isEdit && tourData?.data && !initialized) {
    const d = tourData.data;
    setForm({
      title: { ru: d.title.ru, en: d.title.en },
      description: { ru: d.description.ru, en: d.description.en },
      country: { ru: d.country.ru, en: d.country.en },
      city: { ru: d.city.ru, en: d.city.en },
      agency: { ru: d.agency.ru, en: d.agency.en },
      earnings: d.earnings ?? '',
      contacts: d.contacts ?? '',
      is_vip: d.is_vip,
      hidden_vip: d.hidden_vip,
      requires_subscription: d.requires_subscription ?? false,
      tags: (d.tags ?? []).join(', '),
      image_url: d.image_url ?? null,
    });
    setInitialized(true);
  }

  const updateField = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError(null);
  }, []);

  const validate = useCallback((): boolean => {
    const required: { field: string; value: string | undefined }[] = [
      { field: 'title.ru', value: form.title.ru },
      { field: 'title.en', value: form.title.en },
      { field: 'description.ru', value: form.description.ru },
      { field: 'description.en', value: form.description.en },
      { field: 'country.ru', value: form.country.ru },
      { field: 'country.en', value: form.country.en },
    ];
    const empty = required.filter((r) => !r.value?.trim());
    if (empty.length > 0) {
      setError(`Required fields empty: ${empty.map((e) => e.field).join(', ')}`);
      return false;
    }
    return true;
  }, [form]);

  const buildInput = useCallback((): TourInput => {
    const tags = form.tags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const input = {
      title: form.title,
      description: form.description,
      country: form.country,
      city: form.city,
      agency: form.agency,
      earnings: form.earnings || null,
      contacts: form.contacts || null,
      is_vip: form.is_vip,
      hidden_vip: form.hidden_vip,
      requires_subscription: form.requires_subscription,
      tags,
      image_url: form.image_url,
      sort_order: 0,
      is_published: false,
    };
    return input;
  }, [form]);

  const handleSave = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!validate()) return;
      try {
        if (isEdit) {
          await updateMutation.mutateAsync({ id: id!, ...buildInput() });
        } else {
          await createMutation.mutateAsync(buildInput());
        }
        navigate('/admin/tours');
      } catch (err: any) {
        setError(err?.response?.data?.message ?? err?.message ?? t('save_error'));
      }
    },
    [validate, isEdit, id, buildInput, updateMutation, createMutation, navigate, t],
  );

  const handleDelete = useCallback(async () => {
    if (!id) return;
    if (!confirm(t('delete_confirm'))) return;
    try {
      await deleteMutation.mutateAsync(id);
      navigate('/admin/tours');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.message ?? t('delete_error'));
    }
  }, [id, deleteMutation, navigate, t]);

  const saving = createMutation.isPending || updateMutation.isPending || uploadingImage;
  const deleting = deleteMutation.isPending;

  return (
    <AdminFormLayout
      title={isEdit ? t('edit_tour') : t('create_tour')}
      loading={isEdit && isLoading && !initialized}
      error={error}
    >
      <div className="space-y-6">
        <LocalizedField
          label={`${t('title')} *`}
          value={form.title}
          onChange={(v) => updateField('title', v)}
        />

        <LocalizedField
          label={`${t('description_label')} *`}
          value={form.description}
          onChange={(v) => updateField('description', v)}
          multiline
          rows={4}
        />

        <LocalizedField
          label={`${t('country')} *`}
          value={form.country}
          onChange={(v) => updateField('country', v)}
        />

        <LocalizedField
          label={t('city')}
          value={form.city}
          onChange={(v) => updateField('city', v)}
        />

        <LocalizedField
          label={t('agency')}
          value={form.agency}
          onChange={(v) => updateField('agency', v)}
        />

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary">{t('earnings')}</label>
            <input
              type="text"
              value={form.earnings}
              onChange={(e) => updateField('earnings', e.target.value)}
              className="w-full rounded-lg border border-border bg-bg-elevated px-4 py-3 text-sm text-text-primary placeholder:text-text-muted/50 transition-colors focus:border-accent/50 focus:outline-none focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
              placeholder="€10,000"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary">{t('contacts')}</label>
            <input
              type="text"
              value={form.contacts}
              onChange={(e) => updateField('contacts', e.target.value)}
              className="w-full rounded-lg border border-border bg-bg-elevated px-4 py-3 text-sm text-text-primary placeholder:text-text-muted/50 transition-colors focus:border-accent/50 focus:outline-none focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
              placeholder="@manager | https://t.me/manager"
            />
            <p className="text-xs text-text-muted">
              Формат: `@username`, `https://...` или `текст | ссылка`.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-text-secondary">{t('image')}</label>
<ImageUploader
  value={form.image_url ?? undefined}
  onChange={(url) => updateField('image_url', url)}
  onUploadingChange={setUploadingImage}
/>
        </div>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-3 min-h-[44px] min-w-[44px] cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_vip}
              onChange={(e) => updateField('is_vip', e.target.checked)}
              className="h-5 w-5 rounded border-border bg-bg-elevated text-accent focus:ring-accent focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
            />
            <span className="text-sm font-medium text-text-secondary">{t('is_vip')}</span>
          </label>

          <label className="flex items-center gap-3 min-h-[44px] min-w-[44px] cursor-pointer">
            <input
              type="checkbox"
              checked={form.hidden_vip}
              onChange={(e) => updateField('hidden_vip', e.target.checked)}
              className="h-5 w-5 rounded border-border bg-bg-elevated text-accent focus:ring-accent focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
            />
            <span className="text-sm font-medium text-text-secondary">{t('hidden_vip')}</span>
          </label>

          <label className="flex items-center gap-3 min-h-[44px] min-w-[44px] cursor-pointer">
            <input
              type="checkbox"
              checked={form.requires_subscription}
              onChange={(e) => updateField('requires_subscription', e.target.checked)}
              className="h-5 w-5 rounded border-border bg-bg-elevated text-accent focus:ring-accent focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
            />
            <span className="text-sm font-medium text-text-secondary">{t('requires_subscription')}</span>
          </label>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-text-secondary">{t('tags_label')}</label>
          <input
            type="text"
            value={form.tags}
            onChange={(e) => updateField('tags', e.target.value)}
            className="w-full rounded-lg border border-border bg-bg-elevated px-4 py-3 text-sm text-text-primary placeholder:text-text-muted/50 transition-colors focus:border-accent/50 focus:outline-none focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
            placeholder="luxury, vip, premium"
          />
          <p className="text-xs text-text-muted">{t('tags_hint')}</p>
        </div>

        <div className="flex items-center gap-3 pt-4">
          <button
            type="submit"
            disabled={saving || deleting}
            onClick={handleSave}
            className="min-h-[44px] min-w-[44px] rounded-lg px-6 py-2.5 text-sm font-medium bg-accent text-bg-primary hover:opacity-90 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
          >
            {saving ? t('saving') : t('save')}
          </button>

          {isEdit && (
            <button
              type="button"
              disabled={saving || deleting}
              onClick={handleDelete}
              className="min-h-[44px] min-w-[44px] rounded-lg px-4 py-2.5 text-sm font-medium border border-red-500/40 text-red-400 hover:bg-red-500/10 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
            >
              {deleting ? t('deleting') : t('delete')}
            </button>
          )}
        </div>
      </div>
    </AdminFormLayout>
  );
}
