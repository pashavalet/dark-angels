import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AdminFormLayout from '../../components/admin/AdminFormLayout.js';
import LocalizedField from '../../components/ui/LocalizedField.js';
import ImageUploader from '../../components/ui/ImageUploader.js';
import { useService, useCreateService, useUpdateService, useDeleteService } from '../../api/services.js';
import type { ServiceInput } from '../../api/services.js';
import type { LocalizedString } from '@dark-angels/types';

interface FormState {
  title: LocalizedString;
  description: LocalizedString;
  price: string;
  contacts: string;
  requires_subscription: boolean;
  tags: string;
  image_url: string | null;
}

const EMPTY_LOCALIZED: LocalizedString = { ru: '', en: '' };

const INITIAL_FORM: FormState = {
  title: { ...EMPTY_LOCALIZED },
  description: { ...EMPTY_LOCALIZED },
  price: '',
  contacts: '',
  requires_subscription: false,
  tags: '',
  image_url: null,
};

export default function ServiceEditPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation('common');
  const isEdit = !!id;

  const { data: serviceData, isLoading } = useService(id ?? '');
  const createMutation = useCreateService();
  const updateMutation = useUpdateService();
  const deleteMutation = useDeleteService();

  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  if (isEdit && serviceData?.data && !initialized) {
    const d = serviceData.data;
    setForm({
      title: { ru: d.title.ru, en: d.title.en },
      description: { ru: d.description.ru, en: d.description.en },
      price: d.price ?? '',
      contacts: d.contacts ?? '',
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
    ];
    const empty = required.filter((r) => !r.value?.trim());
    if (empty.length > 0) {
      setError(`Required fields empty: ${empty.map((e) => e.field).join(', ')}`);
      return false;
    }
    return true;
  }, [form]);

  const buildInput = useCallback((): ServiceInput => {
    const tags = form.tags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    return {
      title: form.title,
      description: form.description,
      price: form.price || null,
      contacts: form.contacts || null,
      requires_subscription: form.requires_subscription,
      tags,
      image_url: form.image_url,
      sort_order: 0,
      is_published: false,
    };
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
        navigate('/admin/services');
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
      navigate('/admin/services');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.message ?? t('delete_error'));
    }
  }, [id, deleteMutation, navigate, t]);

  const saving = createMutation.isPending || updateMutation.isPending || uploadingImage;
  const deleting = deleteMutation.isPending;

  return (
    <AdminFormLayout
      title={isEdit ? t('edit_service') : t('create_service')}
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

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary">{t('price')}</label>
            <input
              type="text"
              value={form.price}
              onChange={(e) => updateField('price', e.target.value)}
              className="w-full rounded-lg border border-border bg-bg-elevated px-4 py-3 text-sm text-text-primary placeholder:text-text-muted/50 transition-colors focus:border-accent/50 focus:outline-none focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
              placeholder="$99"
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

        <label className="flex items-center gap-3 min-h-[44px] min-w-[44px] cursor-pointer">
          <input
            type="checkbox"
            checked={form.requires_subscription}
            onChange={(e) => updateField('requires_subscription', e.target.checked)}
            className="h-5 w-5 rounded border-border bg-bg-elevated text-accent focus:ring-accent focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
          />
          <span className="text-sm font-medium text-text-secondary">{t('requires_subscription')}</span>
        </label>

        <div className="space-y-2">
          <label className="text-sm font-medium text-text-secondary">{t('tags_label')}</label>
          <input
            type="text"
            value={form.tags}
            onChange={(e) => updateField('tags', e.target.value)}
            className="w-full rounded-lg border border-border bg-bg-elevated px-4 py-3 text-sm text-text-primary placeholder:text-text-muted/50 transition-colors focus:border-accent/50 focus:outline-none focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
            placeholder="massage, premium, exclusive"
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
