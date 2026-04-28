import { useState, useEffect } from 'react';

interface TocItem {
  id: string;
  number: number;
  title: string;
}

interface TableOfContentsProps {
  items: TocItem[];
}

export function TableOfContents({ items }: TableOfContentsProps): React.ReactElement {
  const [activeId, setActiveId] = useState<string>(items[0]?.id ?? '');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: '-20% 0px -60% 0px' },
    );

    for (const item of items) {
      const el = document.getElementById(item.id);
      if (el != null) {
        observer.observe(el);
      }
    }

    return () => observer.disconnect();
  }, [items]);

  const tocContent = (
    <nav aria-label="Table of contents">
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
                setMobileOpen(false);
              }}
              className={`block py-1.5 px-3 rounded-[var(--radius-sm)] text-sm transition-colors ${
                activeId === item.id
                  ? 'bg-[var(--accent-cyan-faint)] text-[var(--accent-cyan)] font-medium'
                  : 'text-[var(--ink-muted)] hover:text-[var(--ink-primary)] hover:bg-[var(--bg-surface)]'
              }`}
            >
              <span className="font-mono mr-2 text-xs">{item.number}</span>
              {item.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );

  return (
    <>
      <div className="lg:hidden mb-6">
        <button
          type="button"
          onClick={() => setMobileOpen((o) => !o)}
          className="w-full flex items-center justify-between px-4 py-3 bg-[var(--bg-surface)] rounded-[var(--radius-sm)] border border-[var(--ink-faint)] text-[var(--ink-primary)]"
          aria-expanded={mobileOpen}
        >
          <span className="font-medium">Contents</span>
          <span className="text-[var(--ink-muted)]">{mobileOpen ? '▲' : '▼'}</span>
        </button>
        {mobileOpen && (
          <div className="mt-2 p-3 bg-[var(--bg-surface)] rounded-[var(--radius-sm)] border border-[var(--ink-faint)]">
            {tocContent}
          </div>
        )}
      </div>

      <aside className="hidden lg:block sticky top-24 self-start">
        <h3 className="text-xs uppercase tracking-[0.15em] text-[var(--ink-muted)] mb-4 font-medium">
          Contents
        </h3>
        {tocContent}
      </aside>
    </>
  );
}
