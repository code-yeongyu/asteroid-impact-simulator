import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button, type ButtonVariant, type ButtonSize } from './Button';

describe('Button', () => {
  it('renders accessible button with label', () => {
    render(<Button>Launch simulator</Button>);

    expect(screen.getByRole('button', { name: 'Launch simulator' })).toBeInTheDocument();
  });

  it('applies primary variant by default', () => {
    render(<Button>Click</Button>);

    const button = screen.getByRole('button');

    expect(button).toHaveAttribute('data-variant', 'primary');
    expect(button).toHaveAttribute('data-size', 'md');
    expect(button.className).toContain('bg-[var(--accent-cyan)]');
  });

  const variantCases: Array<[ButtonVariant, string]> = [
    ['primary', 'bg-[var(--accent-cyan)]'],
    ['ghost', 'border-[var(--ink-faint)]'],
    ['danger', 'border-[var(--danger-fire)]'],
  ];

  it.each(variantCases)('applies %s variant classes', (variant, expectedClass) => {
    render(<Button variant={variant}>v</Button>);

    expect(screen.getByRole('button').className).toContain(expectedClass);
  });

  const sizeCases: Array<[ButtonSize, string]> = [
    ['sm', 'h-8'],
    ['md', 'h-10'],
    ['lg', 'h-12'],
  ];

  it.each(sizeCases)('applies %s size class', (size, expectedClass) => {
    render(<Button size={size}>s</Button>);

    expect(screen.getByRole('button').className).toContain(expectedClass);
  });

  it('forwards click events', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Press</Button>);

    await userEvent.click(screen.getByRole('button'));

    expect(onClick).toHaveBeenCalledOnce();
  });

  it('respects disabled state', async () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Disabled
      </Button>,
    );

    const button = screen.getByRole('button');

    expect(button).toBeDisabled();
    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('forwards ref to underlying button element', () => {
    const ref = { current: null as HTMLButtonElement | null };
    render(<Button ref={ref}>x</Button>);

    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
});
