import { Popover as BasePopover } from '@base-ui/react/popover';
import { type ReactNode } from 'react';
import { cn } from './cn';

export interface PopoverProps {
  trigger: ReactNode;
  children: ReactNode;
  side?: BasePopover.Positioner.Props['side'];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

export function Popover({
  trigger,
  children,
  side = 'bottom',
  open,
  onOpenChange,
  className,
}: PopoverProps) {
  return (
    <BasePopover.Root open={open} onOpenChange={onOpenChange}>
      <BasePopover.Trigger render={<span>{trigger as never}</span>} />
      <BasePopover.Portal>
        <BasePopover.Positioner sideOffset={8} side={side} className="z-50">
          <BasePopover.Popup
            className={cn(
              'p-3 min-w-48',
              'bg-[var(--bg-elevated)] border border-[var(--ink-faint)] rounded-[var(--radius-md)]',
              'text-[var(--fs-sm)] text-[var(--ink-primary)]',
              'shadow-[var(--shadow-deep)]',
              'origin-[var(--transform-origin)] transition-[opacity,transform] duration-[var(--duration-micro)] ease-[var(--ease-quintic-out)]',
              'data-[starting-style]:opacity-0 data-[ending-style]:opacity-0',
              className,
            )}
          >
            {children}
          </BasePopover.Popup>
        </BasePopover.Positioner>
      </BasePopover.Portal>
    </BasePopover.Root>
  );
}

export const PopoverClose = BasePopover.Close;
