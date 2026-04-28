import { Asterisk, Planet, Target } from '@phosphor-icons/react';
import { Button, Icon, Separator } from './components/ui';
import { useRegisterSW } from './registerSW';
export default function App() {
  useRegisterSW();

  return (
    <div className="min-h-[100dvh] bg-bg-void text-ink-primary">
      <main className="mx-auto max-w-3xl px-6 py-24 flex flex-col gap-12">
        <header className="flex flex-col gap-4">
          <span className="inline-flex items-center gap-2 text-[var(--fs-xs)] uppercase tracking-[0.2em] text-[var(--ink-muted)]">
            <Icon icon={Asterisk} size="xs" weight="bold" />
            Asteroid Impact Simulator
          </span>
          <h1 className="font-display text-[var(--fs-4xl)] text-[var(--ink-primary)] leading-[var(--lh-display)]">
            How dangerous would an asteroid impact be?
          </h1>
          <p className="text-[var(--ink-muted)] text-[var(--fs-md)] max-w-xl">
            A scientifically grounded simulation built on Collins-Melosh-Marcus 2005. Adjust
            diameter, density, velocity, angle — see crater, fireball, blast radii at a glance.
          </p>
        </header>

        <Separator />

        <div className="flex flex-wrap gap-3">
          <Button variant="primary" size="lg">
            <Icon icon={Target} size="sm" weight="bold" />
            Start the simulator
          </Button>
          <Button variant="ghost" size="lg">
            <Icon icon={Planet} size="sm" />
            Methodology
          </Button>
        </div>
      </main>
    </div>
  );
}
