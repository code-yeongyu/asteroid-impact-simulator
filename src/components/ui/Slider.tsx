import { Slider as BaseSlider } from '@base-ui/react/slider';
import { forwardRef, type ReactNode } from 'react';
import { cn } from './cn';

export interface SliderProps extends Omit<BaseSlider.Root.Props<number>, 'children'> {
  label?: ReactNode;
  showValue?: boolean;
  formatValue?: (value: number) => string;
  className?: string;
}

export const Slider = forwardRef<HTMLDivElement, SliderProps>(function Slider(
  { label, showValue = false, formatValue, className, ...rootProps },
  ref,
) {
  return (
    <BaseSlider.Root
      ref={ref}
      className={cn('flex flex-col gap-2 w-full', className)}
      {...rootProps}
    >
      {(label !== undefined || showValue) && (
        <div className="flex items-baseline justify-between">
          {label !== undefined && (
            <BaseSlider.Label className="text-[var(--fs-sm)] text-[var(--ink-muted)]">
              {label}
            </BaseSlider.Label>
          )}
          {showValue && (
            <BaseSlider.Value className="font-mono text-[var(--fs-sm)] text-[var(--ink-primary)] tabular-nums">
              {(value) => (formatValue ? formatValue(Number(value)) : String(value))}
            </BaseSlider.Value>
          )}
        </div>
      )}
      <BaseSlider.Control
        className={cn(
          'relative h-6 flex items-center select-none touch-none',
          'data-[disabled]:opacity-50',
        )}
      >
        <BaseSlider.Track
          className={cn(
            'relative h-[2px] w-full',
            'bg-[var(--ink-faint)] rounded-[var(--radius-pill)]',
          )}
        >
          <BaseSlider.Indicator
            className="absolute h-full bg-[var(--accent-cyan)] rounded-[var(--radius-pill)]"
          />
          <BaseSlider.Thumb
            className={cn(
              'absolute top-1/2 -translate-y-1/2 size-4',
              'bg-[var(--accent-cyan)] rounded-[var(--radius-pill)]',
              'ring-2 ring-[var(--bg-void)]',
              'transition-shadow duration-[var(--duration-micro)] ease-[var(--ease-quintic-out)]',
              'hover:shadow-[var(--shadow-glow-cyan)] data-[dragging]:shadow-[var(--shadow-glow-cyan)]',
            )}
          />
        </BaseSlider.Track>
      </BaseSlider.Control>
    </BaseSlider.Root>
  );
});
