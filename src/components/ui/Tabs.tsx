import { Tabs as BaseTabs } from '@base-ui/react/tabs';
import { forwardRef, type ReactNode } from 'react';
import { cn } from './cn';

export interface TabItem {
  value: string;
  label: ReactNode;
  panel: ReactNode;
}

export interface TabsProps extends Omit<BaseTabs.Root.Props, 'children'> {
  items: ReadonlyArray<TabItem>;
  className?: string;
}

export const Tabs = forwardRef<HTMLDivElement, TabsProps>(function Tabs(
  { items, className, ...rootProps },
  ref,
) {
  return (
    <BaseTabs.Root ref={ref} className={cn('flex flex-col gap-4', className)} {...rootProps}>
      <BaseTabs.List
        className={cn(
          'relative inline-flex items-center gap-1',
          'border-b border-[var(--ink-faint)]',
        )}
      >
        {items.map((item) => (
          <BaseTabs.Tab
            key={item.value}
            value={item.value}
            className={cn(
              'relative h-10 px-4 -mb-px',
              'text-[var(--fs-sm)] font-display tracking-tight',
              'text-[var(--ink-muted)] hover:text-[var(--ink-primary)]',
              'data-[selected]:text-[var(--accent-cyan)]',
              'transition-colors duration-[var(--duration-micro)] ease-[var(--ease-quintic-out)]',
            )}
          >
            {item.label}
          </BaseTabs.Tab>
        ))}
        <BaseTabs.Indicator
          className={cn(
            'absolute bottom-0 left-0 h-[2px] bg-[var(--accent-cyan)]',
            'transition-[transform,width] duration-[var(--duration-state)] ease-[var(--ease-quintic-out)]',
            'translate-x-[var(--active-tab-left)] w-[var(--active-tab-width)]',
          )}
        />
      </BaseTabs.List>
      {items.map((item) => (
        <BaseTabs.Panel
          key={item.value}
          value={item.value}
          className="text-[var(--ink-primary)]"
        >
          {item.panel}
        </BaseTabs.Panel>
      ))}
    </BaseTabs.Root>
  );
});
