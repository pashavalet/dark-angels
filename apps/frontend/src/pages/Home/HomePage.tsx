import { useTranslation } from 'react-i18next';
import { useHomepageCollections } from '../../api/homepage.js';
import TourCard from '../../components/tours/TourCard.js';
import ServiceCard from '../../components/services/ServiceCard.js';
import BlogCard from '../../components/blog/BlogCard.js';
import HorizontalCarousel from '../../components/homepage/HorizontalCarousel.js';

export default function HomePage() {
  const { t } = useTranslation('common');
  const { data, isLoading } = useHomepageCollections();

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

      {isLoading ? (
        <div className="space-y-8">
          {[t('featured_tours'), t('featured_services'), t('featured_blog')].map((title) => (
            <HorizontalCarousel
              key={title}
              title={title}
              items={[]}
              renderItem={() => null}
              isLoading
            />
          ))}
        </div>
      ) : data ? (
        <>
          <HorizontalCarousel
            title={t('featured_tours')}
            items={data.featured_tours}
            renderItem={(item: any) => (
              <TourCard tour={item} to={`/tours/${item.id}`} />
            )}
            emptyMessage={t('no_featured_tours')}
          />
          <HorizontalCarousel
            title={t('featured_services')}
            items={data.featured_services}
            renderItem={(item: any) => (
              <ServiceCard service={item} to={`/services/${item.id}`} />
            )}
            emptyMessage={t('no_featured_services')}
          />
          <HorizontalCarousel
            title={t('featured_blog')}
            items={data.featured_blog}
            renderItem={(item: any) => (
              <BlogCard article={item} to={`/blog/${item.id}`} />
            )}
            emptyMessage={t('no_featured_blog')}
          />
        </>
      ) : null}
    </div>
  );
}
