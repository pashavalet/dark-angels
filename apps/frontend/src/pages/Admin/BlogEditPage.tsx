import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useBlog, useCreateBlog, useUpdateBlog, useDeleteBlog } from '../../api/blogs.js';
import type { BlogInput } from '../../api/blogs.js';
import type { LocalizedString, AccessLevel } from '@dark-angels/types';
import LocalizedField from '../../components/ui/LocalizedField.js';
import ImageUploader from '../../components/ui/ImageUploader.js';
import AdminFormLayout from '../../components/admin/AdminFormLayout.js';

interface FormState {
  title: LocalizedString;
  content: LocalizedString;
  preview_image: string | null;
  tags: string;
  hidden_vip: boolean;
  access_level: AccessLevel;
  requires_subscription: boolean;
}

const EMPTY_LOCALIZED: LocalizedString = { ru: '', en: '' };

const INITIAL_FORM: FormState = {
  title: { ...EMPTY_LOCALIZED },
  content: { ...EMPTY_LOCALIZED },
  preview_image: null,
  tags: '',
  hidden_vip: false,
  access_level: 'public',
  requires_subscription: false,
};

const ACCESS_LEVELS: AccessLevel[] = ['public', 'vip', 'premium', 'invite'];

export default function BlogEditPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation('common');
  const isEdit = !!id;

  const { data: blogData, isLoading } = useBlog(id ?? '');
  const createMutation = useCreateBlog();
  const updateMutation = useUpdateBlog();
  const deleteMutation = useDeleteBlog();

  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  if (isEdit && blogData?.data && !initialized) {
    const d = blogData.data;
    setForm({
      title: { ru: d.title.ru, en: d.title.en },
      content: { ru: d.content.ru, en: d.content.en },
      preview_image: d.preview_image ?? null,
      tags: (d.tags ?? []).join(', '),
      hidden_vip: d.hidden_vip,
      access_level: d.access_level,
      requires_subscription: d.requires_subscription ?? false,
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
      { field: 'content.ru', value: form.content.ru },
      { field: 'content.en', value: form.content.en },
    ];
    const empty = required.filter((r) => !r.value?.trim());
    if (empty.length > 0) {
      setError(`Required fields empty: ${empty.map((e) => e.field).join(', ')}`);
      return false;
    }
    return true;
  }, [form]);

  const buildInput = useCallback((): BlogInput => {
    const tags = form.tags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    return {
      title: form.title,
      content: form.content,
      preview_image: form.preview_image,
      tags,
      hidden_vip: form.hidden_vip,
      access_level: form.access_level,
      requires_subscription: form.requires_subscription,
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
        navigate('/admin/blog');
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
      navigate('/admin/blog');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.message ?? t('delete_error'));
    }
  }, [id, deleteMutation, navigate, t]);

  const saving = createMutation.isPending || updateMutation.isPending || uploadingImage;
  const deleting = deleteMutation.isPending;

  return (
    <AdminFormLayout
      title={isEdit ? t('edit_article') : t('create_article')}
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
          label={`${t('content_label')} *`}
          value={form.content}
          onChange={(v) => updateField('content', v)}
          multiline
          rows={12}
        />

        <div className="space-y-2">
          <label className="text-sm font-medium text-text-secondary">{t('preview_image')}</label>
<ImageUploader
  value={form.preview_image ?? undefined}
  onChange={(url) => updateField('preview_image', url)}
  onUploadingChange={setUploadingImage}
/>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-text-secondary">{t('tags_label')}</label>
          <input
            type="text"
            value={form.tags}
            onChange={(e) => updateField('tags', e.target.value)}
            placeholder="luxury, exclusive, vip"
            className="w-full rounded-lg border border-border bg-bg-elevated px-4 py-3 text-sm text-text-primary placeholder:text-text-muted/50 transition-colors focus:border-accent/50 focus:outline-none focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
          />
          <p className="text-xs text-text-muted">{t('tags_hint')}</p>
        </div>

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

        <div className="space-y-2">
          <label className="text-sm font-medium text-text-secondary">{t('access_level')}</label>
          <select
            value={form.access_level}
            onChange={(e) => updateField('access_level', e.target.value as AccessLevel)}
            className="w-full rounded-lg border border-border bg-bg-elevated px-4 py-3 text-sm text-text-primary transition-colors focus:border-accent/50 focus:outline-none focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
          >
            {ACCESS_LEVELS.map((level) => (
              <option key={level} value={level}>
                {t(level)}
              </option>
            ))}
          </select>
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
