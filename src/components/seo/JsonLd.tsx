import { Helmet } from 'react-helmet-async';
import { canonicalUrl } from './urls';
import type { Page } from './urls';
import type { Locale } from '@/i18n/types';

interface JsonLdProps {
  locale: Locale;
  page: Page;
  title: string;
  description: string;
}

function webApplicationSchema(
  locale: Locale,
  page: Page,
  title: string,
  description: string,
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: title,
    description,
    url: canonicalUrl(locale, page),
    applicationCategory: 'ScienceApplication',
    operatingSystem: 'Any',
    inLanguage: locale,
    author: {
      '@type': 'Organization',
      name: 'Asteroid Impact Simulator',
      url: 'https://asteroid-impact-simulator.pages.dev',
    },
  };
}

function techArticleSchema(
  locale: Locale,
  page: Page,
  title: string,
  description: string,
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: title,
    description,
    url: canonicalUrl(locale, page),
    inLanguage: locale,
    author: {
      '@type': 'Organization',
      name: 'Asteroid Impact Simulator',
    },
    citation: [
      {
        '@type': 'CreativeWork',
        name: 'Collins, Melosh & Marcus 2005 — Earth Impact Effects Program',
        url: 'https://impact.ese.ic.ac.uk/EarthImpactEffects/',
      },
      {
        '@type': 'CreativeWork',
        name: 'Glasstone & Dolan 1977 — The Effects of Nuclear Weapons',
        url: 'https://www.fas.org/nuke/intro/nuke/7906/index.html',
      },
      {
        '@type': 'CreativeWork',
        name: 'Melosh 1989 — Impact Cratering: A Geologic Process',
        url: 'https://ui.adsabs.harvard.edu/abs/1989icgp.book.....M',
      },
    ],
  };
}

export function JsonLd({ locale, page, title, description }: JsonLdProps): React.ReactElement {
  const schema =
    page === 'methodology'
      ? techArticleSchema(locale, page, title, description)
      : webApplicationSchema(locale, page, title, description);

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}
