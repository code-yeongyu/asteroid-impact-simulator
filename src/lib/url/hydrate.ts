import type { AsteroidParams } from '../../types';
import { decodeShareUrl, replaceCurrentShareUrl } from './share';

export function decodeHydratedParams(search: string | URLSearchParams, fallbackParams: AsteroidParams): AsteroidParams | null {
  return decodeShareUrl(search, fallbackParams);
}

export function replaceUrlFromParams(params: AsteroidParams): string | null {
  return replaceCurrentShareUrl(params);
}
