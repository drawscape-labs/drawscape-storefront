# Legend Manager Component Plan

## Overview
Create a LegendManager component that matches the functionality of the provided Chakra UI component, but using the existing project's UI patterns and styling. The component will manage legend items for artboards with add, edit, delete, and reorder functionality.

## Key Requirements
- Use existing artboard context (`useArtboards`) for state management
- Follow existing form styling patterns using `Field`, `Label`, `Input`, and `Button` components
- Only update context when user explicitly clicks Update, Delete, or Add buttons
- Use `@heroicons/react` for icons instead of FontAwesome
- Implement accordion-style collapsible legend items
- Support reorder mode with up/down arrow button interface
- Include confirmation for delete operations

## Component Architecture

### 1. Main LegendManager Component
- **File**: `app/components/ArtboardLegendManager.tsx`
- **Props**: None (uses context)
- **State Management**: 
  - Local state for UI interactions (expanded items, dirty state, etc.)
  - Context state for actual legend data via `useArtboards()`

### 2. State Management Strategy
- **Context Integration**: Use `legend` and `setLegend` from `useArtboards()`
- **Local State**: Track UI-only state (expanded items, dirty flags, delete confirmations)
- **Update Pattern**: Only call `setLegend()` on explicit user actions (Update/Delete/Add)

### 3. UI Components Structure

#### Accordion View (Default)
- Collapsible legend items using custom accordion implementation
- Each item shows: `label • content` in collapsed state
- Expanded state shows: Label input, Content input, Update button, Delete button
- Visual indicators for dirty state (unsaved changes)

#### Reorder View (Toggle Mode)
- Simple list with up/down arrow buttons for each item
- Up/down buttons to move items in the list
- Done button to exit reorder mode

#### Action Buttons
- **Add Item**: Creates new legend item and expands it
- **Reorder**: Toggles between accordion and reorder views
- **Update**: Saves changes to context (only enabled when dirty)
- **Delete**: Two-step confirmation process

### 4. Icon Usage
Replace FontAwesome icons with Heroicons:
- `faPlus` → `PlusIcon`
- `faTrash` → `TrashIcon`
- `faExclamationTriangle` → `ExclamationTriangleIcon` (for confirm delete state)
- `faArrowsUpDown` → `ArrowsUpDownIcon`
- `faArrowUp` → `ChevronUpIcon`
- `faArrowDown` → `ChevronDownIcon`

### 5. Styling Approach
- Use existing `Field`, `Label`, `Input` components for form elements
- Use existing `Button` component with appropriate variants
- Follow existing spacing and layout patterns
- Use Tailwind classes for custom styling (accordion, reorder view)

### 6. Key Features

#### Accordion Functionality
- Single item expansion (only one item open at a time)
- Smooth expand/collapse animations
- Click outside to collapse
- Keyboard navigation support

#### Form Validation
- Required fields validation
- Real-time dirty state tracking
- Disable Update button when no changes
- Input validation for empty labels

#### Delete Confirmation
- Two-step delete process with visual confirmation interface
- **Initial State**: Gray "Delete" button with trash icon
- **Confirmation State**: Red "Confirm Delete" button with warning triangle icon
- Button positioned next to Update button in expanded item
- Auto-timeout for confirmation (3 seconds) to reset to initial state
- Prevent accidental deletions with explicit confirmation step
- Visual emphasis on destructive action with red color and warning icon

#### Reorder Functionality
- Toggle between normal and reorder modes
- Up/Down arrow buttons for each item to move them in the list
- Disable up arrow for first item, down arrow for last item
- Save changes when exiting reorder mode

### 7. Component Props and State

#### Context Integration
```typescript
const { legend, setLegend, isRendering } = useArtboards();
```

#### Local State
```typescript
const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
const [dirtyItems, setDirtyItems] = useState<Record<number, boolean>>({});
const [deleteConfirmations, setDeleteConfirmations] = useState<Record<number, boolean>>({});
const [isReorderMode, setIsReorderMode] = useState<boolean>(false);
const [localEdits, setLocalEdits] = useState<Record<number, Partial<LegendItem>>>({});
```

### 8. Event Handlers

#### Item Management
- `handleItemChange(index, field, value)` - Track local edits
- `updateItem(index)` - Save changes to context
- `addLegendItem()` - Add new item and expand
- `removeLegendItem(index)` - Delete item with confirmation
- `moveItem(index, direction)` - Reorder items

#### UI Interactions
- `handleAccordionChange(index)` - Expand/collapse items
- `handleKeyPress(e, index)` - Enter key to save
- `handleDeleteConfirmation(index, e)` - Two-step delete with visual button transformation
- `toggleReorderMode()` - Switch between views

### 9. Accessibility Features
- Proper ARIA labels for all interactive elements
- Keyboard navigation support
- Screen reader announcements for state changes
- Focus management during mode switches

### 10. Error Handling
- Graceful handling of context update failures
- User feedback for failed operations
- Rollback local state on context update errors

## Implementation Steps

1. **Create base component structure** with context integration
2. **Implement accordion functionality** with custom collapsible behavior
3. **Add form handling** with dirty state tracking
4. **Implement reorder mode** with up/down navigation
5. **Add delete confirmation** with two-step process
6. **Style components** using existing UI patterns
7. **Add accessibility features** and keyboard navigation
8. **Test integration** with artboard context and rendering

## File Structure
```
app/components/
├── ArtboardLegendManager.tsx (main component)
└── (existing components)
```

## Dependencies
- `@heroicons/react` (already installed)
- Existing UI components (`Field`, `Label`, `Input`, `Button`)
- Artboard context (`useArtboards`)
- React hooks (`useState`, `useCallback`, `useEffect`)

## Testing Considerations
- Test context integration and state updates
- Test accordion expand/collapse behavior
- Test form validation and dirty state
- Test reorder functionality
- Test delete confirmation flow
- Test keyboard navigation
- Test with empty legend state
- Test with large numbers of legend items
