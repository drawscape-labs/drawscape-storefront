## Goal
Render an SVG preview using the Drawscape endpoint `POST /api/v1/artboard/render` and display it in the existing `app/components/ArtboardPreview.tsx`. Use the real `schematic_url` from the selected schematic vector; keep dummy values only for non-critical optional fields until real data is wired.

## API contract (from api.yaml)
Endpoint: `/api/v1/artboard/render` (POST)
- Required: `render_style: string`, `title: string`, `schematic_url: string`
- Optional: `subtitle`, `color_scheme`, `paper_color`, `pen_color`, `size`, `orientation`, `legend`
- Response: `object` (may be raw SVG text or JSON containing SVG data/URL)

All client calls must go through our proxy client:
```ts
import API from '~/lib/drawscapeApi';
```
Calls will be made to `API.post('artboard/render', data, options)` which hits `/api/drawscape/artboard/render` server-side.

## Design decision: where to call the API
- Short-term (now): Implement the request inside `ArtboardPreview`.
  - Rationale: The preview is ephemeral and local to the component, keeps scope minimal, easy to iterate, no shared caching yet.
- Future (optional): Extract to context/hook if we need sharing/caching across components.
  - Option A: Add `renderedSvg` and a keyed cache to `ArtboardsProvider` keyed by `(schematicId, vectorId, style params)`.
  - Option B: Create `useRenderedArtboard` hook that encapsulates fetch, cache, and cancellation.

## Minimal UX
- `ArtboardPreview` shows loading, error, and the rendered SVG.
- Automatically re-renders when inputs change (e.g., `schematicId`, `schematicVectorId`, or style controls once available).

## Data sources
- `schematic_url` comes from the selected schematic vector (available via `useArtboards()`):
  - Prefer a direct URL field on the vector if present (e.g., `url`, `public_url`, `download_url`).
  - If the vector lacks a URL field, fetch one via `GET /api/v1/schematic-vectors/{id}/download-url` and use the returned URL.
  - We may extend the `VectorOption` mapping in `app/context/artboards.tsx` to include any existing URL fields if present in API responses.
- Keep dummy values only for non-critical styling fields for now:
  - `render_style`: 'technical'
  - `title`: 'Preview Title'
  - Optional: `size: 'letter'`, `orientation: 'portrait'`, `pen_color: '#000000'`, `paper_color: '#FFFFFF'`, etc.

## Response handling
Handle both possibilities to be robust:
- Raw SVG string response
  - Use `options: { responseType: 'text' }` and treat response as SVG markup.
- JSON object
  - Possible fields might be `svg`, `svg_text`, or `svg_url` (TBD). If `svg_url`, fetch it as text.
- Safeguards
  - Only render markup that appears to be SVG (e.g., contains `<svg`). Otherwise, fall back to using a URL form if available.

## Component integration steps (ArtboardPreview)
1. Add local state in `ArtboardPreview`:
   - `isLoading: boolean`, `error: string | null`, `svgMarkup: string | null`.
2. Trigger request on mount and when dependencies change:
   - Dependencies: `schematicId`, `schematicVectorId`, and (later) style inputs.
   - Use an `AbortController`/incrementing request id to ignore stale responses.
3. Build payload with real `schematic_url` from the selected vector:
```ts
const { vectors, schematicVectorId } = useArtboards();
const selectedVector = vectors.find(v => v.id === schematicVectorId) || null;

// Option A: URL already on vector
const vectorUrl = (selectedVector as any)?.url || (selectedVector as any)?.public_url || (selectedVector as any)?.download_url;

// Option B: fetch download URL when not present
const schematicUrl = vectorUrl || await API.get<{ url: string }>(`schematic-vectors/${schematicVectorId}/download-url`).then(r => (r as any)?.url);

const payload = {
  render_style: 'technical',
  title: 'Preview Title',
  schematic_url: schematicUrl,
  // Optional presentation defaults
  color_scheme: 'mono',
  paper_color: '#FFFFFF',
  pen_color: '#000000',
  size: 'letter',
  orientation: 'portrait',
  legend: { enabled: false },
};
```
4. Call the API via proxy:
```ts
// Prefer text response in case API returns raw SVG
const result = await API.post<string>('artboard/render', payload, { responseType: 'text' });
```
5. Normalize result:
   - If `typeof result === 'string' && result.includes('<svg')` → set `svgMarkup = result`.
   - Else if JSON: inspect for `svg | svg_text | svg_url` and fetch string if needed.
6. Render:
```tsx
{svgMarkup ? (
  <div dangerouslySetInnerHTML={{ __html: svgMarkup }} />
) : isLoading ? (
  <div>Rendering…</div>
) : error ? (
  <div className="text-red-600">{error}</div>
) : null}
```
7. Handle errors and cancellation; clear on dependency change.

## Optional small UI wiring now
- Place `ArtboardPreview` alongside existing selectors (`ArtboardSelectSchematic`, `ArtboardSelectVectors`) so changing selections triggers re-rendering.

## Testing / validation
- Manually verify preview updates when changing selections.
- Verify graceful handling of API failures (network errors, non-SVG responses).
- Confirm no unbounded re-renders; ensure debounce if style controls are added.

## Follow-ups (post-approval, separate tasks)
- Extend vector mapping in context to include a stable URL field when available.
- Add simple memo/cache keyed by `(schematicId, schematicVectorId, style)` either locally or in context.
- Add basic style controls (pen/paper color, size, orientation) to experiment with render variations.
- Centralize normalization of API response into a small helper (`normalizeRenderResponse`).
- Decide on sanitization strategy for SVG or use URL-based rendering if supported by API.
