const TEXT_CONTENT_TYPE_PATTERN = /^text\//i;
const CHARSET_PATTERN = /;\s*charset=/i;

export function withTextCharset(response: Response): Response {
  const contentType = response.headers.get('Content-Type');
  if (contentType === null || !TEXT_CONTENT_TYPE_PATTERN.test(contentType) || CHARSET_PATTERN.test(contentType)) {
    return response;
  }

  const headers = new Headers(response.headers);
  headers.set('Content-Type', `${contentType}; charset=utf-8`);

  return new Response(response.body, {
    headers,
    status: response.status,
    statusText: response.statusText,
  });
}
