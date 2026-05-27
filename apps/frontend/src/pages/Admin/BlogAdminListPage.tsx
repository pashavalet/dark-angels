import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useBlogs, useDeleteBlog, useUpdateBlog } from '../../api/blogs.js';
import { useLocalized } from '../../hooks/useLocalized.js';
import type { BlogArticle, AccessLevel } from '@dark-angels/types';

const LEVEL_COLORS: Record<AccessLevel, string> = {
  public: 'bg-gray-500/20 text-gray-400',
  vip: 'bg-yellow-500/20 text-yellow-400',
  premium: 'bg-purple-500/20 text-purple-400',
  invite: 'bg-blue-500/20 text-blue-400',
};

export default function BlogAdminListPage() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const { data, isLoading } = useBlogs({ limit: 100 });
  const deleteMutation = useDeleteBlog();
  const updateMutation = useUpdateBlog();

  const articles: BlogArticle[] = data?.data ?? [];

  const handleDelete = useCallback(
    (article: BlogArticle) => {
      if (!confirm(t('delete_confirm'))) return;
      deleteMutation.mutate(article.id);
    },
    [deleteMutation, t],
  );

  const handleTogglePublish = useCallback(
    (article: BlogArticle) => {
      updateMutation.mutate({ id: article.id, is_published: !article.is_published });
    },
    [updateMutation],
  );

  return (
    <div className="flex flex-col gap-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl font-bold text-accent">{t('all_articles')}</h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="min-h-[44px] min-w-[44px] rounded-lg border border-border px-4 py-2.5 text-sm text-text-secondary hover:border-accent/30 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
          >
            {t('back')}
          </button>
          <button
            onClick={() => navigate('/admin/blog/new')}
            className="min-h-[44px] min-w-[44px] rounded-lg px-6 py-2.5 text-sm font-medium bg-accent text-bg-primary hover:opacity-90 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
          >
            {t('create_article')}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-bg-card animate-pulse" />
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-center text-text-muted">
          <p>{t('no_articles_found')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {articles.map((article) => (
            <BlogRow
              key={article.id}
              article={article}
              onEdit={() => navigate(`/admin/blog/${article.id}`)}
              onDelete={() => handleDelete(article)}
              onTogglePublish={() => handleTogglePublish(article)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function BlogRow({
  article,
  onEdit,
  onDelete,
  onTogglePublish,
}: {
  article: BlogArticle;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePublish: () => void;
}) {
  const { t } = useTranslation('common');
  const title = useLocalized(article.title);
  const levelClass = LEVEL_COLORS[article.access_level] ?? LEVEL_COLORS.public;

  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-bg-card p-4">
      {article.preview_image ? (
        <img
          src={article.preview_image}
          alt=""
          className="h-10 w-10 shrink-0 rounded-lg object-cover"
        />
      ) : (
        <div className="h-10 w-10 shrink-0 rounded-lg bg-bg-elevated" />
      )}

      <div className="flex-1 min-w-0">
        <p className="font-medium text-text-primary truncate">{title}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${levelClass}`}>
            {t(article.access_level)}
          </span>
          <span
            className={`shrink-0 text-xs ${
              article.is_published ? 'text-green-400' : 'text-text-muted'
            }`}
          >
            {article.is_published ? t('published') : t('draft')}
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
          {article.is_published ? t('unpublish') : t('publish')}
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
