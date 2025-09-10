## Artboard Context Simplification Plan

### Goal
- Expose only selection IDs to consumers (`schematicId`, `vectorId`).
- Keep fetched `schematic` internal to the provider; remove `setSchematic` from public API.
- Expose `vectors` as derived data. Provide normal getters/setters for `legend`, `title`, and `subtitle`.
- Keep the public API intention-based for selection (schematic/vector) and predictable effects.

### Current Pain Points
- Duplicated/overlapping state: both IDs and full objects are public, plus `legend` has its own setter.
- Multiple effects make it unclear what triggers what; transient nulling causes flicker.
- Consumers juggle props vs context (especially vector select), increasing complexity.

### Public API (proposed)
```ts
// app/context/artboards.tsx
export type LegendItem = { label: string; content: string };

export type VectorOption = {
  id: string;
  title?: string;
  url?: string;
  filename?: string;
  orientation?: string;
  primary?: boolean;
  optimized?: boolean;
  published?: boolean;
};

type ArtboardsContextValue = {
  schematicId: string | null;
  selectSchematic: (id: string | null) => void; // clears invalid vector and triggers fetch

  vectorId: string | null;
  selectVector: (id: string | null) => void; // no fetch

  vectors: VectorOption[];              // derived from internal schematic
  selectedVector: VectorOption | null;  // derived from vectors + vectorId

  legend: LegendItem[];                 // controlled state (initialized from schematic)
  setLegend: (items: LegendItem[]) => void;
  title?: string;                       // controlled state (initialized from schematic)
  setTitle: (title?: string) => void;
  subtitle?: string;                    // controlled state (initialized from schematic)
  setSubtitle: (subtitle?: string) => void;

  status: 'idle' | 'loading' | 'ready' | 'error';
  error: string | null;
};
```

### Internal State Model
- Internal only: `schematic: Schematic | null`, `status`, `error`.
- Public selection: `schematicId`, `vectorId`.
- Controlled presentation state: `legend`, `title`, `subtitle` (initialized from fetched schematic on success).
- Derived: `vectors`, `selectedVector` via `useMemo`.

### Effects (only two)
1) On `schematicId` change
   - If null → clear `schematic`, `vectorId`, `legend`, `title`, `subtitle`; set `status='idle'`.
   - Else → set `status='loading'`, fetch schematic via Drawscape API; on success set `schematic` and initialize `legend`, `title`, `subtitle` from the response; set `status='ready'`. On failure set `error` and `status='error'`.

2) On `[vectors, vectorId]`
   - Run `chooseVectorId(vectors, vectorId)`; keep current if valid → else primary → else first → else `null`.
   - Update `vectorId` only when it changes.

### Normalization Rules
- Normalize vectors once (existing code already maps to `VectorOption`).
- On successful fetch, initialize `legend = schematic?.legend ?? []`, `title = schematic?.title`, `subtitle = schematic?.subtitle`.

### Implementation Steps
1) Update context types
   - Rename `schematicVectorId` → `vectorId` and `setSchematicVectorId` → `selectVector`.
   - Remove `schematic` and `setSchematic` from the exported context value.
   - Expose `legend`, `title`, `subtitle` with setters: `setLegend`, `setTitle`, `setSubtitle`.
   - Add `selectedVector`, `status`, and `error` to the public API.

2) Refactor provider internals in `app/context/artboards.tsx`
   - Keep `schematic` internal. Retain existing fetch logic; avoid forcibly setting `schematic=null` mid-switch to reduce flicker.
   - Initialize `legend`, `title`, and `subtitle` from the fetched schematic on success.
   - Collapse effects into the two listed above.
   - Keep current `chooseVectorId` algorithm.

3) Update consumers
   - `ArtboardSelectSchematic.tsx`: use `schematicId` and `selectSchematic` (no other changes needed).
   - `ArtboardSelectVectors.tsx`: use `vectors`, `vectorId`, `selectVector`; remove prop/context juggling and fallbacks.
   - `ArtboardPreview.tsx`: compute `selectedVector` from context or use the newly exposed `selectedVector`; rely on `legend`, `title`, `subtitle`, and `status`.

4) Add minimal types
   - Define `Schematic` shape locally (id, vectors/legend/title/subtitle) to replace `any`.
   - Keep `VectorOption`/`LegendItem` as-is; extend only if required by API.

5) Optional improvements (time-permitting)
   - Add a tiny in-memory cache `Map<string, Schematic>` by `schematicId` to prevent re-fetch flicker.
   - Dev warnings if a component tries to access removed fields.

### Pseudocode Outline
```ts
// Selection
const [schematicId, setSchematicId] = useState<string | null>(initialSchematicId ?? null);
const [vectorId, setVectorId] = useState<string | null>(null);

// Internal data
const [schematic, setSchematic] = useState<Schematic | null>(null);
const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
const [error, setError] = useState<string | null>(null);

// Controlled presentation
const [legend, setLegend] = useState<LegendItem[]>([]);
const [title, setTitle] = useState<string | undefined>(undefined);
const [subtitle, setSubtitle] = useState<string | undefined>(undefined);

// Derived
const vectors = useMemo(() => normalizeVectors(schematic), [schematic]);
const selectedVector = useMemo(() => vectors.find(v => v.id === vectorId) ?? null, [vectors, vectorId]);

// Effects
useEffect(() => {
  // fetch on schematicId, set status/error, and initialize legend/title/subtitle
}, [schematicId]);
useEffect(() => { setVectorId(prev => chooseVectorId(vectors, prev)); }, [vectors]);

// Intent methods
function selectSchematic(id: string | null) { setSchematicId(id); } // effect does the rest
function selectVector(id: string | null) { setVectorId(id); }
// Consumers can call setLegend/setTitle/setSubtitle directly
```

### Acceptance Criteria
- Public context no longer exposes `schematic` or `setSchematic`.
- Only `schematicId` and `vectorId` drive selection; `vectors` are derived; `legend`, `title`, `subtitle` have standard setters.
- Vector selection auto-corrects using the central algorithm.
- Consumers compile and run without prop/context juggling; preview renders without flicker.

### Test Plan
- Manual: change schematic, ensure vectors refresh and a valid vector is auto-selected; preview updates.
- Manual: change vector; preview changes without refetching schematic.
- Manual: edit legend/title/subtitle via setters; preview reflects changes immediately.
- Edge: unpublished vectors are excluded; if no vectors, vector select disabled with placeholder.

### Rollback
- Revert `artboards.tsx` and consumer edits; restore `schematic` to public API if necessary.


