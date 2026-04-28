import { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface FormulaBlockProps {
  tex: string;
  caption?: string;
}

export function FormulaBlock({ tex, caption }: FormulaBlockProps): React.ReactElement {
  const { markup, error } = useFormulaMarkup(tex, true);

  return (
    <figure className="my-8">
      <div
        className="overflow-x-auto py-4 px-2 bg-[var(--bg-surface)] rounded-[var(--radius-sm)] border border-[var(--ink-faint)]"
        aria-label={caption ?? 'Formula'}
        dangerouslySetInnerHTML={{ __html: markup }}
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
  const { markup, error } = useFormulaMarkup(tex, false);

  return (
    <span className="inline-block">
      <span dangerouslySetInnerHTML={{ __html: markup }} />
      {error != null && (
        <span className="text-[var(--danger-fire)] text-xs">{error}</span>
      )}
    </span>
  );
}

function useFormulaMarkup(tex: string, displayMode: boolean): { markup: string; error: string | null } {
  return useMemo(() => {
    try {
      return {
        markup: katex.renderToString(tex, {
          displayMode,
          throwOnError: false,
          trust: false,
        }),
        error: null,
      };
    } catch (err) {
      return {
        markup: '',
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }, [tex, displayMode]);
}
