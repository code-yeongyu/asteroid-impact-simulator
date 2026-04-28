import { describe, it, expect, beforeAll } from 'vitest';
import i18next from 'i18next';
import * as ICUmod from 'i18next-icu';

const ICU = ICUmod.default;

describe('EN ICU plurals', () => {
  beforeAll(async () => {
    const instance = i18next.createInstance();
    await instance.use(ICU).init({
      lng: 'en',
      fallbackLng: 'en',
      ns: ['simulator'],
      defaultNS: 'simulator',
      interpolation: { escapeValue: false },
      resources: {
        en: {
          simulator: {
            damage: {
              count:
                '{count, plural, =0 {No damage zones} one {# damage zone} other {# damage zones}}',
            },
          },
        },
      },
    });
    (globalThis as Record<string, unknown>).testI18n = instance;
  });

  it('returns "No damage zones" for count=0', () => {
    const t = (globalThis as Record<string, unknown>).testI18n as {
      t: (key: string, opts: Record<string, unknown>) => string;
    };
    expect(t.t('damage.count', { count: 0 })).toBe('No damage zones');
  });

  it('returns "1 damage zone" for count=1', () => {
    const t = (globalThis as Record<string, unknown>).testI18n as {
      t: (key: string, opts: Record<string, unknown>) => string;
    };
    expect(t.t('damage.count', { count: 1 })).toBe('1 damage zone');
  });

  it('returns "5 damage zones" for count=5', () => {
    const t = (globalThis as Record<string, unknown>).testI18n as {
      t: (key: string, opts: Record<string, unknown>) => string;
    };
    expect(t.t('damage.count', { count: 5 })).toBe('5 damage zones');
  });
});

describe('AR ICU plurals (6 forms)', () => {
  beforeAll(async () => {
    const instance = i18next.createInstance();
    await instance.use(ICU).init({
      lng: 'ar',
      fallbackLng: 'en',
      ns: ['simulator'],
      defaultNS: 'simulator',
      interpolation: { escapeValue: false },
      resources: {
        ar: {
          simulator: {
            damage: {
              count:
                '{count, plural, =0 {لا توجد مناطق تضرر} one {منطقة تضرر واحدة} two {منطقتان تضرر} few {# مناطق تضرر} many {# منطقة تضرر} other {# منطقة تضرر}}',
            },
          },
        },
      },
    });
    (globalThis as Record<string, unknown>).testI18nAr = instance;
  });

  it('handles zero form', () => {
    const t = (globalThis as Record<string, unknown>).testI18nAr as {
      t: (key: string, opts: Record<string, unknown>) => string;
    };
    expect(t.t('damage.count', { count: 0 })).toBe('لا توجد مناطق تضرر');
  });

  it('handles one form', () => {
    const t = (globalThis as Record<string, unknown>).testI18nAr as {
      t: (key: string, opts: Record<string, unknown>) => string;
    };
    expect(t.t('damage.count', { count: 1 })).toBe('منطقة تضرر واحدة');
  });

  it('handles two form', () => {
    const t = (globalThis as Record<string, unknown>).testI18nAr as {
      t: (key: string, opts: Record<string, unknown>) => string;
    };
    expect(t.t('damage.count', { count: 2 })).toBe('منطقتان تضرر');
  });

  it('handles few form (count=3)', () => {
    const t = (globalThis as Record<string, unknown>).testI18nAr as {
      t: (key: string, opts: Record<string, unknown>) => string;
    };
    expect(t.t('damage.count', { count: 3 })).toBe('3 مناطق تضرر');
  });

  it('handles many form (count=11)', () => {
    const t = (globalThis as Record<string, unknown>).testI18nAr as {
      t: (key: string, opts: Record<string, unknown>) => string;
    };
    expect(t.t('damage.count', { count: 11 })).toBe('11 منطقة تضرر');
  });

  it('handles other form (count=100)', () => {
    const t = (globalThis as Record<string, unknown>).testI18nAr as {
      t: (key: string, opts: Record<string, unknown>) => string;
    };
    expect(t.t('damage.count', { count: 100 })).toBe('100 منطقة تضرر');
  });
});

describe('RU ICU plurals (3 forms)', () => {
  beforeAll(async () => {
    const instance = i18next.createInstance();
    await instance.use(ICU).init({
      lng: 'ru',
      fallbackLng: 'en',
      ns: ['simulator'],
      defaultNS: 'simulator',
      interpolation: { escapeValue: false },
      resources: {
        ru: {
          simulator: {
            damage: {
              count:
                '{count, plural, one {# зона поражения} few {# зоны поражения} many {# зон поражения} other {# зон поражения}}',
            },
          },
        },
      },
    });
    (globalThis as Record<string, unknown>).testI18nRu = instance;
  });

  it('handles one form (count=1)', () => {
    const t = (globalThis as Record<string, unknown>).testI18nRu as {
      t: (key: string, opts: Record<string, unknown>) => string;
    };
    expect(t.t('damage.count', { count: 1 })).toBe('1 зона поражения');
  });

  it('handles few form (count=2)', () => {
    const t = (globalThis as Record<string, unknown>).testI18nRu as {
      t: (key: string, opts: Record<string, unknown>) => string;
    };
    expect(t.t('damage.count', { count: 2 })).toBe('2 зоны поражения');
  });

  it('handles many form (count=5)', () => {
    const t = (globalThis as Record<string, unknown>).testI18nRu as {
      t: (key: string, opts: Record<string, unknown>) => string;
    };
    expect(t.t('damage.count', { count: 5 })).toBe('5 зон поражения');
  });
});

describe('PL ICU plurals (3 forms)', () => {
  beforeAll(async () => {
    const instance = i18next.createInstance();
    await instance.use(ICU).init({
      lng: 'pl',
      fallbackLng: 'en',
      ns: ['simulator'],
      defaultNS: 'simulator',
      interpolation: { escapeValue: false },
      resources: {
        pl: {
          simulator: {
            damage: {
              count:
                '{count, plural, one {# strefa zniszczeń} few {# strefy zniszczeń} many {# stref zniszczeń} other {# stref zniszczeń}}',
            },
          },
        },
      },
    });
    (globalThis as Record<string, unknown>).testI18nPl = instance;
  });

  it('handles one form (count=1)', () => {
    const t = (globalThis as Record<string, unknown>).testI18nPl as {
      t: (key: string, opts: Record<string, unknown>) => string;
    };
    expect(t.t('damage.count', { count: 1 })).toBe('1 strefa zniszczeń');
  });

  it('handles few form (count=2)', () => {
    const t = (globalThis as Record<string, unknown>).testI18nPl as {
      t: (key: string, opts: Record<string, unknown>) => string;
    };
    expect(t.t('damage.count', { count: 2 })).toBe('2 strefy zniszczeń');
  });

  it('handles many form (count=5)', () => {
    const t = (globalThis as Record<string, unknown>).testI18nPl as {
      t: (key: string, opts: Record<string, unknown>) => string;
    };
    expect(t.t('damage.count', { count: 5 })).toBe('5 stref zniszczeń');
  });
});

describe('CS ICU plurals (3 forms)', () => {
  beforeAll(async () => {
    const instance = i18next.createInstance();
    await instance.use(ICU).init({
      lng: 'cs',
      fallbackLng: 'en',
      ns: ['simulator'],
      defaultNS: 'simulator',
      interpolation: { escapeValue: false },
      resources: {
        cs: {
          simulator: {
            damage: {
              count:
                '{count, plural, one {# zóna poškození} few {# zóny poškození} many {# zón poškození} other {# zón poškození}}',
            },
          },
        },
      },
    });
    (globalThis as Record<string, unknown>).testI18nCs = instance;
  });

  it('handles one form (count=1)', () => {
    const t = (globalThis as Record<string, unknown>).testI18nCs as {
      t: (key: string, opts: Record<string, unknown>) => string;
    };
    expect(t.t('damage.count', { count: 1 })).toBe('1 zóna poškození');
  });

  it('handles few form (count=2)', () => {
    const t = (globalThis as Record<string, unknown>).testI18nCs as {
      t: (key: string, opts: Record<string, unknown>) => string;
    };
    expect(t.t('damage.count', { count: 2 })).toBe('2 zóny poškození');
  });

  it('handles many form (count=5)', () => {
    const t = (globalThis as Record<string, unknown>).testI18nCs as {
      t: (key: string, opts: Record<string, unknown>) => string;
    };
    expect(t.t('damage.count', { count: 5 })).toBe('5 zón poškození');
  });
});

describe('HE ICU plurals (4 forms)', () => {
  beforeAll(async () => {
    const instance = i18next.createInstance();
    await instance.use(ICU).init({
      lng: 'he',
      fallbackLng: 'en',
      ns: ['simulator'],
      defaultNS: 'simulator',
      interpolation: { escapeValue: false },
      resources: {
        he: {
          simulator: {
            damage: {
              count:
                '{count, plural, one {אזור נזק אחד} two {שני אזורי נזק} many {# אזורי נזק} other {# אזורי נזק}}',
            },
          },
        },
      },
    });
    (globalThis as Record<string, unknown>).testI18nHe = instance;
  });

  it('handles one form (count=1)', () => {
    const t = (globalThis as Record<string, unknown>).testI18nHe as {
      t: (key: string, opts: Record<string, unknown>) => string;
    };
    expect(t.t('damage.count', { count: 1 })).toBe('אזור נזק אחד');
  });

  it('handles two form (count=2)', () => {
    const t = (globalThis as Record<string, unknown>).testI18nHe as {
      t: (key: string, opts: Record<string, unknown>) => string;
    };
    expect(t.t('damage.count', { count: 2 })).toBe('שני אזורי נזק');
  });

  it('handles many form (count=10)', () => {
    const t = (globalThis as Record<string, unknown>).testI18nHe as {
      t: (key: string, opts: Record<string, unknown>) => string;
    };
    expect(t.t('damage.count', { count: 10 })).toBe('10 אזורי נזק');
  });

  it('handles other form (count=0)', () => {
    const t = (globalThis as Record<string, unknown>).testI18nHe as {
      t: (key: string, opts: Record<string, unknown>) => string;
    };
    expect(t.t('damage.count', { count: 0 })).toBe('0 אזורי נזק');
  });
});
