import { useKaTeX } from './lib/katex';

interface FormulaBlockProps {
  tex: string;
  caption?: string;
}

export function FormulaBlock({ tex, caption }: FormulaBlockProps): React.ReactElement {
  const { ref, error } = useKaTeX({ tex, displayMode: true });

  return (
    <figure className="my-8">
      <div
        ref={ref}
        className="overflow-x-auto py-4 px-2 bg-[var(--bg-surface)] rounded-[var(--radius-sm)] border border-[var(--ink-faint)]"
        aria-label={caption ?? 'Formula'}
      />
      {error != null && (
        <pre className="text-[var(--danger-fire)] text-sm mt-2">{error}</pre>
      )}
      {caption != null && (
        <figcaption className="text-center text-[var(--ink-muted)] text-sm mt-3">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

interface InlineFormulaProps {
  tex: string;
}

export function InlineFormula({ tex }: InlineFormulaProps): React.ReactElement {
  const { ref, error } = useKaTeX({ tex, displayMode: false });

  return (
    <span className="inline-block">
      <span ref={ref} />
      {error != null && (
        <span className="text-[var(--danger-fire)] text-xs">{error}</span>
      )}
    </span>
  );
}
