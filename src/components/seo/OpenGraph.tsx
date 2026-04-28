import { Helmet } from 'react-helmet-async';
import { OG_IMAGE_URL, canonicalUrl } from './urls';
import type { Page } from './urls';
import type { Locale } from '@/i18n/types';

interface OpenGraphProps {
  locale: Locale;
  page: Page;
  title: string;
  description: string;
}

export function OpenGraph({ locale, page, title, description }: OpenGraphProps): React.ReactElement {
  const url = canonicalUrl(locale, page);
  const ogLocale = locale.replace('-', '_');

  return (
    <Helmet>
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={OG_IMAGE_URL} />
      <meta property="og:locale" content={ogLocale} />
      <meta property="og:site_name" content="Asteroid Impact Simulator" />
    </Helmet>
  );
}
