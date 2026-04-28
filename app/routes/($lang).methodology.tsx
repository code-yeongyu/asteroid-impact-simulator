import { useTranslation } from 'react-i18next';
import { PageMeta } from '@/components/seo';
import { Section } from '@/pages/methodology/Section';
import { TableOfContents } from '@/pages/methodology/TableOfContents';
import { FormulaBlock } from '@/pages/methodology/FormulaBlock';
import { CitationsList } from '@/pages/methodology/CitationsList';
import { LimitationsSection } from '@/pages/methodology/LimitationsSection';
import { useParams } from 'react-router';
import { isValidLocale, FALLBACK_LOCALE } from '@/i18n/types';
import type { Locale } from '@/i18n/types';

const TOC_ITEMS = [
  { id: 'overview', number: 1, title: 'Overview' },
  { id: 'kinetic-energy', number: 2, title: 'Kinetic Energy' },
  { id: 'atmospheric-entry', number: 3, title: 'Atmospheric Entry' },
  { id: 'crater-diameter', number: 4, title: 'Crater Diameter' },
  { id: 'fireball-thermal', number: 5, title: 'Fireball & Thermal' },
  { id: 'air-blast', number: 6, title: 'Air Blast' },
  { id: 'seismic', number: 7, title: 'Seismic Effects' },
  { id: 'civilization-risk', number: 8, title: 'Civilization Risk' },
  { id: 'limitations', number: 9, title: 'Limitations' },
  { id: 'citations', number: 10, title: 'Citations' },
];

const CITATIONS = [
  {
    key: 'collins2005',
    authors: 'Collins, G. S., Melosh, H. J., & Marcus, R. A.',
    year: 2005,
    title: 'Earth Impact Effects Program: A Web-based computer program for calculating the regional environmental consequences of a meteoroid impact on Earth',
    journal: 'Meteoritics & Planetary Science',
    doi: '10.1111/j.1945-5100.2005.tb00157.x',
  },
  {
    key: 'schmidt1987',
    authors: 'Schmidt, R. M. & Housen, K. R.',
    year: 1987,
    title: 'Some recent advances in the scaling of impact and explosion cratering',
    journal: 'International Journal of Impact Engineering',
    doi: '10.1016/0734-743X(87)90026-6',
  },
  {
    key: 'glasstone1977',
    authors: 'Glasstone, S. & Dolan, P. J.',
    year: 1977,
    title: 'The Effects of Nuclear Weapons',
    url: 'https://www.fas.org/nuke/intro/nuke/7906/index.html',
  },
  {
    key: 'schultz1975',
    authors: 'Schultz, P. H. & Gault, D. E.',
    year: 1975,
    title: 'Seismic effects from major basin formations on the moon and Mercury',
    journal: 'The Moon',
    doi: '10.1007/BF00562146',
  },
  {
    key: 'melosh1989',
    authors: 'Melosh, H. J.',
    year: 1989,
    title: 'Impact Cratering: A Geologic Process',
    journal: 'Oxford University Press',
    doi: '10.2307/300399',
  },
];

const LIMITATIONS = [
  { label: 'Tsunami modeling', description: 'Oceanic impact tsunami propagation is not calculated. Coastal effects require separate hydrodynamic simulation.' },
  { label: 'Casualty estimates', description: 'No population density data is used. Casualty and fatality projections are intentionally excluded.' },
  { label: 'Atmospheric chemistry', description: 'Ozone depletion, dust injection, and long-term climate effects are not modeled.' },
  { label: 'Fragmentation', description: 'Rubble-pile asteroid breakup in atmosphere is simplified; discrete fragment tracking is not performed.' },
  { label: 'Terrain coupling', description: 'Local geology (bedrock vs. sediment) is approximated; site-specific ground coupling is not simulated.' },
];

export default function MethodologyPage(): React.ReactElement {
  const { lang } = useParams<{ lang: string }>();
  const locale: Locale = isValidLocale(lang ?? '') ? (lang as Locale) : FALLBACK_LOCALE;
  const { t } = useTranslation('methodology');

  const title = t('meta.title', { defaultValue: 'Methodology' });
  const description = t('meta.description', { defaultValue: 'Scientific methodology behind the Asteroid Impact Simulator' });

  return (
    <>
      <PageMeta locale={locale} page="methodology" title={title} description={description} />

      <div className="min-h-[100dvh] bg-bg-void text-ink-primary">
        <div className="mx-auto max-w-6xl px-6 py-12 lg:py-24">
          <header className="mb-12 lg:mb-16">
            <h1 className="font-display text-[var(--fs-4xl)] text-[var(--ink-primary)] leading-[var(--lh-display)] mb-4">
              {t('title', { defaultValue: 'Methodology' })}
            </h1>
            <p className="text-[var(--ink-muted)] text-[var(--fs-lg)] max-w-2xl">
              {t('subtitle', { defaultValue: 'How the simulator works' })}
            </p>
            <p className="text-[var(--ink-faint)] text-sm mt-4">
              {t('readingTime', { defaultValue: 'Reading time: 8 min' })}
            </p>
          </header>

          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
            <div className="lg:w-56 shrink-0">
              <TableOfContents items={TOC_ITEMS} />
            </div>

            <main className="flex-1 min-w-0 space-y-16 lg:space-y-24">
              <Section id="overview" number={1} title={t('sections.overview', { defaultValue: 'Overview' })}>
                <p>{t('overview.p1')}</p>
                <p>{t('overview.p2')}</p>
                <p>{t('overview.accuracy', { defaultValue: 'Results are accurate to within ±5% for typical asteroid parameters, validated against the Collins et al. (2005) golden test suite.' })}</p>
              </Section>

              <Section id="kinetic-energy" number={2} title={t('sections.kineticEnergy', { defaultValue: 'Kinetic Energy' })}>
                <p>{t('kineticEnergy.p1')}</p>
                <FormulaBlock
                  tex="E = \\frac{1}{2} m v^2"
                  caption={t('kineticEnergy.energyCaption', { defaultValue: 'Kinetic energy of the impactor' })}
                />
                <p>{t('kineticEnergy.p2')}</p>
                <FormulaBlock
                  tex="m = \\frac{4}{3} \\pi r^3 \\rho"
                  caption={t('kineticEnergy.massCaption', { defaultValue: 'Mass from diameter and density' })}
                />
              </Section>

              <Section id="atmospheric-entry" number={3} title={t('sections.atmosphericEntry', { defaultValue: 'Atmospheric Entry' })}>
                <p>{t('atmosphericEntry.p1')}</p>
                <p>{t('atmosphericEntry.p2')}</p>
                <FormulaBlock
                  tex="h_b \\approx 2.5 \\cdot \\rho_i^{0.33} \\cdot D^{0.75} \\cdot v^{0.9} \\cdot \\sin(\\theta)^{0.5}"
                  caption={t('atmosphericEntry.airburstCaption', { defaultValue: 'Airburst altitude (Collins 2005 eq. A1)' })}
                />
              </Section>

              <Section id="crater-diameter" number={4} title={t('sections.craterDiameter', { defaultValue: 'Crater Diameter' })}>
                <p>{t('craterDiameter.p1')}</p>
                <FormulaBlock
                  tex="D \\approx 1.8 \\cdot \\rho_t^{-0.11} \\cdot \\rho_i^{0.33} \\cdot g^{-0.22} \\cdot E^{0.28}"
                  caption={t('craterDiameter.craterCaption', { defaultValue: 'Transient crater diameter (Schmidt-Housen scaling)' })}
                />
                <p>{t('craterDiameter.p2')}</p>
              </Section>

              <Section id="fireball-thermal" number={5} title={t('sections.fireballThermal', { defaultValue: 'Fireball & Thermal' })}>
                <p>{t('fireballThermal.p1')}</p>
                <FormulaBlock
                  tex="R_f = 0.002 \\cdot E^{1/3}"
                  caption={t('fireballThermal.fireballCaption', { defaultValue: 'Fireball radius (km) from energy (Mt)' })}
                />
                <p>{t('fireballThermal.p2')}</p>
                <FormulaBlock
                  tex="F = \\frac{K \\cdot E}{2 \\pi r^2}"
                  caption={t('fireballThermal.fluxCaption', { defaultValue: 'Thermal flux at distance r' })}
                />
              </Section>

              <Section id="air-blast" number={6} title={t('sections.airBlast', { defaultValue: 'Air Blast' })}>
                <p>{t('airBlast.p1')}</p>
                <p>{t('airBlast.p2')}</p>
                <ul className="list-disc pl-5 space-y-1 text-[var(--ink-muted)]">
                  <li>{t('airBlast.psi1')}</li>
                  <li>{t('airBlast.psi3')}</li>
                  <li>{t('airBlast.psi5')}</li>
                  <li>{t('airBlast.psi20')}</li>
                </ul>
              </Section>

              <Section id="seismic" number={7} title={t('sections.seismic', { defaultValue: 'Seismic Effects' })}>
                <p>{t('seismic.p1')}</p>
                <FormulaBlock
                  tex="M_w = 0.67 \\cdot \\log_{10}(E) - 5.87"
                  caption={t('seismic.magnitudeCaption', { defaultValue: 'Moment magnitude from impact energy (Melosh 1989)' })}
                />
                <p>{t('seismic.p2')}</p>
              </Section>

              <Section id="civilization-risk" number={8} title={t('sections.civilizationRisk', { defaultValue: 'Civilization Risk' })}>
                <p>{t('civilizationRisk.p1')}</p>
                <p>{t('civilizationRisk.p2')}</p>
                <p>{t('civilizationRisk.torino', { defaultValue: 'The Torino Scale (0–10) is referenced for public communication of impact hazard.' })}</p>
              </Section>

              <Section id="limitations" number={9} title={t('sections.limitations', { defaultValue: 'Limitations' })}>
                <p>{t('limitations.intro', { defaultValue: 'The simulator intentionally excludes the following effects to maintain scientific rigor and avoid false precision:' })}</p>
                <LimitationsSection items={LIMITATIONS} />
              </Section>

              <Section id="citations" number={10} title={t('sections.citations', { defaultValue: 'Citations' })}>
                <p>{t('citations.intro', { defaultValue: 'All formulas and scaling laws are derived from peer-reviewed publications:' })}</p>
                <CitationsList citations={CITATIONS} />
              </Section>
            </main>
          </div>
        </div>
      </div>
    </>
  );
}
