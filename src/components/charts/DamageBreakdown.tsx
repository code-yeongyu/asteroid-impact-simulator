import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useTranslation } from 'react-i18next';
import type { ImpactResult } from '../../lib/physics/types';

interface DamageBreakdownProps {
  result: ImpactResult;
}

interface ChartData {
  id: string;
  nameKey: string;
  radius: number;
  color: string;
  descriptionKey: string;
}

export default function DamageBreakdown({ result }: DamageBreakdownProps) {
  const { t, i18n } = useTranslation();

  const data: ChartData[] = useMemo(() => {
    const items: ChartData[] = [];

    if (result.crater_diameter_km) {
      items.push({
        id: 'crater',
        nameKey: 'charts.damage.crater.name',
        radius: result.crater_diameter_km / 2,
        color: 'var(--ink-primary)',
        descriptionKey: 'charts.damage.crater.desc',
      });
    }

    items.push({
      id: 'fireball',
      nameKey: 'charts.damage.fireball.name',
      radius: result.fireball_radius_km,
      color: 'var(--danger-fire)',
      descriptionKey: 'charts.damage.fireball.desc',
    });

    items.push({
      id: 'thermal_severe',
      nameKey: 'charts.damage.thermalSevere.name',
      radius: result.thermal_radiation.clothing_ignites_km,
      color: 'var(--danger-fire)',
      descriptionKey: 'charts.damage.thermalSevere.desc',
    });

    items.push({
      id: 'thermal_moderate',
      nameKey: 'charts.damage.thermalModerate.name',
      radius: result.thermal_radiation.burns_3rd_km,
      color: 'var(--danger-amber)',
      descriptionKey: 'charts.damage.thermalModerate.desc',
    });

    items.push({
      id: 'blast_severe',
      nameKey: 'charts.damage.blastSevere.name',
      radius: result.overpressure.lethal_psi_km,
      color: 'var(--danger-fire)',
      descriptionKey: 'charts.damage.blastSevere.desc',
    });

    items.push({
      id: 'blast_moderate',
      nameKey: 'charts.damage.blastModerate.name',
      radius: result.overpressure.building_collapse_km,
      color: 'var(--danger-amber)',
      descriptionKey: 'charts.damage.blastModerate.desc',
    });

    items.push({
      id: 'blast_light',
      nameKey: 'charts.damage.blastLight.name',
      radius: result.overpressure.window_break_km,
      color: 'var(--danger-rose)',
      descriptionKey: 'charts.damage.blastLight.desc',
    });

    items.push({
      id: 'seismic',
      nameKey: 'charts.damage.seismic.name',
      radius: result.seismic.felt_km,
      color: 'var(--accent-cyan)',
      descriptionKey: 'charts.damage.seismic.desc',
    });

    // Sort by radius descending for better visual hierarchy
    return items.sort((a, b) => b.radius - a.radius);
  }, [result]);

  const formatRadius = (val: number) => {
    return new Intl.NumberFormat(i18n.language, { maximumFractionDigits: 1 }).format(val) + ' km';
  };

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: any[] }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as ChartData;
      return (
        <div className="bg-[var(--bg-elevated)] border border-[var(--ink-faint)] p-3 rounded-[var(--radius-sm)] shadow-[var(--shadow-deep)] max-w-[250px]">
          <p className="font-display text-[var(--fs-sm)] text-[var(--ink-primary)] mb-1">{t(data.nameKey)}</p>
          <p className="text-[var(--fs-xs)] text-[var(--ink-muted)] mb-2">{t(data.descriptionKey)}</p>
          <p className="font-mono text-[var(--fs-sm)] text-[var(--accent-cyan)]">{formatRadius(data.radius)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[400px] relative" role="img" aria-label={t('charts.damage.ariaLabel')}>
      <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 600, height: 400 }}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
        >
          <XAxis 
            type="number" 
            stroke="var(--ink-muted)" 
            tickFormatter={formatRadius}
            tick={{ fill: 'var(--ink-muted)', fontSize: 12, fontFamily: 'var(--font-mono)' }}
            axisLine={{ stroke: 'var(--ink-faint)' }}
            tickLine={{ stroke: 'var(--ink-faint)' }}
          />
          <YAxis 
            dataKey="nameKey" 
            type="category" 
            stroke="var(--ink-muted)"
            tickFormatter={(val) => t(val)}
            tick={{ fill: 'var(--ink-muted)', fontSize: 12 }}
            axisLine={{ stroke: 'var(--ink-faint)' }}
            tickLine={false}
            width={90}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bg-overlay)' }} />
          <Bar dataKey="radius" isAnimationActive={false} radius={[0, 2, 2, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      
      <table className="sr-only">
        <caption>{t('charts.damage.tableCaption')}</caption>
        <thead>
          <tr>
            <th scope="col">{t('charts.damage.zone')}</th>
            <th scope="col">{t('charts.damage.radius')}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id}>
              <td>{t(item.nameKey)}</td>
              <td>{formatRadius(item.radius)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
