export type ClassValue = string | number | null | false | undefined | ClassValue[];

export function cn(...values: ClassValue[]): string {
  const out: string[] = [];
  for (const v of values) {
    if (v === null || v === undefined || v === false || v === '' || v === 0) continue;
    if (Array.isArray(v)) {
      const inner = cn(...v);
      if (inner.length > 0) out.push(inner);
    } else if (typeof v === 'string' || typeof v === 'number') {
      out.push(String(v));
    }
  }
  return out.join(' ');
}
