import { Outlet, useParams } from 'react-router';
import { useEffect } from 'react';
import { LOCALES, RTL_LOCALES } from '../../react-router.config';

export default function LangLayout() {
  const { lang } = useParams<{ lang?: string }>();
  const validLang = lang && LOCALES.includes(lang as (typeof LOCALES)[number]) ? lang : 'en';
  const dir = RTL_LOCALES.includes(validLang as (typeof RTL_LOCALES)[number]) ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.lang = validLang;
    document.documentElement.dir = dir;
  }, [validLang, dir]);

  return <Outlet />;
}
