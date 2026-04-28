import { Button as BaseButton, type ButtonProps as BaseButtonProps } from '@base-ui/react/button';
import { forwardRef } from 'react';
import { cn } from './cn';

export type ButtonVariant = 'primary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<BaseButtonProps, 'render' | 'className'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}

const base =
  'inline-flex items-center justify-center gap-2 font-display font-medium tracking-tight ' +
  'transition-[background-color,color,box-shadow,border-color] duration-[var(--duration-micro)] ease-[var(--ease-quintic-out)] ' +
  'border border-transparent select-none whitespace-nowrap ' +
  'disabled:opacity-50 disabled:pointer-events-none data-[disabled]:opacity-50 data-[disabled]:pointer-events-none';

const sizes: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-[var(--fs-sm)] rounded-[var(--radius-sm)]',
  md: 'h-10 px-4 text-[var(--fs-base)] rounded-[var(--radius-sm)]',
  lg: 'h-12 px-6 text-[var(--fs-md)] rounded-[var(--radius-sm)]',
};

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--accent-cyan)] text-[var(--bg-void)] ' +
    'hover:shadow-[var(--shadow-glow-cyan)] hover:bg-[color-mix(in_oklab,var(--accent-cyan)_92%,white)] ' +
    'active:translate-y-px',
  ghost:
    'bg-transparent text-[var(--ink-primary)] border-[var(--ink-faint)] ' +
    'hover:border-[var(--accent-cyan)] hover:text-[var(--accent-cyan)] hover:bg-[var(--accent-cyan-faint)]',
  danger:
    'bg-transparent text-[var(--danger-fire)] border-[var(--danger-fire)] ' +
    'hover:bg-[var(--danger-fire)] hover:text-[var(--bg-void)] hover:shadow-[var(--shadow-glow-danger)]',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', className, ...rest },
  ref,
) {
  return (
    <BaseButton
      ref={ref}
      data-variant={variant}
      data-size={size}
      className={cn(base, sizes[size], variants[variant], className)}
      {...rest}
    />
  );
});
