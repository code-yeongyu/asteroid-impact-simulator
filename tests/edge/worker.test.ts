import { describe, expect, it } from 'vitest';

import worker, { type Env } from '../../worker/index';

function createEnv(response: Response): Env {
  return {
    ASSETS: {
      fetch(): Promise<Response> {
        return Promise.resolve(response);
      },
    },
    COMMIT_SHA: 'test-commit',
  };
}

describe('Cloudflare Worker edge handler', () => {
  it('returns health JSON without hitting static assets', async () => {
    // given
    const env = createEnv(new Response('asset fallback', { status: 500 }));
    const request = new Request('https://asteroid.example/api/health');

    // when
    const response = await worker.fetch(request, env);

    // then
    await expect(response.json()).resolves.toEqual({ status: 'ok', commit: 'test-commit' });
    expect(response.status).toBe(200);
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(response.headers.get('Content-Type')).toBe('application/json; charset=utf-8');
  });

  it('adds utf-8 charset to text asset responses', async () => {
    // given
    const html = new Response('<!doctype html>', {
      headers: { 'Content-Type': 'text/html' },
    });
    const env = createEnv(html);

    // when
    const response = await worker.fetch(new Request('https://asteroid.example/en'), env);

    // then
    expect(response.headers.get('Content-Type')).toBe('text/html; charset=utf-8');
  });

  it('preserves existing charset on text asset responses', async () => {
    // given
    const css = new Response('body{}', {
      headers: { 'Content-Type': 'text/css; charset=iso-8859-1' },
    });
    const env = createEnv(css);

    // when
    const response = await worker.fetch(new Request('https://asteroid.example/assets/index.css'), env);

    // then
    expect(response.headers.get('Content-Type')).toBe('text/css; charset=iso-8859-1');
  });
});
