import { Select as BaseSelect } from '@base-ui/react/select';
import { CaretDown, Check } from '@phosphor-icons/react';
import { type ReactNode } from 'react';
import { cn } from './cn';

export interface SelectOption<Value> {
  value: Value;
  label: ReactNode;
}

export interface SelectProps<Value> extends Omit<BaseSelect.Root.Props<Value, false>, 'children'> {
  options: ReadonlyArray<SelectOption<Value>>;
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
  ariaLabel?: string;
}

export function Select<Value>({
  options,
  placeholder = 'Select…',
  className,
  triggerClassName,
  ariaLabel,
  ...rootProps
}: SelectProps<Value>) {
  return (
    <BaseSelect.Root {...rootProps}>
      <BaseSelect.Trigger
        aria-label={ariaLabel}
        className={cn(
          'inline-flex items-center justify-between gap-2 h-10 px-3 min-w-40',
          'bg-[var(--bg-deep)] border border-[var(--ink-faint)] rounded-[var(--radius-sm)]',
          'text-[var(--fs-sm)] text-[var(--ink-primary)] font-body',
          'transition-colors duration-[var(--duration-micro)] ease-[var(--ease-quintic-out)]',
          'hover:border-[var(--accent-cyan)] data-[popup-open]:border-[var(--accent-cyan)]',
          'data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed',
          className,
          triggerClassName,
        )}
      >
        <BaseSelect.Value placeholder={placeholder} />
        <BaseSelect.Icon className="text-[var(--ink-muted)]">
          <CaretDown size={12} weight="bold" />
        </BaseSelect.Icon>
      </BaseSelect.Trigger>
      <BaseSelect.Portal>
        <BaseSelect.Positioner sideOffset={4} className="z-50">
          <BaseSelect.Popup
            className={cn(
              'min-w-[var(--anchor-width)] py-1',
              'bg-[var(--bg-elevated)] border border-[var(--ink-faint)] rounded-[var(--radius-sm)]',
              'shadow-[var(--shadow-deep)]',
              'origin-[var(--transform-origin)] transition-[opacity,transform] duration-[var(--duration-micro)] ease-[var(--ease-quintic-out)]',
              'data-[starting-style]:opacity-0 data-[ending-style]:opacity-0',
            )}
          >
            {options.map((opt, idx) => (
              <BaseSelect.Item
                key={idx}
                value={opt.value}
                className={cn(
                  'flex items-center gap-2 h-9 px-3 cursor-pointer',
                  'text-[var(--fs-sm)] text-[var(--ink-primary)]',
                  'data-[highlighted]:bg-[var(--accent-cyan-faint)] data-[highlighted]:text-[var(--accent-cyan)]',
                  'data-[selected]:text-[var(--accent-cyan)]',
                )}
              >
                <BaseSelect.ItemIndicator className="text-[var(--accent-cyan)]">
                  <Check size={12} weight="bold" />
                </BaseSelect.ItemIndicator>
                <BaseSelect.ItemText>{opt.label}</BaseSelect.ItemText>
              </BaseSelect.Item>
            ))}
          </BaseSelect.Popup>
        </BaseSelect.Positioner>
      </BaseSelect.Portal>
    </BaseSelect.Root>
  );
}
