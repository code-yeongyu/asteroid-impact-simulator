import { useTranslation } from 'react-i18next';
import { cn } from '../ui/cn';

export interface TimelineCardProps {
  timeKey: string;
  timeValue: number;
  titleKey: string;
  descriptionKey: string;
  icon?: React.ReactNode;
  delayMs?: number;
  className?: string;
}

export function TimelineCard({
  timeKey,
  timeValue,
  titleKey,
  descriptionKey,
  icon,
  delayMs = 0,
  className,
}: TimelineCardProps) {
  const { t } = useTranslation();

  return (
    <div
      className={cn(
        'flex flex-col gap-2 p-4 bg-[var(--bg-elevated)] border border-[var(--ink-faint)] rounded-[var(--radius-sm)] shadow-[var(--shadow-deep)]',
        'animate-in fade-in slide-in-from-bottom-4 duration-500 ease-[var(--ease-quintic-out)] fill-mode-both',
        className
      )}
      style={{ animationDelay: `${delayMs}ms` }}
      role="article"
      aria-labelledby={`timeline-title-${timeKey}`}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[var(--fs-xs)] text-[var(--accent-cyan)] uppercase tracking-wider">
          {t(timeKey, { count: timeValue })}
        </span>
        {icon !== undefined && icon !== null && <div className="text-[var(--ink-muted)]">{icon}</div>}
      </div>
      <h3 id={`timeline-title-${timeKey}`} className="font-display text-[var(--fs-sm)] text-[var(--ink-primary)]">
        {t(titleKey)}
      </h3>
      <p className="text-[var(--fs-xs)] text-[var(--ink-muted)] leading-relaxed">
        {t(descriptionKey)}
      </p>
    </div>
  );
}
