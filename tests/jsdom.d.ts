declare module 'jsdom' {
  export class JSDOM {
    constructor(markup?: string, options?: { url?: string });

    readonly window: Window & typeof globalThis;
  }
}
