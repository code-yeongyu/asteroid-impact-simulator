import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { MapPin, Crosshair } from '@phosphor-icons/react';
import { SaveScenarioDialog } from './SaveScenarioDialog';
import { LoadScenarioTray } from './LoadScenarioTray';
import { impactInputSchema } from '../../lib/schemas';

import type { ImpactInputForm } from '../../lib/schemas';
import type { ButtonVariant } from '../ui/Button';
import { Slider } from '../ui/Slider';
import { NumberField } from '../ui/NumberField';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { cn } from '../ui/cn';
import { ShareButton } from './ShareButton';

interface InputsPanelProps {
  defaultValues: ImpactInputForm;
  onChange: (values: ImpactInputForm) => void;
  className?: string;
}


const PRESETS = [
  { id: 'chelyabinsk', nameKey: 'presets.chelyabinsk', values: { diameter: 20, velocity: 19, angle: 18, density: 3300, targetDensity: 3000 } },
  { id: 'tunguska', nameKey: 'presets.tunguska', values: { diameter: 60, velocity: 27, angle: 30, density: 2200, targetDensity: 3000 } },
  { id: 'barringer', nameKey: 'presets.barringer', values: { diameter: 50, velocity: 13, angle: 45, density: 7800, targetDensity: 3000 } },
  { id: 'chicxulub', nameKey: 'presets.chicxulub', values: { diameter: 10000, velocity: 20, angle: 60, density: 3000, targetDensity: 3000 } },
];

const DENSITY_OPTIONS = [
  { value: 1000, labelKey: 'inputs.density.ice' },
  { value: 1500, labelKey: 'inputs.density.porousRock' },
  { value: 3000, labelKey: 'inputs.density.denseRock' },
  { value: 8000, labelKey: 'inputs.density.iron' },
];

const TARGET_DENSITY_OPTIONS = [
  { value: 1000, labelKey: 'inputs.targetDensity.water' },
  { value: 2500, labelKey: 'inputs.targetDensity.sedimentary' },
  { value: 3000, labelKey: 'inputs.targetDensity.crystalline' },
];

export function InputsPanel({ defaultValues, onChange, className }: InputsPanelProps) {
  const { t } = useTranslation();
  
  const { control, handleSubmit, reset, watch } = useForm<ImpactInputForm>({
    resolver: zodResolver(impactInputSchema),
    defaultValues,
    mode: 'onChange',
  });

  // Auto-submit on valid change
  const onSubmit = (data: ImpactInputForm) => {
    onChange(data);
  };

  // Watch for changes and submit if valid
  watch(() => { void handleSubmit(onSubmit)(); });

  const handlePresetClick = (presetValues: Partial<ImpactInputForm>) => {
    reset({ ...defaultValues, ...presetValues });
  };

  return (
    <div className={cn("flex flex-col gap-6 p-6 bg-[var(--bg-elevated)] border border-[var(--ink-faint)] rounded-[var(--radius-sm)] shadow-[var(--shadow-deep)]", className)}>
      
      {/* Presets */}
      <div className="flex flex-col gap-2">
        <span className="text-[var(--fs-xs)] text-[var(--ink-muted)] uppercase tracking-wider font-display">
          {t('inputs.presets.title')}
        </span>
        <div className="flex flex-wrap gap-2">
          <div className="flex gap-2 ml-auto">
            <SaveScenarioDialog />
            <LoadScenarioTray />
          </div>
          {PRESETS.map((preset) => (
            <Button 
              key={preset.id} 
              variant={"outline" as ButtonVariant} 
              size="sm"
              onClick={() => handlePresetClick(preset.values)}
              className="text-[var(--fs-xs)]"
            >
              {t(preset.nameKey)}
            </Button>
          ))}
        </div>
      </div>

      <form className="flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
        
        {/* Diameter */}
        <Controller
          name="diameter"
          control={control}
          render={({ field, fieldState }) => (
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label htmlFor="diameter_m" className="text-[var(--fs-sm)] text-[var(--ink-primary)] font-display">
                  {t('inputs.diameter.label')}
                </label>
                <NumberField
                  id="diameter_m-input"
                  value={field.value as number}
                  onValueChange={(val) => field.onChange(val)}
                  min={1}
                  max={10000}
                  step={1}
                  aria-label={t('inputs.diameter.label')}
                  className="w-24"
                />
              </div>
              <Slider
                id="diameter_m"
                value={field.value as number}
                onValueChange={(val) => field.onChange(val)}
                min={1}
                max={10000}
                step={1}
                aria-label={t('inputs.diameter.label')}
              />
              {fieldState.error && (
                <span className="text-[var(--fs-xs)] text-[var(--danger-fire)]">{fieldState.error.message}</span>
              )}
            </div>
          )}
        />

        {/* Velocity */}
        <Controller
          name="velocity"
          control={control}
          render={({ field, fieldState }) => (
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label htmlFor="velocity_kms" className="text-[var(--fs-sm)] text-[var(--ink-primary)] font-display">
                  {t('inputs.velocity.label')}
                </label>
                <NumberField
                  id="velocity_kms-input"
                  value={field.value as number}
                  onValueChange={(val) => field.onChange(val)}
                  min={11.2}
                  max={72}
                  step={0.1}
                  aria-label={t('inputs.velocity.label')}
                  className="w-24"
                />
              </div>
              <Slider
                id="velocity_kms"
                value={field.value as number}
                onValueChange={(val) => field.onChange(val)}
                min={11.2}
                max={72}
                step={0.1}
                aria-label={t('inputs.velocity.label')}
              />
              {fieldState.error && (
                <span className="text-[var(--fs-xs)] text-[var(--danger-fire)]">{fieldState.error.message}</span>
              )}
            </div>
          )}
        />

        {/* Angle */}
        <Controller
          name="angle"
          control={control}
          render={({ field, fieldState }) => (
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label htmlFor="angle_deg" className="text-[var(--fs-sm)] text-[var(--ink-primary)] font-display">
                  {t('inputs.angle.label')}
                </label>
                <NumberField
                  id="angle_deg-input"
                  value={field.value as number}
                  onValueChange={(val) => field.onChange(val)}
                  min={1}
                  max={89}
                  step={1}
                  aria-label={t('inputs.angle.label')}
                  className="w-24"
                />
              </div>
              <Slider
                id="angle_deg"
                value={field.value as number}
                onValueChange={(val) => field.onChange(val)}
                min={1}
                max={89}
                step={1}
                aria-label={t('inputs.angle.label')}
              />
              {fieldState.error && (
                <span className="text-[var(--fs-xs)] text-[var(--danger-fire)]">{fieldState.error.message}</span>
              )}
            </div>
          )}
        />

        {/* Densities */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Controller
            name="density"
            control={control}
            render={({ field, fieldState }) => (
              <div className="flex flex-col gap-2">
                <label htmlFor="density_kgm3" className="text-[var(--fs-sm)] text-[var(--ink-primary)] font-display">
                  {t('inputs.density.label')}
                </label>
                <Select
                  id="density_kgm3"
                  value={(field.value as number).toString()}
                  onValueChange={(val) => field.onChange(Number(val))}
                  options={DENSITY_OPTIONS.map(opt => ({ value: opt.value.toString(), label: t(opt.labelKey) }))}
                  aria-label={t('inputs.density.label')}
                />
                {fieldState.error && (
                  <span className="text-[var(--fs-xs)] text-[var(--danger-fire)]">{fieldState.error.message}</span>
                )}
              </div>
            )}
          />

          <Controller
            name="targetDensity"
            control={control}
            render={({ field, fieldState }) => (
              <div className="flex flex-col gap-2">
                <label htmlFor="target_density_kgm3" className="text-[var(--fs-sm)] text-[var(--ink-primary)] font-display">
                  {t('inputs.targetDensity.label')}
                </label>
                <Select
                  id="target_density_kgm3"
                  value={(field.value as number).toString()}
                  onValueChange={(val) => field.onChange(Number(val))}
                  options={TARGET_DENSITY_OPTIONS.map(opt => ({ value: opt.value.toString(), label: t(opt.labelKey) }))}
                  aria-label={t('inputs.targetDensity.label')}
                />
                {fieldState.error && (
                  <span className="text-[var(--fs-xs)] text-[var(--danger-fire)]">{fieldState.error.message}</span>
                )}
              </div>
            )}
          />
        </div>

        {/* Location Picker Placeholder */}
        <div className="flex flex-col gap-2 pt-4 border-t border-[var(--ink-faint)]">
          <span className="text-[var(--fs-sm)] text-[var(--ink-primary)] font-display flex items-center gap-2">
            <MapPin size={16} className="text-[var(--accent-cyan)]" />
            {t('inputs.location.label')}
          </span>
          <Button variant={"outline" as ButtonVariant} className="w-full justify-start text-[var(--ink-muted)]" disabled>
            <Crosshair size={16} className="mr-2" />
            {t('inputs.location.placeholder')}
          </Button>
        </div>

        <ShareButton />

      </form>
    </div>
  );
}
