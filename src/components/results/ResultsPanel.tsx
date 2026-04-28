import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Accordion } from '@base-ui/react/accordion';
import { CaretDown } from '@phosphor-icons/react';
import { cn } from '../ui/cn';
import type { ImpactResult, CivilizationRisk } from '../../lib/physics/types';

interface ResultsPanelProps {
  result: ImpactResult | null;
  className?: string;
}

const RISK_COLORS: Record<CivilizationRisk, string> = {
  negligible: 'var(--ink-muted)',
  local: 'var(--danger-rose)',
  regional: 'var(--danger-amber)',
  continental: 'var(--danger-fire)',
  global: 'var(--danger-fire)',
  extinction: 'var(--danger-fire)',
};

function AnimatedCounter({ value, format }: { value: number; format: (v: number) => string }) {
  const [displayValue, setDisplayValue] = useState(value);
  const requestRef = useRef<number>(null);
  const startTimeRef = useRef<number>(null);
  const startValueRef = useRef(value);

  useEffect(() => {
    if (value === displayValue) return;

    startValueRef.current = displayValue;
    startTimeRef.current = performance.now();

    const animate = (time: number) => {
      startTimeRef.current ??= time;
      const elapsed = time - startTimeRef.current;
      const duration = 200; // 200ms
      
      if (elapsed < duration) {
        // Quintic ease out: 1 - (1 - t)^5
        const t = elapsed / duration;
        const easeOut = 1 - Math.pow(1 - t, 5);
        const current = startValueRef.current + (value - startValueRef.current) * easeOut;
        setDisplayValue(current);
        requestRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [value, displayValue]);

  return <span>{format(displayValue)}</span>;
}

export function ResultsPanel({ result, className }: ResultsPanelProps) {
  const { t, i18n } = useTranslation();

  if (!result) {
    return (
      <div className={cn("p-6 bg-[var(--bg-elevated)] border border-[var(--ink-faint)] rounded-[var(--radius-sm)]", className)}>
        <p className="text-[var(--ink-muted)] text-center">{t('results.empty')}</p>
      </div>
    );
  }

  const formatScientific = (val: number) => new Intl.NumberFormat(i18n.language, { notation: 'scientific', maximumFractionDigits: 2 }).format(val);
  const formatNumber = (val: number) => new Intl.NumberFormat(i18n.language, { maximumFractionDigits: 1 }).format(val);
  const formatHiroshima = (val: number) => new Intl.NumberFormat(i18n.language, { maximumFractionDigits: 0 }).format(val / 0.015); // 15 kt = 0.015 Mt

  return (
    <div 
      className={cn("flex flex-col gap-6 p-6 bg-[var(--bg-elevated)] border border-[var(--ink-faint)] rounded-[var(--radius-sm)] shadow-[var(--shadow-deep)]", className)}
      aria-live="polite"
    >
      {/* Hero Metric */}
      <div className="flex flex-col gap-2">
        <h2 className="text-[var(--fs-sm)] text-[var(--ink-muted)] uppercase tracking-wider font-display">
          {t('results.hero.title')}
        </h2>
        <div className="flex items-baseline gap-2">
          <span className="text-[var(--fs-3xl)] font-display text-[var(--ink-primary)] leading-none">
            <AnimatedCounter value={result.kinetic_energy_J} format={formatScientific} />
          </span>
          <span className="text-[var(--fs-lg)] text-[var(--ink-muted)]">J</span>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[var(--fs-sm)] text-[var(--ink-muted)]">
          <span><AnimatedCounter value={result.energyMegatons} format={formatNumber} /> Mt TNT</span>
          <span>≈ <AnimatedCounter value={result.energyMegatons} format={formatHiroshima} /> × Hiroshima</span>
        </div>
      </div>

      {/* Risk Badge */}
      <div className="flex items-center gap-3 p-3 bg-[var(--bg-deep)] border border-[var(--ink-faint)] rounded-[var(--radius-sm)]">
        <div 
          className="w-3 h-3 rounded-full" 
          style={{ backgroundColor: RISK_COLORS[result.civilizationRisk] }}
          aria-hidden="true"
        />
        <div className="flex flex-col">
          <span className="text-[var(--fs-xs)] text-[var(--ink-muted)] uppercase tracking-wider">
            {t('results.risk.label')}
          </span>
          <span className="text-[var(--fs-sm)] font-display text-[var(--ink-primary)]">
            {t(`results.risk.tiers.${result.civilizationRisk}`)}
          </span>
        </div>
      </div>

      {/* Damage Zones Accordion */}
      <Accordion.Root className="flex flex-col gap-2">
        {result.crater_diameter_km !== null && result.crater_diameter_km > 0 && (
          <Accordion.Item className="border border-[var(--ink-faint)] rounded-[var(--radius-sm)] overflow-hidden">
            <Accordion.Header className="flex">
              <Accordion.Trigger className="flex-1 flex items-center justify-between p-4 bg-[var(--bg-elevated)] hover:bg-[var(--bg-deep)] transition-colors text-[var(--ink-primary)] font-display text-[var(--fs-sm)] group">
                {t('results.zones.crater.title')}
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[var(--accent-cyan)]">{formatNumber(result.crater_diameter_km)} km</span>
                  <CaretDown className="w-4 h-4 text-[var(--ink-muted)] transition-transform duration-[var(--duration-state)] ease-[var(--ease-quintic-out)] group-data-[state=open]:rotate-180" />
                </div>
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Panel className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
              <div className="p-4 pt-0 bg-[var(--bg-elevated)] text-[var(--fs-sm)] text-[var(--ink-muted)] border-t border-[var(--ink-faint)]">
                <p>{t('results.zones.crater.desc')}</p>
                <p className="mt-2">{t('results.zones.crater.depth', { depth: formatNumber(result.crater_depth_km ?? 0) })}</p>
              </div>
            </Accordion.Panel>
          </Accordion.Item>
        )}

        <Accordion.Item className="border border-[var(--ink-faint)] rounded-[var(--radius-sm)] overflow-hidden">
          <Accordion.Header className="flex">
            <Accordion.Trigger className="flex-1 flex items-center justify-between p-4 bg-[var(--bg-elevated)] hover:bg-[var(--bg-deep)] transition-colors text-[var(--ink-primary)] font-display text-[var(--fs-sm)] group">
              {t('results.zones.fireball.title')}
              <div className="flex items-center gap-3">
                <span className="font-mono text-[var(--danger-fire)]">{formatNumber(result.fireball_radius_km)} km</span>
                <CaretDown className="w-4 h-4 text-[var(--ink-muted)] transition-transform duration-[var(--duration-state)] ease-[var(--ease-quintic-out)] group-data-[state=open]:rotate-180" />
              </div>
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Panel className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
            <div className="p-4 pt-0 bg-[var(--bg-elevated)] text-[var(--fs-sm)] text-[var(--ink-muted)] border-t border-[var(--ink-faint)]">
              <p>{t('results.zones.fireball.desc')}</p>
            </div>
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item className="border border-[var(--ink-faint)] rounded-[var(--radius-sm)] overflow-hidden">
          <Accordion.Header className="flex">
            <Accordion.Trigger className="flex-1 flex items-center justify-between p-4 bg-[var(--bg-elevated)] hover:bg-[var(--bg-deep)] transition-colors text-[var(--ink-primary)] font-display text-[var(--fs-sm)] group">
              {t('results.zones.blast.title')}
              <div className="flex items-center gap-3">
                <span className="font-mono text-[var(--danger-amber)]">{formatNumber(result.overpressure.building_collapse_km)} km</span>
                <CaretDown className="w-4 h-4 text-[var(--ink-muted)] transition-transform duration-[var(--duration-state)] ease-[var(--ease-quintic-out)] group-data-[state=open]:rotate-180" />
              </div>
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Panel className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
            <div className="p-4 pt-0 bg-[var(--bg-elevated)] text-[var(--fs-sm)] text-[var(--ink-muted)] border-t border-[var(--ink-faint)] flex flex-col gap-2">
              <div className="flex justify-between">
                <span>{t('results.zones.blast.severe')}</span>
                <span className="font-mono text-[var(--danger-fire)]">{formatNumber(result.overpressure.lethal_psi_km)} km</span>
              </div>
              <div className="flex justify-between">
                <span>{t('results.zones.blast.moderate')}</span>
                <span className="font-mono text-[var(--danger-amber)]">{formatNumber(result.overpressure.building_collapse_km)} km</span>
              </div>
              <div className="flex justify-between">
                <span>{t('results.zones.blast.light')}</span>
                <span className="font-mono text-[var(--danger-rose)]">{formatNumber(result.overpressure.window_break_km)} km</span>
              </div>
            </div>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion.Root>

      {/* Torino Footnote */}
      <div className="pt-4 border-t border-[var(--ink-faint)]">
        <p className="text-[var(--fs-xs)] text-[var(--ink-faint)] italic">
          {t('results.disclaimer.torino')}
        </p>
      </div>
    </div>
  );
}
