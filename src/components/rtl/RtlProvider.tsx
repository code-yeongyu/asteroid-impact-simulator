import { useEffect, type ReactNode } from 'react';
import { DirectionProvider as BaseUIDirectionProvider } from '@base-ui/react/direction-provider';
import { DirectionContext } from './DirectionContext';
import { isRtlLocale } from '@/i18n/types';
import type { Locale } from '@/i18n/types';

interface RtlProviderProps {
  locale: Locale;
  children: ReactNode;
}

export function RtlProvider({ locale, children }: RtlProviderProps): React.ReactElement {
  const direction = isRtlLocale(locale) ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.dir = direction;
    document.documentElement.lang = locale;
  }, [direction, locale]);

  return (
    <DirectionContext.Provider value={{ direction }}>
      <BaseUIDirectionProvider direction={direction}>{children}</BaseUIDirectionProvider>
    </DirectionContext.Provider>
  );
}
