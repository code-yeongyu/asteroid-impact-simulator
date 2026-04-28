import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import { FolderOpen, Trash, Play, X } from '@phosphor-icons/react';
import { useImpactStore } from '../../store/impactStore';
import { Button } from '../ui/Button';
import type { ButtonVariant } from '../ui/Button';
import { cn } from '../ui/cn';

export function LoadScenarioTray() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  
  const scenarios = useImpactStore((state) => state.scenarios);
  const loadScenario = useImpactStore((state) => state.loadScenario);
  const removeScenario = useImpactStore((state) => state.removeScenario);

  return (
    <BaseDialog.Root open={open} onOpenChange={setOpen}>
      <BaseDialog.Trigger render={
        <Button variant={"outline" as ButtonVariant} size="sm" className="gap-2" data-testid="open-scenarios">
          <FolderOpen size={16} />
          {t('scenarios.load.button', 'Load')}
          {scenarios.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 bg-[var(--bg-deep)] text-[var(--ink-muted)] rounded-full text-[10px] font-mono">
              {scenarios.length}
            </span>
          )}
        </Button>
      } />
      <BaseDialog.Portal>
        <BaseDialog.Backdrop
          className={cn(
            'fixed inset-0 z-40 bg-[var(--bg-overlay)] backdrop-blur-sm',
            'transition-opacity duration-[var(--duration-state)] ease-[var(--ease-quintic-out)]',
            'data-[starting-style]:opacity-0 data-[ending-style]:opacity-0',
          )}
        />
        <BaseDialog.Popup
          className={cn(
            'fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2',
            'w-[min(500px,calc(100vw-2rem))] max-h-[85vh] flex flex-col',
            'bg-[var(--bg-elevated)] border border-[var(--ink-faint)] rounded-[var(--radius-lg)]',
            'shadow-[var(--shadow-deep)] p-6',
            'transition-[opacity,transform] duration-[var(--duration-state)] ease-[var(--ease-quintic-out)]',
            'data-[starting-style]:opacity-0 data-[starting-style]:scale-95',
            'data-[ending-style]:opacity-0 data-[ending-style]:scale-95',
          )}
        >
          <div className="flex justify-between items-center mb-4 shrink-0">
            <BaseDialog.Title className="font-display text-[var(--fs-lg)] text-[var(--ink-primary)]">
              {t('scenarios.load.title', 'Saved Scenarios')}
            </BaseDialog.Title>
            <BaseDialog.Close render={
              <button className="text-[var(--ink-muted)] hover:text-[var(--ink-primary)] transition-colors" data-testid="close-scenarios">
                <X size={20} />
              </button>
            } />
          </div>
          
          <BaseDialog.Description className="text-[var(--fs-sm)] text-[var(--ink-muted)] mb-4 shrink-0">
            {t('scenarios.load.desc', 'Load a previously saved scenario. Older scenarios are automatically deleted when you exceed 10.')}
          </BaseDialog.Description>

          <div className="flex-1 overflow-y-auto min-h-[200px] pr-2 -mr-2">
            {scenarios.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-[var(--ink-muted)] gap-2">
                <FolderOpen size={32} className="opacity-50" />
                <p className="text-[var(--fs-sm)]">{t('scenarios.load.empty', 'No saved scenarios yet.')}</p>
              </div>
            ) : (
              <ul className="flex flex-col gap-2">
                {scenarios.map((scenario) => (
                  <li 
                    key={scenario.id}
                    className="flex items-center justify-between p-3 bg-[var(--bg-deep)] border border-[var(--ink-faint)] rounded-[var(--radius-sm)] group"
                    data-testid="scenario-item"
                  >
                    <div className="flex flex-col min-w-0 pr-4">
                      <span className="font-display text-[var(--fs-sm)] text-[var(--ink-primary)] truncate" data-testid="scenario-item-name">
                        {scenario.name}
                      </span>
                      <span className="text-[var(--fs-xs)] text-[var(--ink-muted)] font-mono">
                        {new Date(scenario.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100">
                      <Button 
                        variant={"outline" as ButtonVariant} 
                        size="sm" 
                        className="h-8 w-8 p-0 text-[var(--danger-fire)] hover:bg-[var(--danger-fire)] hover:text-white border-transparent hover:border-[var(--danger-fire)]"
                        onClick={() => removeScenario(scenario.id)}
                        aria-label={t('scenarios.load.delete', 'Delete')}
                      >
                        <Trash size={16} />
                      </Button>
                      <Button 
                        variant="primary" 
                        size="sm" 
                        className="h-8 px-3 gap-1"
                        onClick={() => {
                          loadScenario(scenario);
                          setOpen(false);
                        }}
                      >
                        <Play size={14} weight="fill" />
                        {t('scenarios.load.apply', 'Apply')}
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}
