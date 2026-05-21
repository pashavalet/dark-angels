import { useTranslation } from 'react-i18next';

export default function HomePage() {
  const { t } = useTranslation('common');

  return (
    <div className="flex flex-col items-center justify-center gap-8 px-4 py-12">
      <div className="text-center">
        <h1 className="font-serif text-4xl font-bold tracking-tight text-accent">
          Dark Angels
        </h1>
        <p className="mt-3 text-text-secondary text-lg">
          Premium experiences for discerning clients
        </p>
      </div>

      <div className="grid w-full max-w-md gap-4">
        <SectionPreview label="featured_tours" />
        <SectionPreview label="featured_services" />
        <SectionPreview label="featured_blog" />
      </div>
    </div>
  );
}

function SectionPreview({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-border bg-bg-card p-6">
      <p className="text-sm uppercase tracking-widest text-text-muted">{label}</p>
      <p className="mt-2 text-text-secondary">Coming soon...</p>
    </div>
  );
}