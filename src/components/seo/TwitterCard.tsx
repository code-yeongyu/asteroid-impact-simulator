import { Helmet } from 'react-helmet-async';
import { OG_IMAGE_URL, canonicalUrl } from './urls';
import type { Page } from './urls';
import type { Locale } from '@/i18n/types';

interface TwitterCardProps {
  locale: Locale;
  page: Page;
  title: string;
  description: string;
}

export function TwitterCard({ locale, page, title, description }: TwitterCardProps): React.ReactElement {
  const url = canonicalUrl(locale, page);

  return (
    <Helmet>
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:image" content={OG_IMAGE_URL} />
    </Helmet>
  );
}
