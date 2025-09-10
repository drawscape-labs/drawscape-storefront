## Sailboat Initialization from URL — Plan

### Goal
Initialize the Sailboat product page with the schematic specified in the URL query string when present (e.g., `?schematic_id=abc123`). If absent or invalid, fall back to the default schematic ID from environment, or the first available schematic.

### Scope
- Update `app/routes/products.sailboat.tsx` loader to read `schematic_id` (and `schematicId` alias) from the request URL.
- Validate the param against the fetched schematics list already retrieved in the loader.
- Compute a single `initialSchematicId` in the loader and return it to the client.
- Pass `initialSchematicId` to `ArtboardsProvider` so the context initializes correctly.

### Server Behavior (Loader)
1. Parse URL: `const url = new URL(args.request.url)`; read `url.searchParams.get('schematic_id') || url.searchParams.get('schematicId')`.
2. Fetch schematics (already done) and map to `{id, name}`.
3. Resolve `initialSchematicId` using precedence:
   - If a URL param exists and is in the fetched list, use it.
   - Else if an env default exists and is in the fetched list, use it.
   - Else use the first available schematic ID, or `null` if none.
4. Return `initialSchematicId` (replace or deprecate `defaultSchematicId` in component props).

### Client Behavior
- In `Product` component, read `initialSchematicId` from `useLoaderData` and pass it to `<ArtboardsProvider initialSchematicId={initialSchematicId}>`.
- No changes to `ArtboardsProvider`; it already initializes its state from the prop on mount.

### Pseudocode (for reference only)
```tsx
// In loader
const url = new URL(args.request.url);
const paramId = url.searchParams.get('schematic_id') || url.searchParams.get('schematicId');

// schematics fetched earlier: Schematic[] with {id, name}
const validIds = new Set(schematics.map((s) => s.id));
const envDefault = args.context.env.SAILBOAT_DEFAULT_SCHEMATIC_ID ?? null;

const initialSchematicId = paramId && validIds.has(paramId)
  ? paramId
  : envDefault && validIds.has(envDefault)
    ? envDefault
    : schematics[0]?.id ?? null;

return { ...deferredData, ...criticalData, initialSchematicId, schematics };

// In Product component
const { product, initialSchematicId, schematics } = useLoaderData<typeof loader>();
<ArtboardsProvider initialSchematicId={initialSchematicId}>...</ArtboardsProvider>
```

### Edge Cases
- No schematics available: `initialSchematicId` is `null`; context remains `idle` until selection.
- Invalid `schematic_id`: ignore and fall back per precedence above.
- Do not 4xx/redirect for invalid params in v1; keep UX resilient.

### Acceptance Criteria
- With `?schematic_id=<valid-id>`, the page loads with that schematic preselected and its vectors/title/subtitle populated.
- Without the param, the page uses the env default if valid; otherwise the first available schematic.
- Behavior is consistent on full SSR page load and client navigations.

### Out of Scope
- Writing the current selection back to the URL or redirecting to a canonicalized URL.
- Server-side validation beyond existence in fetched list.

### Server URL Param Access — Confirmation
Yes. Loaders run on the server and have full access to `args.request.url`. This project already constructs `new URL(args.request.url)` in `products.sailboat.tsx`, so parsing `searchParams` in the loader is supported and idiomatic in this codebase.


