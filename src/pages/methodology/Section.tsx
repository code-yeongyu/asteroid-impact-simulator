import { type ReactNode } from 'react';

interface SectionProps {
  id: string;
  number: number;
  title: string;
  children: ReactNode;
}

export function Section({ id, number, title, children }: SectionProps): React.ReactElement {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="font-display text-[var(--fs-2xl)] text-[var(--ink-primary)] leading-[var(--lh-display)] mb-6 flex items-baseline gap-3">
        <span className="text-[var(--accent-cyan)] font-mono text-[var(--fs-lg)]">{number}.</span>
        {title}
      </h2>
      <div className="prose prose-invert max-w-none text-[var(--ink-secondary)] leading-[var(--lh-body)] space-y-4">
        {children}
      </div>
    </section>
  );
}
