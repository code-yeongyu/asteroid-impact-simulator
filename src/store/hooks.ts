import { useShallow } from 'zustand/react/shallow';
import type { DomainImpactResult } from '../types';
import { useImpactStore } from './impactStore';

export interface ImpactResultSnapshot {
  result: DomainImpactResult | null;
  isComputing: boolean;
}

export function useImpactResult(): ImpactResultSnapshot {
  return useImpactStore(
    useShallow((state) => ({
      result: state.result,
      isComputing: state.isComputing,
    })),
  );
}
