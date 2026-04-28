import type { AppLoadContext, EntryContext } from 'react-router';
import type { ComponentProps } from 'react';
import { ServerRouter } from 'react-router';
import { renderToString } from 'react-dom/server';
import { HelmetProvider } from 'react-helmet-async';

type HelmetContext = NonNullable<ComponentProps<typeof HelmetProvider>['context']>;

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext,
  _loadContext: AppLoadContext,
) {
  const helmetContext: HelmetContext = {};
  const html = renderToString(
    <HelmetProvider context={helmetContext}>
      <ServerRouter context={routerContext} url={request.url} />
    </HelmetProvider>,
  );
  const helmet = helmetContext.helmet;
  const head = helmet == null
    ? ''
    : [helmet.title, helmet.meta, helmet.link, helmet.script]
        .map((tag) => tag.toString())
        .join('');
  const document = head === '' ? html : html.replace('</head>', `${head}</head>`);

  responseHeaders.set('Content-Type', 'text/html');

  return new Response('<!DOCTYPE html>' + document, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}
