import { useEffect } from 'react';
import { hydrateImpactStoreFromLocation, startImpactStoreUrlSync } from '../../src/store';

let hasHydratedUrlState = false;

function hydrateUrlStateBeforeFirstRender(): void {
  if (hasHydratedUrlState || typeof window === 'undefined') {
    return;
  }

  hasHydratedUrlState = true;
  hydrateImpactStoreFromLocation(window.location.search);
}

export default function SimulatorPage() {
  hydrateUrlStateBeforeFirstRender();

  useEffect(() => startImpactStoreUrlSync(), []);

  return (
    <div className="min-h-[100dvh] bg-slate-950 text-slate-100 flex items-center justify-center">
      <h1 className="text-3xl font-bold">Simulator</h1>
    </div>
  );
}
