import { useTranslation } from 'react-i18next';
import { useHomepageCollections } from '../../api/homepage.js';
import { useAuthStore } from '../../stores/auth.js';
import TourCard from '../../components/tours/TourCard.js';
import ServiceCard from '../../components/services/ServiceCard.js';
import BlogCard from '../../components/blog/BlogCard.js';
import HorizontalCarousel from '../../components/homepage/HorizontalCarousel.js';

export default function HomePage() {
  const { t } = useTranslation('common');
  const { data, isLoading } = useHomepageCollections();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

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
              <div className="relative">
                <TourCard tour={item} />
                {!isAuthenticated && item.is_vip && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-bg-primary/70 backdrop-blur-sm">
                    <span className="rounded-lg border border-accent/30 bg-bg-card/90 px-4 py-2 text-sm text-accent">
                      {t('login_to_view')}
                    </span>
                  </div>
                )}
              </div>
            )}
            emptyMessage={t('no_featured_tours')}
          />
          <HorizontalCarousel
            title={t('featured_services')}
            items={data.featured_services}
            renderItem={(item: any) => <ServiceCard service={item} />}
            emptyMessage={t('no_featured_services')}
          />
          <HorizontalCarousel
            title={t('featured_blog')}
            items={data.featured_blog}
            renderItem={(item: any) => (
              <div className="relative">
                <BlogCard article={item} />
                {!isAuthenticated && item.access_level !== 'public' && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-bg-primary/70 backdrop-blur-sm">
                    <span className="rounded-lg border border-accent/30 bg-bg-card/90 px-4 py-2 text-sm text-accent">
                      {t('login_to_view')}
                    </span>
                  </div>
                )}
              </div>
            )}
            emptyMessage={t('no_featured_blog')}
          />
        </>
      ) : null}
    </div>
  );
}
