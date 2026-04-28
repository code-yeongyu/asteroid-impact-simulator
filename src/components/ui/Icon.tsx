import type { ComponentType, SVGProps } from 'react';
import type { IconProps as PhosphorProps, IconWeight } from '@phosphor-icons/react';

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const SIZE_PX: Record<IconSize, number> = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
};

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'ref'> {
  icon: ComponentType<PhosphorProps>;
  size?: IconSize | number;
  weight?: IconWeight;
}

export function Icon({ icon: Component, size = 'md', weight = 'regular', ...rest }: IconProps) {
  const px = typeof size === 'number' ? size : SIZE_PX[size];
  return (
    <Component
      size={px}
      weight={weight}
      aria-hidden={rest['aria-label'] !== undefined && rest['aria-label'] !== '' ? undefined : true}
      {...(rest)}
    />
  );
}

export type { IconWeight };
