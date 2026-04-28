import { Separator as BaseSeparator, type SeparatorProps as BaseSeparatorProps } from '@base-ui/react/separator';
import { forwardRef } from 'react';
import { cn } from './cn';

export interface SeparatorProps extends Omit<BaseSeparatorProps, 'className'> {
  className?: string;
}

export const Separator = forwardRef<HTMLDivElement, SeparatorProps>(function Separator(
  { className, orientation = 'horizontal', ...rest },
  ref,
) {
  return (
    <BaseSeparator
      ref={ref}
      orientation={orientation}
      className={cn(
        'bg-[var(--ink-faint)] border-0',
        orientation === 'horizontal' ? 'h-px w-full' : 'w-px h-full self-stretch',
        className,
      )}
      {...rest}
    />
  );
});
