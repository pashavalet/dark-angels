import { useTranslation } from 'react-i18next';
import { useTours } from '../../api/tours.js';
import { useServices } from '../../api/services.js';
import { useBlogs } from '../../api/blogs.js';
import TourCard from '../../components/tours/TourCard.js';
import ServiceCard from '../../components/services/ServiceCard.js';
import BlogCard from '../../components/blog/BlogCard.js';
import HorizontalCarousel from '../../components/homepage/HorizontalCarousel.js';
import LanguageSwitcher from '../../components/ui/LanguageSwitcher.js';

const HOMEPAGE_LIMIT = 6;

export default function HomePage() {
  const { t } = useTranslation('common');
  const { data: toursData, isLoading: toursLoading } = useTours({ limit: HOMEPAGE_LIMIT });
  const { data: servicesData, isLoading: servicesLoading } = useServices({ limit: HOMEPAGE_LIMIT });
  const { data: blogsData, isLoading: blogsLoading } = useBlogs({ limit: HOMEPAGE_LIMIT });

  const tours = toursData?.data ?? [];
  const services = servicesData?.data ?? [];
  const blogs = blogsData?.data ?? [];

  return (
    <div className="flex flex-col gap-2 pb-4">
      <section className="flex flex-col items-center justify-center gap-4 px-4 py-12 text-center">
        <h1 className="font-serif text-4xl font-bold tracking-tight text-accent sm:text-5xl">
          Dark Angels
        </h1>
        <p className="text-text-secondary text-lg max-w-md">
          {t('tagline')}
        </p>
        <LanguageSwitcher />
      </section>

      <HorizontalCarousel
        title={t('new_tours')}
        items={tours}
        renderItem={(item: any) => (
          <TourCard tour={item} to={`/tours/${item.id}`} />
        )}
        emptyMessage={t('no_new_tours')}
        isLoading={toursLoading}
      />

      <HorizontalCarousel
        title={t('new_services')}
        items={services}
        renderItem={(item: any) => (
          <ServiceCard service={item} to={`/services/${item.id}`} />
        )}
        emptyMessage={t('no_new_services')}
        isLoading={servicesLoading}
      />

      <HorizontalCarousel
        title={t('new_blog')}
        items={blogs}
        renderItem={(item: any) => (
          <BlogCard article={item} to={`/blog/${item.id}`} />
        )}
        emptyMessage={t('no_new_blog')}
        isLoading={blogsLoading}
      />
    </div>
  );
}