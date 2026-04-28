import { useEffect } from 'react';
import { hydrateImpactStoreFromLocation, startImpactStoreUrlSync } from '../../src/store';
import RealSimulatorPage from '../../src/pages/simulator/SimulatorPage';

let hasHydratedUrlState = false;

function hydrateUrlStateBeforeFirstRender(): void {
  if (hasHydratedUrlState || typeof window === 'undefined') {
    return;
  }
  hasHydratedUrlState = true;
  hydrateImpactStoreFromLocation(window.location.search);
}

export default function SimulatorRoute() {
  hydrateUrlStateBeforeFirstRender();
  useEffect(() => startImpactStoreUrlSync(), []);
  return <RealSimulatorPage />;
}
