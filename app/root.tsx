import { Outlet, Scripts, ScrollRestoration } from 'react-router';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
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
