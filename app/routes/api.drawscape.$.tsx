import type {LoaderFunctionArgs, ActionFunctionArgs} from 'react-router';

/**
 * Proxy route for Drawscape API requests
 * Forwards requests from /api/drawscape/* to the configured DRAWSCAPE_API_URL
 * This provides a same-origin endpoint for the client, avoiding CORS issues
 * and keeping API credentials server-side only
 */

const HOP_BY_HOP_HEADERS = [
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailers',
  'transfer-encoding',
  'upgrade',
  'proxy-connection',
  'content-encoding',
  'content-length',
];

function buildTargetUrl(request: Request, baseUrl: string, restPath: string | undefined): string {
  const incomingUrl = new URL(request.url);
  const path = restPath ? restPath.replace(/^\//, '') : '';
  const targetUrl = new URL(`${baseUrl.replace(/\/$/, '')}/${path}`);
  targetUrl.search = incomingUrl.search;
  return targetUrl.toString();
}

function sanitizeHeaders(headers: Headers): Headers {
  const sanitized = new Headers();
  
  headers.forEach((value, key) => {
    const lowerKey = key.toLowerCase();
    if (!HOP_BY_HOP_HEADERS.includes(lowerKey)) {
      sanitized.set(key, value);
    }
  });
  
  return sanitized;
}

async function proxy(
  request: Request,
  context: {env: {DRAWSCAPE_API_URL?: string; DRAWSCAPE_API_TOKEN?: string}},
  restPath: string | undefined
): Promise<Response> {
  const baseUrl = context.env.DRAWSCAPE_API_URL;
  if (!baseUrl) {
    return new Response(JSON.stringify({error: 'Drawscape API URL not configured'}), {
      status: 500,
      headers: {'Content-Type': 'application/json'},
    });
  }

  const targetUrl = buildTargetUrl(request, baseUrl, restPath);
  const method = request.method.toUpperCase();
  
  const headers = new Headers(request.headers);
  headers.delete('host');
  
  if (context.env.DRAWSCAPE_API_TOKEN) {
    headers.set('Authorization', `Bearer ${context.env.DRAWSCAPE_API_TOKEN}`);
  }

  const init: RequestInit = {
    method,
    headers: sanitizeHeaders(headers),
    redirect: 'manual',
  };

  if (method !== 'GET' && method !== 'HEAD') {
    init.body = await request.arrayBuffer();
  }

  try {
    const response = await fetch(targetUrl, init);
    
    const responseHeaders = sanitizeHeaders(response.headers);
    responseHeaders.set('X-Proxied-From', 'drawscape-api');
    
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return new Response(JSON.stringify({error: 'Failed to proxy request'}), {
      status: 502,
      headers: {'Content-Type': 'application/json'},
    });
  }
}

export async function loader({request, params, context}: LoaderFunctionArgs) {
  return proxy(request, context, params['*']);
}

export async function action({request, params, context}: ActionFunctionArgs) {
  return proxy(request, context, params['*']);
}