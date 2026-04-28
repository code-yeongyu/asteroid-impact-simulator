interface LimitationItem {
  label: string;
  description: string;
}

interface LimitationsSectionProps {
  items: LimitationItem[];
}

export function LimitationsSection({ items }: LimitationsSectionProps): React.ReactElement {
  return (
    <ul data-testid="limitations-section" className="space-y-3">
      {items.map((item) => (
        <li key={item.label} className="flex gap-3 items-start">
          <span className="text-[var(--danger-fire)] mt-0.5">&#9679;</span>
          <div>
            <strong className="text-[var(--ink-primary)]">{item.label}</strong>
            <p className="text-[var(--ink-muted)] text-sm mt-0.5">{item.description}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
