import { useMemo, useState } from 'react';
import { LinePath } from '@visx/shape';
import { AxisLeft, AxisBottom } from '@visx/axis';
import { GridRows, GridColumns } from '@visx/grid';
import { scaleLog } from '@visx/scale';
import { useTranslation } from 'react-i18next';
import { calculateKineticEnergy } from '../../lib/physics/calculations';
import { ReferenceMarkers } from './ReferenceMarkers';
import { formatScientific } from './lib/formatters';

interface EnergyVsDiameterProps {
  width: number;
  height: number;
  currentDiameter: number;
  currentEnergy: number;
}

const MARGIN = { top: 20, right: 20, bottom: 40, left: 60 };

export function EnergyVsDiameter({ width, height, currentDiameter, currentEnergy }: EnergyVsDiameterProps) {
  const { t, i18n } = useTranslation();
  const [hoveredMarker, setHoveredMarker] = useState<string | null>(null);

  const innerWidth = width - MARGIN.left - MARGIN.right;
  const innerHeight = height - MARGIN.top - MARGIN.bottom;

  const xScale = useMemo(
    () =>
      scaleLog<number>({
        range: [0, innerWidth],
        domain: [1, 20000],
      }),
    [innerWidth]
  );

  const yScale = useMemo(
    () =>
      scaleLog<number>({
        range: [innerHeight, 0],
        domain: [1e9, 1e25],
      }),
    [innerHeight]
  );

  const curveData = useMemo(() => {
    const data = [];
    for (let d = 1; d <= 20000; d *= 1.5) {
      data.push({
        diameter: d,
        energy: calculateKineticEnergy({
          diameter_m: d,
          velocity_kms: 20,
          angle_deg: 45,
          density_kgm3: 3000,
          target_density_kgm3: 3000,
        }),
      });
    }
    return data;
  }, []);

  if (width < 10) return null;

  return (
    <div className="relative">
      <svg width={width} height={height} role="img" aria-label={t('charts.energyVsDiameter.ariaLabel', { diameter: currentDiameter, energy: formatScientific(currentEnergy, i18n.language) })}>
        <title>{t('charts.energyVsDiameter.title')}</title>
        <desc>{t('charts.energyVsDiameter.desc')}</desc>
        <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>
          <GridRows scale={yScale} width={innerWidth} stroke="var(--ink-faint)" strokeDasharray="2,2" />
          <GridColumns scale={xScale} height={innerHeight} stroke="var(--ink-faint)" strokeDasharray="2,2" />

          <AxisLeft
            scale={yScale}
            stroke="var(--ink-muted)"
            tickStroke="var(--ink-muted)"
            tickLabelProps={() => ({
              fill: 'var(--ink-muted)',
              fontSize: 10,
              fontFamily: 'var(--font-mono)',
              textAnchor: 'end',
              dy: '0.33em',
              dx: '-0.5em',
            })}
            numTicks={5}
            tickFormat={(v) => formatScientific(v as number, i18n.language)}
          />

          <AxisBottom
            top={innerHeight}
            scale={xScale}
            stroke="var(--ink-muted)"
            tickStroke="var(--ink-muted)"
            tickLabelProps={() => ({
              fill: 'var(--ink-muted)',
              fontSize: 10,
              fontFamily: 'var(--font-mono)',
              textAnchor: 'middle',
              dy: '0.5em',
            })}
            numTicks={5}
            tickFormat={(v) => formatScientific(v as number, i18n.language)}
          />

          <LinePath
            data={curveData}
            x={(d) => xScale(d.diameter)}
            y={(d) => yScale(d.energy)}
            stroke="var(--accent-cyan)"
            strokeWidth={2}
            className="motion-reduce:transition-none"
            data-testid="energy-curve-d"
          />

          <ReferenceMarkers
            xScale={xScale}
            yScale={yScale}
            onHover={(marker) => setHoveredMarker(marker?.id ?? null)}
          />

          <circle
            cx={xScale(currentDiameter)}
            cy={yScale(currentEnergy)}
            r={4}
            fill="var(--accent-cyan)"
            className="drop-shadow-[0_0_8px_var(--accent-cyan)]"
            data-testid="current-scenario-marker"
          />
        </g>
      </svg>
      {hoveredMarker !== null && hoveredMarker !== "" && (
        <div className="absolute top-0 right-0 bg-[var(--bg-elevated)] border border-[var(--ink-faint)] p-2 rounded-[var(--radius-sm)] text-[var(--fs-sm)] text-[var(--ink-primary)] shadow-[var(--shadow-deep)]">
          {t(`charts.reference.${hoveredMarker}`)}
        </div>
      )}
    </div>
  );
}
