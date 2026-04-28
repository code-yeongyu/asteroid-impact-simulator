import { useEffect, useRef, useState } from 'react';

interface KaTeXModule {
  render: (tex: string, element: HTMLElement, options?: Record<string, unknown>) => void;
}

let katexModule: KaTeXModule | null = null;
let katexCssLoaded = false;

async function loadKaTeX(): Promise<KaTeXModule> {
  if (katexModule != null) {
    return katexModule;
  }
  const mod = await import('katex');
  katexModule = mod.default;
  return katexModule;
}

function loadKaTeXCss(): void {
  if (katexCssLoaded) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = '/katex/katex.min.css';
  document.head.appendChild(link);
  katexCssLoaded = true;
}

interface UseKaTeXOptions {
  tex: string;
  displayMode?: boolean;
}

export function useKaTeX({ tex, displayMode = false }: UseKaTeXOptions): {
  ref: React.RefObject<HTMLDivElement | null>;
  error: string | null;
} {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function render(): Promise<void> {
      try {
        const katex = await loadKaTeX();
        loadKaTeXCss();
        if (cancelled || ref.current == null) return;
        katex.render(tex, ref.current, {
          displayMode,
          throwOnError: false,
          trust: false,
        });
        setError(null);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
        }
      }
    }

    void render();

    return () => {
      cancelled = true;
    };
  }, [tex, displayMode]);

  return { ref, error };
}
