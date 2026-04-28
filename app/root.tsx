import { Outlet, Scripts, ScrollRestoration, useLocation } from 'react-router';
import { useMemo } from 'react';
import { LOCALES, RTL_LOCALES } from '../react-router.config';
import '../src/styles/base.css';
import '../src/styles/rtl.css';

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { lang, dir } = useMemo(() => {
    const pathLocale = location.pathname.split('/')[1];
    const validLang =
      pathLocale != null && pathLocale !== '' && LOCALES.includes(pathLocale as (typeof LOCALES)[number])
        ? pathLocale
        : 'en';
    const dir = RTL_LOCALES.includes(validLang as (typeof RTL_LOCALES)[number])
      ? 'rtl'
      : 'ltr';
    return { lang: validLang, dir };
  }, [location.pathname]);

  return (
    <html lang={lang} dir={dir}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link
          rel="preload"
          href="/fonts/space-grotesk-latin-500-normal.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/space-grotesk-latin-700-normal.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <title>Asteroid Impact Simulator</title>
        <meta
          name="description"
          content="Scientifically accurate asteroid impact simulator. Explore how dangerous an asteroid impact would be for Earth."
        />
      </head>
      <body className="min-h-[100dvh] bg-slate-950 text-slate-100 antialiased">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function Root() {
  return <Outlet />;
}
