import { useMemo } from 'react';
import { LinePath } from '@visx/shape';
import { AxisLeft, AxisBottom } from '@visx/axis';
import { GridRows, GridColumns } from '@visx/grid';
import { scaleLog, scaleLinear } from '@visx/scale';
import { useTranslation } from 'react-i18next';
import { calculateKineticEnergy } from '../../lib/physics/calculations';
import { formatScientific } from './lib/formatters';

interface EnergyVsVelocityProps {
  width: number;
  height: number;
  currentVelocity: number;
  currentEnergy: number;
}

const MARGIN = { top: 20, right: 20, bottom: 40, left: 60 };

export function EnergyVsVelocity({ width, height, currentVelocity, currentEnergy }: EnergyVsVelocityProps) {
  const { t, i18n } = useTranslation();

  const innerWidth = width - MARGIN.left - MARGIN.right;
  const innerHeight = height - MARGIN.top - MARGIN.bottom;

  const xScale = useMemo(
    () =>
      scaleLinear<number>({
        range: [0, innerWidth],
        domain: [11, 80],
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
    for (let v = 11; v <= 80; v += 5) {
      data.push({
        velocity: v,
        energy: calculateKineticEnergy({
          diameter_m: 100,
          velocity_kms: v,
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
      <svg width={width} height={height} role="img" aria-label={t('charts.energyVsVelocity.ariaLabel', { velocity: currentVelocity, energy: formatScientific(currentEnergy, i18n.language) })}>
        <title>{t('charts.energyVsVelocity.title')}</title>
        <desc>{t('charts.energyVsVelocity.desc')}</desc>
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
            x={(d) => xScale(d.velocity)}
            y={(d) => yScale(d.energy)}
            stroke="var(--accent-cyan)"
            strokeWidth={2}
            className="motion-reduce:transition-none"
            data-testid="energy-curve-v"
          />

          <circle
            cx={xScale(currentVelocity)}
            cy={yScale(currentEnergy)}
            r={4}
            fill="var(--accent-cyan)"
            className="drop-shadow-[0_0_8px_var(--accent-cyan)]"
            data-testid="current-scenario-marker-v"
          />
        </g>
      </svg>
    </div>
  );
}
