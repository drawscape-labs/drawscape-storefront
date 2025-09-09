## Move Legend data into Artboard Context

### Goal
- Centralize legend state in `app/context/artboards.tsx` so components can read/update it from context.
- Initialize legend from the selected schematic’s default legend on initial load and whenever the schematic selection changes.
- Ensure legend is an array of objects: `{ label: string; content: string }[]`.

### Notes from current codebase/API
- `ArtboardsProvider` already fetches schematic details from `API.get('/schematics/${schematicId}')` and stores it in `schematic`.
- `ArtboardPreview` currently sends a hard-coded legend: `[{ label: 'Legend', content: 'Legend' }]`.
- API spec (`api.yaml`): Legend is an array of `{ label, content }`. We'll assume it always arrives in this shape.

### Data model additions
- In `app/context/artboards.tsx`:
  - Add `export type LegendItem = { label: string; content: string }`.
  - Extend `ArtboardsContextValue` with:
    - `legend: LegendItem[]`
    - `setLegend: (items: LegendItem[]) => void`

### Populate/reset rules
- On initial load after `schematic` is fetched: set `legend = schematic?.legend ?? []`.
- When `schematicId` changes (via select list): refetch schematic and then repopulate `legend` from the new schematic.
- If `schematicId` becomes `null`: clear `legend` to `[]`.
- If `schematic` object is updated (e.g., refetch or external update): repopulate `legend` from the new schematic.

Implementation hook points in `ArtboardsProvider`:
- Create `const [legend, setLegend] = useState<LegendItem[]>([])`.
- Add an effect that reacts to `schematicId`/`schematic?.legend` transitions to reset legend appropriately:

```ts
useEffect(() => {
  if (!schematicId) {
    setLegend([]);
    return;
  }
  setLegend(schematic?.legend ?? []);
}, [schematicId, schematic?.legend]);
```

### Context value update
- Include `legend` and `setLegend` in the memoized `value` returned by `ArtboardsProvider`.

### Consumers to update
- `app/components/ArtboardPreview.tsx`:
  - Replace hard-coded payload legend with `legend` from context.

```ts
const { schematicId, schematicVectorId, vectors, legend } = useArtboards();
// ...
const payload = {
  render_style: 'blueprint',
  title: 'Preview Title',
  subtitle: 'Preview Subtitle',
  schematic_url: schematicUrl,
  color_scheme: 'blue_white',
  paper_color: 'navy',
  pen_color: 'white',
  size: 'letter',
  orientation: 'portrait',
  legend, // use context legend
};
```

- Any future legend editing UI can call `setLegend` to update the array in context. For this plan, no editing UI is required.

### Edge cases
- Missing/empty schematic legend: set `legend` to `[]` and let downstream use their own fallback if desired.
- Avoid clobbering user edits mid-session: not required for this scope. If needed later, introduce an "isDirty" flag to suppress auto-resets when the user has edited legend.

### Acceptance criteria
- Legend is exposed via `useArtboards()` as an array of `{ label, content }`.
- On first schematic load, `legend` equals the schematic’s default legend.
- Changing the selected schematic resets `legend` to that schematic’s default.
- `ArtboardPreview` sends the context legend, not a hard-coded legend.
- No routing/import regressions; existing behavior for schematic/vector selection remains intact.
