import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NumberField } from './NumberField';

describe('NumberField', () => {
  it('renders an accessible spinbutton with associated label', () => {
    render(<NumberField name="diameter" label="Diameter" defaultValue={100} unit="m" />);

    const input = screen.getByRole('textbox', { name: 'Diameter' });

    expect(input).toBeInTheDocument();
    expect(screen.getByText('m')).toBeInTheDocument();
  });

  it('exposes increment and decrement controls', () => {
    render(<NumberField name="d" label="Diameter" defaultValue={100} />);

    expect(screen.getByRole('button', { name: /increment/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /decrement/i })).toBeInTheDocument();
  });

  it('increments value via increment button', async () => {
    render(<NumberField name="d" label="Diameter" defaultValue={10} step={5} />);

    const input = screen.getByRole('textbox', { name: 'Diameter' });

    expect(input).toHaveValue('10');

    await userEvent.click(screen.getByRole('button', { name: /increment/i }));

    expect(input).toHaveValue('15');
  });

  it('decrements value via decrement button', async () => {
    render(<NumberField name="d" label="Diameter" defaultValue={10} step={2} />);

    const input = screen.getByRole('textbox', { name: 'Diameter' });

    await userEvent.click(screen.getByRole('button', { name: /decrement/i }));

    expect(input).toHaveValue('8');
  });
});
