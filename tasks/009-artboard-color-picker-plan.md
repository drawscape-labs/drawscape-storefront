## Artboard Color Picker Plan

### Goal
- Add a new `ArtboardColorPicker` component that lets users select one color scheme at a time (radio input behavior).
- Expose `colorScheme` selection state in `ArtboardsProvider` context and the list of available `colorSchemes` from the Drawscape API.
- Re-render the preview when the scheme changes and pass the selection to the render endpoint.

### Scope
- New UI component: `app/components/ArtboardColorPicker.tsx`.
- Context updates: `app/context/artboards.tsx` to manage `colorSchemes` and `colorScheme`.
- Preview integration: update `app/components/ArtboardPreview.tsx` to use `colorScheme` when building the render payload and re-fetch on change.
- Page integration: render `ArtboardColorPicker` within the "Design" tab on `app/routes/products.sailboat.tsx`.

### Data Model
- Color scheme type:
  - `type ColorScheme = { name: string; paper_color: string; pen_color: string }`
- Context state additions:
  - `colorSchemes: ColorScheme[]` (defaults to fetched API list or empty)
  - `colorScheme: ColorScheme | null` (defaults to first returned scheme or a sensible fallback e.g., `blue_white` if present)
  - `setColorScheme: (scheme: ColorScheme | null) => void`

### API
- Source: Drawscape API (proxied via our client).
- Endpoint: `GET artboard/color-schemes`
- Client import requirement:
  - `import API from '~/lib/drawscapeApi'`
- Expected response shape:
  - `{ color_schemes: Array<{ name: string; paper_color: string; pen_color: string }> }`

### Context Changes (`app/context/artboards.tsx`)
1. Types
   - Define `ColorScheme` locally or export if reused by multiple components.
   - Extend `ArtboardsContextValue` with `colorSchemes`, `colorScheme`, `setColorScheme`.
2. State
   - Add `const [colorSchemes, setColorSchemes] = useState<ColorScheme[]>([])`.
   - Add `const [colorScheme, setColorScheme] = useState<ColorScheme | null>(null)`.
3. Effects
   - On mount or when `schematicId` changes (decision: fetch once on mount for now; can refine later), fetch `artboard/color-schemes` via `API.get` and set `colorSchemes`.
   - After fetch, initialize `colorScheme` to the first scheme or a preferred default (e.g., the scheme named `blue_white` if found).
4. Provider value
   - Include `colorSchemes`, `colorScheme`, and `setColorScheme` in the context value and memo deps.

### Component: `ArtboardColorPicker`
- Responsibilities
  - Read `colorSchemes`, `colorScheme`, and `setColorScheme` from context.
  - Render a radio group where each option represents a scheme.
  - Each radio option should visually encode both `paper_color` and `pen_color`.
- Visual design
  - Use existing `app/ui/radio.tsx` primitives (`RadioGroup`, `RadioField`, `Radio`) for consistent styling and accessibility.
  - For each option, set CSS variables or inline styles to represent the colors:
    - Map `paper_color` to the radio control background (e.g., `--radio-checked-bg`).
    - Map `pen_color` to the inner indicator (e.g., `--radio-checked-indicator`).
  - If needed, add a small label (scheme name) adjacent to the swatch for clarity.
- Behavior
  - Only one radio can be selected at a time.
  - Calls `setColorScheme(selected)` on change.
- Accessibility
  - `aria-label` or visible label reflecting the scheme name.

Minimal pseudocode (not production code):
```tsx
function ArtboardColorPicker() {
  const { colorSchemes, colorScheme, setColorScheme } = useArtboards();
  return (
    <RadioGroup value={colorScheme?.name} onChange={(name) => setColorScheme(colorSchemes.find(s => s.name === name) ?? null)}>
      <div className="flex items-center gap-x-3">
        {colorSchemes.map((scheme) => (
          <RadioField key={scheme.name}>
            <Radio
              value={scheme.name}
              style={{
                // Paper as control background; pen as indicator
                ['--radio-checked-bg' as any]: scheme.paper_color,
                ['--radio-checked-indicator' as any]: scheme.pen_color,
              }}
              aria-label={scheme.name}
            />
          </RadioField>
        ))}
      </div>
    </RadioGroup>
  );
}
```

### Preview Integration (`app/components/ArtboardPreview.tsx`)
- Replace hardcoded values with context-driven ones:
  - `color_scheme: colorScheme?.name`
  - `paper_color: colorScheme?.paper_color`
  - `pen_color: colorScheme?.pen_color`
- Add `colorScheme` to the effect dependency array so a selection change triggers a re-fetch.

### Page Integration (`app/routes/products.sailboat.tsx`)
- In the "Design" tab section, render `<ArtboardColorPicker />` below vector selection.
- Include a small header: "Color" to match existing UI patterns.

### Edge Cases & Defaults
- If the color schemes request fails: keep `colorSchemes` empty and hide the picker; use a safe default in preview if needed.
- If names include colors not present in Tailwind palette, rely on inline style values (CSS color keywords like `navy`, `tan`, etc., are valid).
- If schematic/vector changes, retain the current `colorScheme` unless the list fundamentally changes (out of scope for now).

### Non-Goals (for this iteration)
- Persisting the color scheme in the URL or cart line item properties.
- Server-side rendering of the picker state.
- Custom theming beyond basic color swatches.

### Acceptance Criteria
- Users can see available color schemes as radio options and select one.
- Preview re-renders upon selection and the render request includes the chosen scheme.
- No Remix imports; routing-related hooks remain from `react-router` only.
- All Drawscape API calls use `~/lib/drawscapeApi`.


