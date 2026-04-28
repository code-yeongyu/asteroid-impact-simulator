import { withTextCharset } from './lib/charset';

type AssetBinding = {
  fetch(request: Request): Promise<Response>;
};

type Env = {
  ASSETS: AssetBinding;
  COMMIT_SHA?: string;
};

function healthResponse(commit: string): Response {
  return Response.json(
    { status: 'ok', commit },
    {
      headers: {
        'Cache-Control': 'no-store',
        'Content-Type': 'application/json; charset=utf-8',
      },
    },
  );
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === '/api/health') {
      return healthResponse(env.COMMIT_SHA ?? 'local');
    }

    const response = await env.ASSETS.fetch(request);
    return withTextCharset(response);
  },
};

export type { Env };
