import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Slider } from './Slider';

describe('Slider', () => {
  it('exposes the native range input with proper value semantics', () => {
    render(<Slider defaultValue={50} min={0} max={100} label="Diameter" />);

    const slider = screen.getByRole('slider');

    expect(slider).toHaveAttribute('aria-valuenow', '50');
    expect(slider).toHaveAttribute('min', '0');
    expect(slider).toHaveAttribute('max', '100');
  });

  it('renders associated label and current value when requested', () => {
    render(
      <Slider
        defaultValue={42}
        min={0}
        max={100}
        label="Diameter"
        showValue
        formatValue={(v) => `${v} m`}
      />,
    );

    expect(screen.getByText('Diameter')).toBeInTheDocument();
    expect(screen.getByText('42 m')).toBeInTheDocument();
  });

  it('reflects the disabled state on the underlying input', () => {
    render(<Slider defaultValue={10} min={0} max={100} disabled label="d" />);

    expect(screen.getByRole('slider')).toBeDisabled();
  });
});
