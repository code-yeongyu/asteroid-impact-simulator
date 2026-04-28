import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  url: 'http://localhost/en/simulator',
});

const windowPropertyNames = [
  'window',
  'document',
  'navigator',
  'HTMLElement',
  'HTMLButtonElement',
  'HTMLInputElement',
  'HTMLCanvasElement',
  'Element',
  'Node',
  'Event',
  'KeyboardEvent',
  'MouseEvent',
  'CustomEvent',
  'localStorage',
  'sessionStorage',
  'getComputedStyle',
  'requestAnimationFrame',
  'cancelAnimationFrame',
] as const;

for (const propertyName of windowPropertyNames) {
  Object.defineProperty(globalThis, propertyName, {
    configurable: true,
    value: dom.window[propertyName],
  });
}

const { afterEach } = await import('vitest');
const { cleanup } = await import('@testing-library/react');
await import('@testing-library/jest-dom/vitest');

afterEach(() => {
  cleanup();
});
