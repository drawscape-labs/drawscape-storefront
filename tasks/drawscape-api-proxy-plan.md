### Feature: Same-origin Drawscape API via server proxy route

#### Context
- Current client library requires configuring a base URL from React components.
- This couples UI to environment details and risks leaking upstream URLs or tokens.
- Hydrogen app already uses server routes (React Router) suitable for proxying external APIs.

#### Goals
- Provide a stable same-origin path for all Drawscape requests: `/api/drawscape/*`.
- Eliminate client-side base URL management and environment branching.
- Centralize auth, headers, and observability on the server.
- Maintain streaming, binary support, and transparent status codes.

#### Non-goals
- Rewriting the Drawscape API itself.
- Building a full caching or rate-limit layer (can be added later).

### High-level design
- Add a server route file: `app/routes/api.drawscape.$.tsx`.
  - Handles GET via `loader` and non-GET via `action`.
  - Forwards method, path, query, headers, and (when applicable) body to external Drawscape.
  - Builds target URL from `context.env.DRAWSCAPE_API_URL` + the rest of the path.
  - Streams response body back, sanitizing hop-by-hop headers.
  - Optionally attaches server-side auth header if `DRAWSCAPE_API_TOKEN` is present.
- Simplify client library `app/lib/drawscapeApi.ts`:
  - Default base to same-origin `/api/drawscape`.
  - Remove `setDrawscapeBaseUrl` and all component wiring.
  - Keep `get/post/put/delete` helpers with support for JSON, FormData, and blob.
- Update components (e.g., `ArtboardSelectSchematic`) to stop configuring a base URL and keep calling `API.get('schematics', ...)`.

### Route behavior (pseudocode)
```ts
// app/routes/api.drawscape.$.tsx (conceptual)
import type {LoaderFunctionArgs, ActionFunctionArgs} from 'react-router';

function buildTargetUrl(request: Request, base: string, rest: string | undefined) {
  const incomingUrl = new URL(request.url);
  const path = rest ? rest.replace(/^\//, '') : '';
  const target = new URL(base.replace(/\/$/, '') + '/' + path);
  target.search = incomingUrl.search; // preserve query
  return target.toString();
}

async function proxy(request: Request, args: {baseUrl: string; rest: string | undefined}) {
  const url = buildTargetUrl(request, args.baseUrl, args.rest);
  const method = request.method.toUpperCase();
  const init: RequestInit = {
    method,
    headers: request.headers,
    body: method === 'GET' || method === 'HEAD' ? undefined : request.body,
    redirect: 'manual',
  };
  const resp = await fetch(url, init);
  return new Response(resp.body, {
    status: resp.status,
    statusText: resp.statusText,
    headers: resp.headers,
  });
}

export async function loader({request, params, context}: LoaderFunctionArgs) {
  const base = context.env.DRAWSCAPE_API_URL;
  return proxy(request, {baseUrl: base, rest: params['*']});
}

export async function action({request, params, context}: ActionFunctionArgs) {
  const base = context.env.DRAWSCAPE_API_URL;
  return proxy(request, {baseUrl: base, rest: params['*']});
}
```

### Client library shape (pseudocode)
```ts
// app/lib/drawscapeApi.ts (conceptual)
import axios, {AxiosRequestConfig, AxiosResponse} from 'axios';

const DEFAULT_BASE = '/api/drawscape';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

type RequestOptions = Omit<AxiosRequestConfig, 'url' | 'method' | 'data' | 'params' | 'headers' | 'responseType'> & {
  headers?: Record<string, string>;
  responseType?: AxiosRequestConfig['responseType'];
};

async function request<T>(
  method: HttpMethod,
  endpoint: string,
  data?: any,
  params?: Record<string, any>,
  options: RequestOptions = {}
): Promise<T> {
  const headers: Record<string, string> = {
    ...(!(data instanceof FormData) ? {'Content-Type': 'application/json'} : {}),
    ...(options.headers || {}),
  };

  const axiosConfig: AxiosRequestConfig = {
    method,
    url: `${DEFAULT_BASE}/${endpoint.replace(/^\//, '')}`,
    headers,
    responseType: options.responseType || 'json',
    data,
    params,
    ...options,
  };

  const response: AxiosResponse<T> = await axios(axiosConfig);
  return options.responseType === 'blob' ? (response as unknown as T) : response.data;
}

export default {
  get: <T = any>(endpoint: string, params?: Record<string, any>, options?: RequestOptions) =>
    request<T>('GET', endpoint, undefined, params, options),
  post: <T = any>(endpoint: string, data?: any, options?: RequestOptions) =>
    request<T>('POST', endpoint, data, undefined, options),
  put: <T = any>(endpoint: string, data?: any, options?: RequestOptions) =>
    request<T>('PUT', endpoint, data, undefined, options),
  delete: <T = any>(endpoint: string, options?: RequestOptions) =>
    request<T>('DELETE', endpoint, undefined, undefined, options),
};
```

### Security & compliance
- Secrets: use `context.env.DRAWSCAPE_API_URL` (and optional `DRAWSCAPE_API_TOKEN`). No client exposure.
- Header controls: strip hop-by-hop headers; allowlist or pass-through safe headers (implementation detail).
- Path safety: normalize `rest` path; optional allowlist `/schematics`, `/artboards`, etc. (future hardening).
- CORS: same-origin route avoids browser CORS issues.
- Error handling: pass through status codes; avoid leaking stack traces; normalize error messages if needed.

### Edge cases
- Binary responses (e.g., image/PDF): preserve `Content-Type`, stream body, support `blob` client option.
- FormData uploads: do not set JSON content-type; forward as-is.
- Timeouts/retries: defer to platform defaults now; can add later.
- SSR and client both hit same-origin path; no environment branching required.

### Observability (optional, later)
- Log request id, method, path, status, latency.
- Forward a correlation id header to upstream; surface in responses.

### Rollout plan
1. Add `app/routes/api.drawscape.$.tsx` with proxy logic.
2. Simplify `app/lib/drawscapeApi.ts` to default to `/api/drawscape`; remove base URL setter.
3. Remove `setDrawscapeBaseUrl` usage from `ArtboardSelectSchematic` and any other components.
4. Local test matrix:
   - GET `/api/drawscape/schematics?published=true`
   - POST `/api/drawscape/...` with JSON
   - Upload with FormData
   - Blob download
   - Error propagation (404/500)
5. Configure envs: ensure `DRAWSCAPE_API_URL` present in Oxygen/env.
6. Update README notes for Drawscape usage and env configuration.

### Risks & mitigations
- Upstream outages propagate: acceptable; consider circuit breaker in future.
- Route becoming an open proxy: mitigate via path allowlist/auth if needed.
- Header mismatches: sanitize and test typical CRUD + binary flows.

### Success criteria
- No client code needs environment-specific base URLs.
- All Drawscape calls succeed via `/api/drawscape/*` across environments.
- Secrets remain server-only; no public exposure in client bundle.
