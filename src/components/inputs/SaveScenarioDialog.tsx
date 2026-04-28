import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import { FloppyDisk, X } from '@phosphor-icons/react';
import { useImpactStore } from '../../store/impactStore';
import { Button } from '../ui/Button';
import type { ButtonVariant } from '../ui/Button';
import { cn } from '../ui/cn';

export function SaveScenarioDialog() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  
  const params = useImpactStore((state) => state.params);
  const scenarios = useImpactStore((state) => state.scenarios);
  const saveScenario = useImpactStore((state) => state.saveScenario);

  const handleSave = () => {
    const trimmedName = name.trim();
    
    if (!trimmedName) {
      setError(t('validation.scenario.name.min'));
      return;
    }
    
    if (trimmedName.length > 60) {
      setError(t('validation.scenario.name.max'));
      return;
    }
    
    if (scenarios.some(s => s.name === trimmedName)) {
      setError(t('validation.scenario.name.duplicate', 'A scenario with this name already exists'));
      return;
    }

    const now = new Date().toISOString();
    saveScenario({
      kind: 'scenario',
      id: crypto.randomUUID(),
      name: trimmedName,
      params,
      createdAt: now,
      updatedAt: now,
    });
    
    setOpen(false);
    setName('');
    setError('');
  };

  return (
    <BaseDialog.Root open={open} onOpenChange={setOpen}>
      <BaseDialog.Trigger render={
        <Button variant={"outline" as ButtonVariant} size="sm" className="gap-2" data-testid="save-scenario">
          <FloppyDisk size={16} />
          {t('scenarios.save.button', 'Save')}
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
            'w-[min(400px,calc(100vw-2rem))]',
            'bg-[var(--bg-elevated)] border border-[var(--ink-faint)] rounded-[var(--radius-lg)]',
            'shadow-[var(--shadow-deep)] p-6',
            'transition-[opacity,transform] duration-[var(--duration-state)] ease-[var(--ease-quintic-out)]',
            'data-[starting-style]:opacity-0 data-[starting-style]:scale-95',
            'data-[ending-style]:opacity-0 data-[ending-style]:scale-95',
          )}
        >
          <div className="flex justify-between items-center mb-4">
            <BaseDialog.Title className="font-display text-[var(--fs-lg)] text-[var(--ink-primary)]">
              {t('scenarios.save.title', 'Save Scenario')}
            </BaseDialog.Title>
            <BaseDialog.Close render={
              <button className="text-[var(--ink-muted)] hover:text-[var(--ink-primary)] transition-colors">
                <X size={20} />
              </button>
            } />
          </div>
          
          <BaseDialog.Description className="text-[var(--fs-sm)] text-[var(--ink-muted)] mb-4">
            {t('scenarios.save.desc', 'Save your current parameters to compare later. Maximum 10 scenarios.')}
          </BaseDialog.Description>

          <div className="flex flex-col gap-2 mb-6">
            <label htmlFor="scenario-name" className="text-[var(--fs-sm)] text-[var(--ink-primary)]">
              {t('scenarios.save.nameLabel', 'Scenario Name')}
            </label>
            <input
              id="scenario-name"
              name="scenario-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              className={cn(
                'h-10 px-3 bg-[var(--bg-deep)] border rounded-[var(--radius-sm)] text-[var(--ink-primary)]',
                'focus:outline-none focus:border-[var(--accent-cyan)] transition-colors',
                error ? 'border-[var(--danger-fire)]' : 'border-[var(--ink-faint)]'
              )}
              placeholder={t('scenarios.save.namePlaceholder', 'e.g., Extinction Event')}
              maxLength={60}
              
            />
            {error && <span className="text-[var(--fs-xs)] text-[var(--danger-fire)]">{error}</span>}
          </div>

          <div className="flex justify-end gap-3">
            <BaseDialog.Close render={
              <Button variant={"outline" as ButtonVariant}>{t('common.cancel', 'Cancel')}</Button>
            } />
            <Button variant="primary" onClick={handleSave} data-testid="save-confirm">
              {t('scenarios.save.confirm', 'Save')}
            </Button>
          </div>
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}
