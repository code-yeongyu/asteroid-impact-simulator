import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import { type ReactNode } from 'react';
import { cn } from './cn';

export interface DialogProps {
  trigger: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function Dialog({ trigger, title, description, children, open, onOpenChange }: DialogProps) {
  return (
    <BaseDialog.Root open={open} onOpenChange={onOpenChange}>
      <BaseDialog.Trigger render={<span>{trigger as never}</span>} />
      <BaseDialog.Portal>
        <BaseDialog.Backdrop
          className={cn(
            'fixed inset-0 z-40 bg-[var(--bg-overlay)] backdrop-blur-sm',
            'transition-opacity duration-[var(--duration-state)] ease-[var(--ease-quintic-out)]',
            'data-[starting-style]:opacity-0 data-[ending-style]:opacity-0',
          )}
        />
        <BaseDialog.Popup
          className={cn(
            'fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2',
            'w-[min(560px,calc(100vw-2rem))] max-h-[85vh] overflow-auto',
            'bg-[var(--bg-elevated)] border border-[var(--ink-faint)] rounded-[var(--radius-lg)]',
            'shadow-[var(--shadow-deep)] p-6',
            'transition-[opacity,transform] duration-[var(--duration-state)] ease-[var(--ease-quintic-out)]',
            'data-[starting-style]:opacity-0 data-[starting-style]:scale-95',
            'data-[ending-style]:opacity-0 data-[ending-style]:scale-95',
          )}
        >
          {title !== undefined && title !== null && (
            <BaseDialog.Title className="font-display text-[var(--fs-lg)] text-[var(--ink-primary)] mb-2">
              {title}
            </BaseDialog.Title>
          )}
          {description !== undefined && description !== null && (
            <BaseDialog.Description className="text-[var(--fs-sm)] text-[var(--ink-muted)] mb-4">
              {description}
            </BaseDialog.Description>
          )}
          {children}
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}

export const DialogClose = BaseDialog.Close;
