import { Helmet } from 'react-helmet-async';
import { allHreflangUrls } from './urls';
import type { Page } from './urls';
import type { Locale } from '@/i18n/types';

interface HreflangTagsProps {
  locale: Locale;
  page: Page;
}

export function HreflangTags({ locale, page }: HreflangTagsProps): React.ReactElement {
  const urls = allHreflangUrls(page);

  return (
    <Helmet>
      {urls.map(({ locale: lng, url }) => (
        <link key={lng} rel="alternate" hrefLang={lng} href={url} />
      ))}
      <link rel="alternate" hrefLang="x-default" href={urls[0]?.url ?? ''} />
      <link rel="canonical" href={urls.find((u) => u.locale === locale)?.url ?? ''} />
    </Helmet>
  );
}
