import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useTours } from '../../api/tours.js';
import { useServices } from '../../api/services.js';
import { useBlogs } from '../../api/blogs.js';
import TourCard from '../../components/tours/TourCard.js';
import ServiceCard from '../../components/services/ServiceCard.js';
import BlogCard from '../../components/blog/BlogCard.js';
import HorizontalCarousel from '../../components/homepage/HorizontalCarousel.js';

const HOMEPAGE_FETCH_LIMIT = 20;
const HOMEPAGE_DISPLAY_LIMIT = 6;
const DAY_MS = 24 * 60 * 60 * 1000;

function isRecent(createdAt: string) {
  return Date.now() - new Date(createdAt).getTime() < DAY_MS;
}

function sortFeatured<T extends { is_vip?: boolean; access_level?: string; created_at: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const aVip = a.is_vip === true || a.access_level === 'vip' ? 1 : 0;
    const bVip = b.is_vip === true || b.access_level === 'vip' ? 1 : 0;
    if (aVip !== bVip) return bVip - aVip;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  }).slice(0, HOMEPAGE_DISPLAY_LIMIT);
}

export default function HomePage() {
  const { t } = useTranslation('common');
  const { data: toursData, isLoading: toursLoading } = useTours({ limit: HOMEPAGE_FETCH_LIMIT });
  const { data: servicesData, isLoading: servicesLoading } = useServices({ limit: HOMEPAGE_FETCH_LIMIT });
  const { data: blogsData, isLoading: blogsLoading } = useBlogs({ limit: HOMEPAGE_FETCH_LIMIT });

  const allTours = toursData?.data ?? [];
  const allServices = servicesData?.data ?? [];
  const allBlogs = blogsData?.data ?? [];

  const tours = useMemo(() => sortFeatured(allTours.filter(t => t.is_vip || isRecent(t.created_at))), [allTours]);
  const services = useMemo(() => sortFeatured(allServices.filter(s => isRecent(s.created_at))), [allServices]);
  const blog = useMemo(() => sortFeatured(allBlogs.filter(b => b.access_level === 'vip' || isRecent(b.created_at))), [allBlogs]);

  return (
    <div className="flex flex-col gap-2 pb-4">
      <section className="flex flex-col items-center justify-center gap-4 px-4 py-12 text-center">
        <h1 className="font-serif text-4xl font-bold tracking-tight text-accent sm:text-5xl">
          Dark Angels
        </h1>
        <p className="text-text-secondary text-lg max-w-md">
          {t('tagline')}
        </p>
      </section>

      <HorizontalCarousel
        title={t('new_tours')}
        items={tours}
        renderItem={(item: any) => (
          <TourCard tour={item} to={`/tours/${item.id}`} compact />
        )}
        emptyMessage={t('no_new_tours')}
        isLoading={toursLoading}
        compact
      />

      <HorizontalCarousel
        title={t('new_services')}
        items={services}
        renderItem={(item: any) => (
          <ServiceCard service={item} to={`/services/${item.id}`} compact />
        )}
        emptyMessage={t('no_new_services')}
        isLoading={servicesLoading}
        compact
      />

      <HorizontalCarousel
        title={t('new_blog')}
        items={blog}
        renderItem={(item: any) => (
          <BlogCard article={item} to={`/blog/${item.id}`} compact />
        )}
        emptyMessage={t('no_new_blog')}
        isLoading={blogsLoading}
        compact
      />
    </div>
  );
}