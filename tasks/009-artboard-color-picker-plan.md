## Artboard Color Picker — Concise Plan

### Goal
- New `ArtboardColorPicker` selects one color scheme (radio) and updates preview payload.

### API (Drawscape)
- Endpoint: `GET artboard/color-schemes`
- Import: `import API from '~/lib/drawscapeApi'`
- Response example:
```json
{
  "color_schemes": [
    { "name": "blue_white",  "paper_color": "navy",  "pen_color": "white" },
    { "name": "white_blue",  "paper_color": "white", "pen_color": "blue" },
    { "name": "white_red",   "paper_color": "white", "pen_color": "red" },
    { "name": "black_white", "paper_color": "black", "pen_color": "white" },
    { "name": "brown_black", "paper_color": "tan",   "pen_color": "black" }
  ]
}
```

### Context (`app/context/artboards.tsx`)
- Type: `type ColorScheme = { name: string; paper_color: string; pen_color: string }`.
- State: `colorSchemes: ColorScheme[]`, `colorScheme: ColorScheme | null`, `setColorScheme()`.
- Fetch schemes once on mount (or with schematic change if desired). Init `colorScheme` to first result or preferred default (`blue_white` if present).
- Expose `colorSchemes`, `colorScheme`, `setColorScheme` via context value/memo.

### Component (`app/components/ArtboardColorPicker.tsx`)
- Use `RadioGroup`, `RadioField`, `Radio` from `app/ui/radio.tsx`.
- Data: `colorSchemes`, `colorScheme` from context; call `setColorScheme` on change.
- Styling: map `paper_color` → `--radio-checked-bg`, `pen_color` → `--radio-checked-indicator`; label via visible text or `aria-label`.

### Preview (`app/components/ArtboardPreview.tsx`)
- Use context values in payload:
  - `color_scheme: colorScheme?.name`
  - `paper_color: colorScheme?.paper_color`
  - `pen_color: colorScheme?.pen_color`
- Add `colorScheme` to effect deps to re-fetch on change.

### Page (`app/routes/products.sailboat.tsx`)
- In Design tab, render `<ArtboardColorPicker />` below `<ArtboardSelectVectors />` with a "Color" header.

### Defaults / Edge Cases
- If fetch fails: hide picker (empty list); preview may use safe defaults.
- Keep selection across schematic/vector changes unless list fundamentally changes (out of scope).

### Acceptance
- Radio picker shows available schemes and selects one.
- Preview updates and request includes chosen scheme.
- React Router imports only; API calls via `~/lib/drawscapeApi`.


