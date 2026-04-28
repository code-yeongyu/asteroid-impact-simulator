import { cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react';
import { useDirection } from './DirectionContext';

interface RtlPortalWrapperProps {
  children: ReactNode;
}

export function RtlPortalWrapper({ children }: RtlPortalWrapperProps): React.ReactElement {
  const direction = useDirection();

  if (isValidElement(children)) {
    return cloneElement(children as ReactElement<Record<string, unknown>>, {
      dir: direction,
    });
  }

  return <div dir={direction}>{children}</div>;
}
