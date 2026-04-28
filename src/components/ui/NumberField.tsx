import { NumberField as BaseNumberField } from '@base-ui/react/number-field';
import { forwardRef, type ReactNode } from 'react';
import { Minus, Plus } from '@phosphor-icons/react';
import { cn } from './cn';

export interface NumberFieldProps extends Omit<BaseNumberField.Root.Props, 'children'> {
  label?: ReactNode;
  unit?: ReactNode;
  className?: string;
  inputClassName?: string;
}

export const NumberField = forwardRef<HTMLDivElement, NumberFieldProps>(function NumberField(
  { label, unit, className, inputClassName, id, ...rootProps },
  ref,
) {
  const fieldId = id ?? rootProps.name;
  return (
    <div ref={ref} className={cn('flex flex-col gap-2', className)}>
      {label !== undefined && (
        <label
          htmlFor={fieldId}
          className="text-[var(--fs-sm)] text-[var(--ink-muted)]"
        >
          {label}
        </label>
      )}
      <BaseNumberField.Root id={fieldId} {...rootProps}>
        <BaseNumberField.Group
          className={cn(
            'flex items-center h-10',
            'bg-[var(--bg-deep)] border border-[var(--ink-faint)] rounded-[var(--radius-sm)]',
            'focus-within:border-[var(--accent-cyan)] transition-colors duration-[var(--duration-micro)] ease-[var(--ease-quintic-out)]',
            'data-[disabled]:opacity-50',
          )}
        >
          <BaseNumberField.Decrement
            aria-label="Decrement"
            className={cn(
              'h-full px-3 flex items-center justify-center text-[var(--ink-muted)]',
              'hover:text-[var(--accent-cyan)] disabled:opacity-40 disabled:hover:text-[var(--ink-muted)]',
            )}
          >
            <Minus size={14} weight="bold" />
          </BaseNumberField.Decrement>
          <BaseNumberField.Input
            className={cn(
              'flex-1 min-w-0 h-full bg-transparent',
              'font-mono tabular-nums text-[var(--fs-base)] text-[var(--ink-primary)]',
              'text-center outline-none px-2',
              inputClassName,
            )}
          />
          {unit !== undefined && (
            <span className="px-2 text-[var(--fs-sm)] text-[var(--ink-muted)] font-mono">
              {unit}
            </span>
          )}
          <BaseNumberField.Increment
            aria-label="Increment"
            className={cn(
              'h-full px-3 flex items-center justify-center text-[var(--ink-muted)]',
              'hover:text-[var(--accent-cyan)] disabled:opacity-40 disabled:hover:text-[var(--ink-muted)]',
            )}
          >
            <Plus size={14} weight="bold" />
          </BaseNumberField.Increment>
        </BaseNumberField.Group>
      </BaseNumberField.Root>
    </div>
  );
});
