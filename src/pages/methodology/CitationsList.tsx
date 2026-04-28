interface Citation {
  key: string;
  authors: string;
  year: number;
  title: string;
  journal?: string;
  doi?: string;
  url?: string;
}

interface CitationsListProps {
  citations: Citation[];
}

export function CitationsList({ citations }: CitationsListProps): React.ReactElement {
  return (
    <ol className="space-y-4">
      {citations.map((c, i) => (
        <li key={c.key} className="flex gap-3 text-sm text-[var(--ink-secondary)]">
          <span className="font-mono text-[var(--ink-muted)] shrink-0">[{i + 1}]</span>
          <span>
            {c.authors} ({c.year}). {c.title}
            {c.journal != null && <em>. {c.journal}</em>}
            {c.doi != null && (
              <>
                {' '}
                <a
                  href={`https://doi.org/${c.doi}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--accent-cyan)] hover:underline"
                >
                  doi:{c.doi}
                </a>
              </>
            )}
            {c.url != null && c.doi == null && (
              <>
                {' '}
                <a
                  href={c.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--accent-cyan)] hover:underline"
                >
                  [link]
                </a>
              </>
            )}
          </span>
        </li>
      ))}
    </ol>
  );
}
