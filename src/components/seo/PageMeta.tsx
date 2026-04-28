import { Helmet } from 'react-helmet-async';
import { HreflangTags } from './HreflangTags';
import { OpenGraph } from './OpenGraph';
import { TwitterCard } from './TwitterCard';
import { JsonLd } from './JsonLd';
import type { Page } from './urls';
import type { Locale } from '@/i18n/types';

interface PageMetaProps {
  locale: Locale;
  page: Page;
  title: string;
  description: string;
}

export function PageMeta({ locale, page, title, description }: PageMetaProps): React.ReactElement {
  return (
    <>
      <Helmet>
        <html lang={locale} />
        <title>{title}</title>
        <meta name="description" content={description} />
      </Helmet>
      <HreflangTags locale={locale} page={page} />
      <OpenGraph locale={locale} page={page} title={title} description={description} />
      <TwitterCard locale={locale} page={page} title={title} description={description} />
      <JsonLd locale={locale} page={page} title={title} description={description} />
    </>
  );
}
