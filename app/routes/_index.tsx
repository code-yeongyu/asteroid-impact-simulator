import { Outlet } from 'react-router';

export default function IndexPage() {
  const lang = 'en';
  const dir = 'ltr';

  return (
    <div data-locale={lang} data-dir={dir}>
      <Outlet />
    </div>
  );
}
