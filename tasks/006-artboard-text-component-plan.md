## Artboard Text Component — Plan

### Goal
Add a new UI component `ArtboardText` that displays text fields for a schematic's title and subtitle. Users can edit both fields locally and submit to push updates into the Artboards context. Insert this component immediately below the vector selector on the Sailboat product page.

### Scope
- Create `app/components/ArtboardText.tsx` (no API writes; context-only updates).
- Show two labeled inputs: Title and Subtitle.
- Maintain local form state; only update context on form submit.
- Provide a primary submit button to commit changes.
- Disable or no-op submit if nothing changed.
- Place below `ArtboardSelectVectors` inside `app/routes/products.sailboat.tsx`.

### UI/UX
- Use existing UI primitives from `app/ui/`:
  - `Field`, `Label` from `ui/fieldset`.
  - `Input` from `ui/input`.
  - `Button` from `ui/button`.
- Layout: compact vertical form, max width similar to vector select (`max-w-sm`/`max-w-md`).
- Submit button label: "Update Text".
- Optional affordances:
  - Disable button when no changes are pending or status is not `ready`.
  - Show helper text when context is `loading`/`error` (non-blocking for v1).

### Data Flow
- Read `title`, `subtitle`, `status`, and setters `setTitle`, `setSubtitle` from `useArtboards()`.
- Initialize local state from context values.
- Keep local state synchronized with context when schematic selection changes:
  - On `title`/`subtitle` changes from context, update local fields unless the user has unsaved changes (simple strategy: update whenever `schematicId` changes; otherwise trust local edits until submitted or reset).
- On form submit:
  - Prevent default.
  - Call `setTitle(localTitle)` and `setSubtitle(localSubtitle)`.
  - Optionally provide a lightweight confirmation state.

### Component Structure (pseudocode)
```tsx
// app/components/ArtboardText.tsx
import {useArtboards} from '~/context/artboards';
import {Field, Label} from '~/ui/fieldset';
import {Input} from '~/ui/input';
import {Button} from '~/ui/button';

export function ArtboardText() {
  const {title, subtitle, setTitle, setSubtitle, status} = useArtboards();

  const [localTitle, setLocalTitle] = useState(title ?? '');
  const [localSubtitle, setLocalSubtitle] = useState(subtitle ?? '');

  // Sync local state when context changes (e.g., schematic switched)
  useEffect(() => {
    setLocalTitle(title ?? '');
  }, [title]);
  useEffect(() => {
    setLocalSubtitle(subtitle ?? '');
  }, [subtitle]);

  const isDirty = (localTitle ?? '') !== (title ?? '') || (localSubtitle ?? '') !== (subtitle ?? '');
  const isDisabled = status !== 'ready' || !isDirty;

  const onSubmit = (e) => {
    e.preventDefault();
    setTitle(localTitle || undefined);
    setSubtitle(localSubtitle || undefined);
  };

  return (
    <form onSubmit={onSubmit} className="max-w-md space-y-4">
      <Field>
        <Label>Title</Label>
        <Input
          name="artboardTitle"
          value={localTitle}
          onChange={(e) => setLocalTitle(e.target.value)}
          placeholder="Enter title"
        />
      </Field>
      <Field>
        <Label>Subtitle</Label>
        <Input
          name="artboardSubtitle"
          value={localSubtitle}
          onChange={(e) => setLocalSubtitle(e.target.value)}
          placeholder="Enter subtitle"
        />
      </Field>
      <div>
        <Button type="submit" disabled={isDisabled}>Update Text</Button>
      </div>
    </form>
  );
}
```

### Integration Point
- File: `app/routes/products.sailboat.tsx`.
- Import and place directly after `ArtboardSelectVectors`:
  - Before:
    ```tsx
    {/* Vector Select */}
    <ArtboardSelectVectors />
    ```
  - After:
    ```tsx
    {/* Vector Select */}
    <ArtboardSelectVectors />
    {/* Artboard Text */}
    <ArtboardText />
    ```

### Acceptance Criteria
- When a schematic is selected, the form fields prefill from context (`title`/`subtitle`).
- Editing fields does not change context until the user clicks "Update Text".
- Clicking "Update Text" updates `title` and `subtitle` in `Artboards` context.
- The submit button is disabled when there are no changes or when context status is not `ready`.
- Component renders below the vector selector on the Sailboat product page.

### Out of Scope
- Persisting changes to the Drawscape API (server writes) — context-only for now.
- Validation rules beyond basic input handling.
- Internationalization.

### Open Questions
1. Should we allow empty strings or coerce to `undefined` when clearing fields?
2. Any length or character constraints for title/subtitle?
3. Should there be a visible success message after submit?
4. Should we include a "Reset" button to revert to current context values?


