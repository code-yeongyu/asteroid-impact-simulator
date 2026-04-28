import { createContext, useContext } from 'react';

export type TextDirection = 'ltr' | 'rtl';

export interface DirectionContextValue {
  direction: TextDirection;
}

export const DirectionContext = createContext<DirectionContextValue>({
  direction: 'ltr',
});

export function useDirection(): TextDirection {
  return useContext(DirectionContext).direction;
}
