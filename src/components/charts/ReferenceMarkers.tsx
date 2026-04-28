import '@visx/shape';
import { useTranslation } from 'react-i18next';
import { formatScientific } from './lib/formatters';

export interface ReferenceMarker {
  id: string;
  nameKey: string;
  diameter: number;
  energy: number;
}

export const REFERENCE_IMPACTS: ReferenceMarker[] = [
  { id: 'chelyabinsk', nameKey: 'charts.reference.chelyabinsk', diameter: 20, energy: 440 * 4.184e12 }, // 440 kt
  { id: 'tunguska', nameKey: 'charts.reference.tunguska', diameter: 60, energy: 12 * 4.184e15 }, // 12 Mt
  { id: 'barringer', nameKey: 'charts.reference.barringer', diameter: 50, energy: 10 * 4.184e15 }, // 10 Mt
  { id: 'chicxulub', nameKey: 'charts.reference.chicxulub', diameter: 10000, energy: 100 * 4.184e21 }, // 100 Tt
];

interface ReferenceMarkersProps {
  xScale: (v: number) => number;
  yScale: (v: number) => number;
  onHover: (marker: ReferenceMarker | null) => void;
}

export function ReferenceMarkers({ xScale, yScale, onHover }: ReferenceMarkersProps) {
  const { t, i18n } = useTranslation();

  return (
    <g>
      {REFERENCE_IMPACTS.map((marker) => {
        const cx = xScale(marker.diameter);
        const cy = yScale(marker.energy);

        return (
          <g key={marker.id} transform={`translate(${cx}, ${cy})`}>
            <path
              d="M 0 -4 L 4 0 L 0 4 L -4 0 Z"
              fill="var(--ink-muted)"
              stroke="var(--bg-deep)"
              strokeWidth={1}
              onMouseEnter={() => onHover(marker)}
              onMouseLeave={() => onHover(null)}
              className="cursor-pointer transition-colors hover:fill-[var(--ink-primary)]"
              data-testid={`marker-${marker.id}`}
              aria-label={`${t(marker.nameKey)}: ${formatScientific(marker.energy, i18n.language)} J`}
            />
          </g>
        );
      })}
    </g>
  );
}
