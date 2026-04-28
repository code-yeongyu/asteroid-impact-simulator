import { type ReactNode } from 'react';

interface NumberProps {
  children: ReactNode;
}

export function Number({ children }: NumberProps): React.ReactElement {
  return <bdi dir="ltr">{children}</bdi>;
}
