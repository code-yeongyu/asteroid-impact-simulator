import { useParams, useLocation } from 'react-router';
import { useMemo } from 'react';
import { LOCALES, RTL_LOCALES } from '../../react-router.config';

export function useLocale(): string {
  const { lang } = useParams<{ lang?: string }>();
  const location = useLocation();

  return useMemo(() => {
    if (lang != null && lang !== '' && LOCALES.includes(lang as (typeof LOCALES)[number])) {
      return lang;
    }
    const pathLocale = location.pathname.split('/')[1];
    if (
      pathLocale != null && pathLocale !== '' &&
      LOCALES.includes(pathLocale as (typeof LOCALES)[number])
    ) {
      return pathLocale;
    }
    return 'en';
  }, [lang, location.pathname]);
}

export function useDirection(): 'ltr' | 'rtl' {
  const locale = useLocale();
  return RTL_LOCALES.includes(locale as (typeof RTL_LOCALES)[number])
    ? 'rtl'
    : 'ltr';
}

export function useRouteForLocale(
  targetLocale: string,
): string {
  const location = useLocation();
  const currentLocale = useLocale();

  return useMemo(() => {
    if (!LOCALES.includes(targetLocale as (typeof LOCALES)[number])) {
      return location.pathname;
    }
    return location.pathname.replace(
      new RegExp(`^/${currentLocale}(?=/|$)`),
      `/${targetLocale}`,
    );
  }, [location.pathname, currentLocale, targetLocale]);
}
