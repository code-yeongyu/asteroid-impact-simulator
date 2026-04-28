import { useEffect } from 'react';
import { useImpactStore, useImpactResult } from '../../store';
import ImpactMap from '../../components/map/ImpactMap';
import Asteroid3D from '../../components/asteroid/Asteroid3D';
import { ResultsPanel } from '../../components/results/ResultsPanel';
import { TimelineCards } from '../../components/timeline/TimelineCards';
import DamageBreakdown from '../../components/charts/DamageBreakdown';
import EnergyCurves from '../../components/charts/EnergyCurves';
import { EnergyVsDiameter } from '../../components/charts/EnergyVsDiameter';
import { EnergyVsVelocity } from '../../components/charts/EnergyVsVelocity';
import { Button, Icon } from '../../components/ui';
import { ArrowLeft, ShareNetwork } from '@phosphor-icons/react';
import { Link } from 'react-router';
import type { LocationPick } from '../../components/map/ImpactMap';
import type { Latitude, Longitude } from '../../types/branded';
import type { ImpactResult } from '../../lib/physics/types';

export default function SimulatorPage() {
  const { result, isComputing } = useImpactResult();
  const params = useImpactStore((state) => state.params);
  const setLocation = useImpactStore((state) => state.setLocation);
  const computeResultNow = useImpactStore((state) => state.computeResultNow);

  // Initial computation if we have params but no result
  useEffect(() => {
    if (!result && !isComputing) {
      computeResultNow();
    }
  }, [result, isComputing, computeResultNow]);

  // Map damage radii from result
  const damageRadii = result ? {
    crater: (result.craterDiameter ?? 0) * 1000 / 2,
    fireball: result.fireballRadius * 1000,
    severeBlast: (result.damageZones.find(z => z.kind === 'overpressure_lethal')?.radiusKm ?? 0) * 1000,
    lightBlast: (result.damageZones.find(z => z.kind === 'window_break')?.radiusKm ?? 0) * 1000,
  } : undefined;

  // Determine asteroid type for 3D canvas based on density
  const getAsteroidType = (density: number) => {
    if (density > 5000) return 'iron';
    if (density < 1500) return 'cometary';
    return 'rocky';
  };

  const handleLocationSelect = (loc: LocationPick) => {
    setLocation({
      lat: loc.lat as Latitude,
      lng: loc.lng as Longitude,
      label: loc.placeName
    });
  };

  return (
    <div className="min-h-[100dvh] bg-bg-void text-ink-primary flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-bg-elevated/80 backdrop-blur-md border-b border-ink-faint/20 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <Icon icon={ArrowLeft} size="sm" />
              <span className="sr-only md:not-sr-only ml-2">Back</span>
            </Button>
          </Link>
          <h1 className="font-display text-[var(--fs-md)] font-bold tracking-tight">
            Asteroid Impact Simulator
          </h1>
        </div>
        <Button variant="ghost" size="sm">
          <Icon icon={ShareNetwork} size="sm" />
          <span className="sr-only md:not-sr-only ml-2">Share</span>
        </Button>
      </header>

      {/* Main Layout */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* Left Sidebar: Inputs (Placeholder for T19) & 3D Canvas */}
        <aside className="w-full lg:w-[400px] flex-shrink-0 border-r border-ink-faint/20 bg-bg-deep flex flex-col overflow-y-auto">
          <div className="p-4 border-b border-ink-faint/20">
            <h2 className="font-display text-[var(--fs-lg)] mb-4">Parameters</h2>
            <div className="p-4 bg-bg-elevated rounded-lg border border-ink-faint/30 text-ink-muted text-sm text-center">
              [Inputs Panel (T19) will be mounted here]
            </div>
          </div>
          
          <div className="p-4 flex-1 min-h-[300px]">
            <h3 className="font-display text-[var(--fs-sm)] text-ink-muted uppercase tracking-wider mb-3">
              Impactor Preview
            </h3>
            <div className="w-full h-[250px] rounded-lg overflow-hidden border border-ink-faint/20">
              <Asteroid3D 
                type={getAsteroidType(params.density)} 
                size={Math.max(0.5, Math.min(2, params.diameter / 1000))} 
              />
            </div>
          </div>
        </aside>

        {/* Center: Map */}
        <section className="flex-1 relative min-h-[50vh] lg:min-h-0">
          <ImpactMap
            lat={params.location.lat}
            lng={params.location.lng}
            damageRadii={damageRadii}
            onLocationSelect={handleLocationSelect}
            className="absolute inset-0 rounded-none"
          />
        </section>

        {/* Right Sidebar: Results & Analysis */}
        <aside className="w-full lg:w-[450px] flex-shrink-0 border-l border-ink-faint/20 bg-bg-deep flex flex-col overflow-y-auto">
          {isComputing ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="animate-pulse text-accent-cyan flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>Computing impact physics...</span>
              </div>
            </div>
          ) : result ? (
            <div className="flex flex-col gap-6 p-4">
              {/* Primary Results */}
              <ResultsPanel result={result as unknown as ImpactResult} />

              {/* Timeline */}
              <section>
                <h3 className="font-display text-[var(--fs-md)] mb-4">Event Timeline</h3>
                <TimelineCards />
              </section>

              {/* Charts */}
              <section className="flex flex-col gap-6">
                <h3 className="font-display text-[var(--fs-md)]">Analysis</h3>
                
                <div className="bg-bg-elevated p-4 rounded-lg border border-ink-faint/20">
                  <h4 className="text-[var(--fs-sm)] text-ink-muted mb-4">Damage Breakdown</h4>
                  <DamageBreakdown result={result as unknown as ImpactResult} />
                </div>

                <div className="bg-bg-elevated p-4 rounded-lg border border-ink-faint/20">
                  <h4 className="text-[var(--fs-sm)] text-ink-muted mb-4">Energy Distribution</h4>
                  <EnergyCurves currentDiameter={params.diameter} currentVelocity={params.velocity} currentEnergy={result.kineticEnergy} />
                </div>

                <div className="bg-bg-elevated p-4 rounded-lg border border-ink-faint/20">
                  <h4 className="text-[var(--fs-sm)] text-ink-muted mb-4">Energy vs Diameter</h4>
                  <EnergyVsDiameter width={350} height={200} currentDiameter={params.diameter} currentEnergy={result.kineticEnergy} />
                </div>

                <div className="bg-bg-elevated p-4 rounded-lg border border-ink-faint/20">
                  <h4 className="text-[var(--fs-sm)] text-ink-muted mb-4">Energy vs Velocity</h4>
                  <EnergyVsVelocity width={350} height={200} currentVelocity={params.velocity} currentEnergy={result.kineticEnergy} />
                </div>
              </section>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-ink-muted text-center">
              Select a location and parameters to see impact results.
            </div>
          )}
        </aside>

      </main>
    </div>
  );
}
