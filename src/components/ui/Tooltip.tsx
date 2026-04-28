import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip';
import { type ReactNode } from 'react';
import { cn } from './cn';

export interface TooltipProps {
  children: ReactNode;
  content: ReactNode;
  side?: BaseTooltip.Positioner.Props['side'];
  className?: string;
}

export function Tooltip({ children, content, side = 'top', className }: TooltipProps) {
  return (
    <BaseTooltip.Root>
      <BaseTooltip.Trigger render={<span className="inline-flex">{children as never}</span>} />
      <BaseTooltip.Portal>
        <BaseTooltip.Positioner sideOffset={6} side={side}>
          <BaseTooltip.Popup
            className={cn(
              'px-2 py-1 max-w-xs',
              'bg-[var(--bg-elevated)] border border-[var(--ink-faint)] rounded-[var(--radius-sm)]',
              'text-[var(--fs-xs)] text-[var(--ink-primary)] font-body',
              'shadow-[var(--shadow-deep)]',
              'transition-[opacity,transform] duration-[var(--duration-micro)] ease-[var(--ease-quintic-out)]',
              'data-[starting-style]:opacity-0 data-[ending-style]:opacity-0',
              className,
            )}
          >
            {content}
          </BaseTooltip.Popup>
        </BaseTooltip.Positioner>
      </BaseTooltip.Portal>
    </BaseTooltip.Root>
  );
}

export const TooltipProvider = BaseTooltip.Provider;
