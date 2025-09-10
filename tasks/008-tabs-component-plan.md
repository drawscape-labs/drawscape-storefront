## Tabs Component Plan

### Goal
Build a reusable, accessible Tabs component that matches the Tailwind “full-width tabs with underline” style shown in the screenshot and snippet. It should allow nesting arbitrary React children per tab and switch the visible content when a tab is selected.

### Scope
- Compound component API: `Tabs`, `Tabs.List`, `Tabs.Trigger`, `Tabs.Content`.
- Uncontrolled and controlled usage.
- Keyboard and screen reader accessibility (WAI-ARIA tabs pattern).
- Styling aligned with the provided Tailwind example, including dark mode classes.
- No external dependencies; pure React + Tailwind.

### Files to add
- `app/components/Tabs.tsx` – main component (compound API, context, a11y, styles).

### Public API (proposed)
- `<Tabs defaultValue?: string; value?: string; onValueChange?: (v: string) => void; ariaLabel?: string; fullWidth?: boolean; className?: string;>`
  - `value`/`onValueChange` enables controlled mode; otherwise `defaultValue` is used.
  - `fullWidth` makes all tabs equal width (default true). If false, tabs size to content.
- `<Tabs.List className?: string>` – container for triggers. Applies the Tailwind underline style.
- `<Tabs.Trigger value: string; disabled?: boolean; className?: string>` – a single tab button.
- `<Tabs.Content value: string; className?: string; unmount?: boolean>` – content panel for a tab. `unmount=false` keeps inactive panels mounted but hidden for state retention; default true.

### Usage example (minimal)
```tsx
<Tabs defaultValue="team" ariaLabel="Account sections">
  <Tabs.List>
    <Tabs.Trigger value="account">My Account</Tabs.Trigger>
    <Tabs.Trigger value="company">Company</Tabs.Trigger>
    <Tabs.Trigger value="team">Team Members</Tabs.Trigger>
    <Tabs.Trigger value="billing">Billing</Tabs.Trigger>
  </Tabs.List>

  <Tabs.Content value="account"><AccountSettings /></Tabs.Content>
  <Tabs.Content value="company"><CompanySettings /></Tabs.Content>
  <Tabs.Content value="team"><TeamMembers /></Tabs.Content>
  <Tabs.Content value="billing"><Billing /></Tabs.Content>
 </Tabs>
```

### Styling details (Tailwind)
- Tabs container bottom border and horizontal layout (from the snippet):
  - `Tabs.List`: `border-b border-gray-200 dark:border-white/10 -mb-px flex`.
  - Each `Tabs.Trigger` base: `px-1 py-4 text-center text-sm font-medium border-b-2`.
  - Selected state: `border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400`.
  - Unselected state: `border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-white/20 dark:hover:text-gray-300`.
  - Full-width tabs: apply `flex-1` to each trigger; otherwise no width class.

### Accessibility & keyboard behavior
- Roles/props:
  - `Tabs.List` → `role="tablist"` with optional `aria-label`.
  - `Tabs.Trigger` → `role="tab"`, `aria-selected`, `id`, `aria-controls`, `tabIndex`.
  - `Tabs.Content` → `role="tabpanel"`, `id`, `aria-labelledby`.
- Keyboard support per WAI-ARIA:
  - ArrowLeft/ArrowRight to move focus among tabs.
  - Home/End to jump to first/last tab.
  - Enter/Space activates the focused tab.
  - Focus stays on the tablist; `aria-selected` reflects active tab.

### State management
- Internal context holds:
  - `activeValue: string`
  - `setActiveValue: (v: string) => void`
  - `registerTrigger(value, ref)` for focus movement order
  - `orientation: 'horizontal'` (future-proofing)
- Controlled mode: if `value` is provided, internal state mirrors it; all changes call `onValueChange`.
- Uncontrolled mode: `useState(defaultValue ?? first Trigger)`.

### Rendering strategy
- Only render the matching `Tabs.Content` for the active tab when `unmount=true`.
- When `unmount=false`, keep all panels in the tree and toggle visibility via `hidden` and `aria-hidden`.

### Edge cases
- If an invalid `value` is passed, fall back to the first available tab.
- When all triggers are disabled, keep first non-disabled if any; otherwise do nothing on arrows.
- Ensure dark mode classes are present as in the snippet.

### Milestones
1) Implement compound structure, context, and uncontrolled behavior.
2) Add controlled mode and `onValueChange`.
3) Add keyboard navigation and a11y attributes.
4) Apply Tailwind styling (light/dark) to match the example; support `fullWidth`.
5) Optional: implement `urlSync`.
6) Write Storybook-like demo route (optional, not required now).

### Risks / decisions
- Keep scope to underline variant; future variants (pills, boxed) can extend via a `variant` prop.
- Prefer buttons for triggers (not anchors) to avoid unexpected navigation.


