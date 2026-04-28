import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { Button } from '../../src/components/ui/Button';

export default function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-[100dvh] bg-[var(--bg-void)] text-[var(--ink-primary)] flex flex-col items-center justify-center gap-8 p-6 text-center">
      <div className="relative w-64 h-64 flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="w-full h-full text-[var(--ink-faint)] animate-pulse" aria-hidden="true">
          <path
            d="M50 10 C30 15 15 30 10 50 C15 70 30 85 50 90 C70 85 85 70 90 50 C85 30 70 15 50 10 Z M40 30 C45 25 55 25 60 30 C65 35 65 45 60 50 C55 55 45 55 40 50 C35 45 35 35 40 30 Z M30 60 C35 55 45 55 50 60 C55 65 55 75 50 80 C45 85 35 85 30 80 C25 75 25 65 30 60 Z"
            fill="currentColor"
          />
          <circle cx="70" cy="70" r="5" fill="var(--accent-cyan)" className="opacity-50" />
          <circle cx="20" cy="30" r="3" fill="var(--danger-fire)" className="opacity-30" />
        </svg>
      </div>

      <div className="flex flex-col gap-4 max-w-md">
        <h1 className="text-[var(--fs-3xl)] font-display font-bold text-[var(--ink-primary)]">
          {t('404.title', 'Lost in space')}
        </h1>
        <p className="text-[var(--fs-lg)] text-[var(--ink-muted)]">
          {t('404.subtitle', 'This page is not on our radar.')}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mt-4">
        <Link to="/" className="inline-flex">
          <Button variant="primary">{t('404.home', 'Return to Base')}</Button>
        </Link>
      </div>
    </div>
  );
}
