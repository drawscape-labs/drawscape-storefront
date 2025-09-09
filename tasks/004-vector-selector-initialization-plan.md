### Robust Vector Selector Initialization Plan

#### Goal
Make vector selection deterministic and resilient when a schematic loads or changes: always select the primary vector (`primary === true`) if present; otherwise select the first available vector. Ensure selection resets appropriately when the schematic changes or is re-fetched.

#### Current Behavior (observed)
- Selection is derived in `app/context/artboards.tsx` via an effect on `vectors`.
- The effect preserves a previous `schematicVectorId` even after the schematic changes, which can leave an invalid selection for the new schematic.
- Bug: the fallback branch checks `vectors.length === 0` before accessing `vectors[0]`, so it never selects the first vector when there is no primary.

#### Requirements
- On initial page load with a schematic: select primary vector if present; otherwise the first published vector.
- When `schematicId` changes: clear any prior selection, then initialize selection for the new schematic once vectors are available.
- When a schematic is re-fetched (same `schematicId`) and its vectors change: if the current selection is no longer valid, re-initialize to primary-or-first.
- Never override a valid, user-selected vector that still exists in the current vector list.
- Only consider vectors that are published (`published !== false`).

#### Proposed Changes
- Centralize selection logic in a small pure function to ensure identical behavior across initialization and updates.
- Reset selection on schematic changes, and reconcile selection when vectors change.
- Fix the length check bug to correctly fall back to the first vector when no primary is present.

#### Selection Algorithm (pure function)
Input: `vectors: VectorOption[]`, `currentId: string | null`

1. If `currentId` is non-null and exists in `vectors`, return `currentId` (keep user choice).
2. Let `primary` be the first vector where `primary === true`. If found, return `primary.id`.
3. Else, if `vectors.length > 0`, return `vectors[0].id`.
4. Else return `null`.

#### Integration Points
- `app/context/artboards.tsx` is the single source of truth. Update effects as follows:
  - On `schematicId` change: set `schematicVectorId` to `null` before or when starting the fetch for the new schematic.
  - On `vectors` change: compute the next selection using the selection algorithm above; set `schematicVectorId` only if it differs from the current one.

#### Pseudocode (context-only; not production code)
```ts
// In artboards context

function chooseVectorId(vectors, currentId) {
  const published = (vectors ?? []).filter(v => v?.id && v.published !== false);
  if (currentId && published.some(v => v.id === currentId)) return currentId;
  const primary = published.find(v => v.primary === true);
  if (primary?.id) return primary.id;
  return published[0]?.id ?? null;
}

// When schematicId changes
useEffect(() => {
  setSchematicVectorId(null);
  // fetch schematic by id → setSchematic(data)
}, [schematicId]);

// When vectors or current selection changes
useEffect(() => {
  const nextId = chooseVectorId(vectors, schematicVectorId);
  if (nextId !== schematicVectorId) setSchematicVectorId(nextId);
}, [vectors, schematicVectorId]);
```

#### Edge Cases
- No vectors: `schematicVectorId` remains `null`.
- All vectors unpublished: treat as no vectors.
- Schematic refetch removes the current vector: selection re-initializes to primary-or-first.
- Schematic refetch marks a different vector as `primary`: if the current selection is still valid, do not override; if it’s invalid, switch to the new primary.

#### Acceptance Criteria
- Loading any schematic with a primary vector selects that vector by default.
- Loading any schematic without a primary selects the first published vector.
- Changing the schematic updates the selected vector according to the rules, without keeping a stale id.
- If the current selection becomes invalid after a refetch, it is replaced by the primary-or-first choice.
- No unnecessary state churn: selection updates only when it must change.

#### Validation / Test Plan
- Manual scenarios:
  - Schematic A (with primary) → selection is primary; switch to Schematic B (no primary) → selection is first; switch back to A → selection is A’s primary.
  - While on A, refetch with same id where vectors change and current selection is removed → selection re-initializes to primary-or-first.
  - While on A with a user-chosen non-primary vector still present → refetch marks another vector primary → selection stays on user-chosen vector.
- Optional unit tests (if test infra exists): selection function with inputs covering edge cases above.

#### Implementation Notes
- Keep all logic inside `app/context/artboards.tsx`; consumers (e.g., `ArtboardSelectVectors`) should continue to read `schematicVectorId` and write via `setSchematicVectorId`.
- Fix the current effect bug (`vectors.length === 0`) to `vectors.length > 0` as part of this change.
- Ensure effects avoid infinite loops by comparing ids before updating state.

#### Out of Scope
- UI changes to selector components.
- Persisting selection across sessions.

#### Risks
- Accidental override of a valid user selection. Mitigated by checking if `currentId` still exists before auto-selecting.

