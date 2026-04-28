import { useTranslation } from 'react-i18next';
import { TimelineCard } from './TimelineCard';
import { Clock, Fire, Wind, Waves, Globe } from '@phosphor-icons/react';
import { cn } from '../ui/cn';

interface TimelineCardsProps {
  className?: string;
}

export function TimelineCards({ className }: TimelineCardsProps) {
  const { t } = useTranslation();

  const snapshots = [
    {
      id: 't0',
      timeKey: 'timeline.time.seconds',
      timeValue: 0,
      titleKey: 'timeline.t0.title',
      descriptionKey: 'timeline.t0.desc',
      icon: <Fire weight="duotone" size={20} />,
    },
    {
      id: 't10s',
      timeKey: 'timeline.time.seconds',
      timeValue: 10,
      titleKey: 'timeline.t10s.title',
      descriptionKey: 'timeline.t10s.desc',
      icon: <Wind weight="duotone" size={20} />,
    },
    {
      id: 't1m',
      timeKey: 'timeline.time.minutes',
      timeValue: 1,
      titleKey: 'timeline.t1m.title',
      descriptionKey: 'timeline.t1m.desc',
      icon: <Waves weight="duotone" size={20} />,
    },
    {
      id: 't10m',
      timeKey: 'timeline.time.minutes',
      timeValue: 10,
      titleKey: 'timeline.t10m.title',
      descriptionKey: 'timeline.t10m.desc',
      icon: <Globe weight="duotone" size={20} />,
    },
    {
      id: 't1h',
      timeKey: 'timeline.time.hours',
      timeValue: 1,
      titleKey: 'timeline.t1h.title',
      descriptionKey: 'timeline.t1h.desc',
      icon: <Clock weight="duotone" size={20} />,
    },
  ];

  return (
    <div 
      className={cn("flex flex-col gap-4 relative", className)}
      role="feed"
      aria-label={t('timeline.ariaLabel')}
    >
      {/* Vertical connecting line */}
      <div 
        className="absolute left-6 top-8 bottom-8 w-px bg-[var(--ink-faint)] -z-10" 
        aria-hidden="true"
      />
      
      {snapshots.map((snapshot, index) => (
        <div key={snapshot.id} className="relative pl-12">
          {/* Timeline node dot */}
          <div 
            className="absolute left-[22px] top-6 w-2 h-2 rounded-full bg-[var(--accent-cyan)] shadow-[0_0_8px_var(--accent-cyan)] -translate-x-1/2"
            aria-hidden="true"
          />
          <TimelineCard
            timeKey={snapshot.timeKey}
            timeValue={snapshot.timeValue}
            titleKey={snapshot.titleKey}
            descriptionKey={snapshot.descriptionKey}
            icon={snapshot.icon}
            delayMs={index * 150} // Staggered entry animation
          />
        </div>
      ))}
    </div>
  );
}
