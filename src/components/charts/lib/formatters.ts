export const formatScientific = (value: number, locale: string = 'en-US') => {
  return new Intl.NumberFormat(locale, { notation: 'scientific', maximumFractionDigits: 1 }).format(value);
};

export const formatNumber = (value: number, locale: string = 'en-US') => {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(value);
};
