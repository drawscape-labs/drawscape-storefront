import { useState, useCallback, useEffect } from 'react';
import { useArtboards, type LegendItem } from '~/context/artboards';
import { Field, Label } from '~/ui/fieldset';
import { Input } from '~/ui/input';
import { Button } from '~/ui/button';
import {
  PlusIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  ArrowsUpDownIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';

export function ArtboardLegendManager() {
  const { legend, setLegend, isRendering } = useArtboards();

  // Local state management
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [dirtyItems, setDirtyItems] = useState<Record<number, boolean>>({});
  const [deleteConfirmations, setDeleteConfirmations] = useState<Record<number, boolean>>({});
  const [isReorderMode, setIsReorderMode] = useState<boolean>(false);
  const [localEdits, setLocalEdits] = useState<Record<number, Partial<LegendItem>>>({});

  // Auto-reset delete confirmations after 3 seconds
  useEffect(() => {
    const activeConfirmations = Object.entries(deleteConfirmations)
      .filter(([_, isActive]) => isActive)
      .map(([index]) => parseInt(index));

    if (activeConfirmations.length === 0) return;

    const timeouts = activeConfirmations.map(index => {
      return setTimeout(() => {
        setDeleteConfirmations(prev => ({ ...prev, [index]: false }));
      }, 3000);
    });

    return () => timeouts.forEach(timeout => clearTimeout(timeout));
  }, [deleteConfirmations]);

  // Reset local state when legend changes from context
  useEffect(() => {
    setLocalEdits({});
    setDirtyItems({});
    setDeleteConfirmations({});
  }, [legend]);

  // Get the current value for an item (local edit or from context)
  const getItemValue = useCallback(
    (index: number, field: keyof LegendItem): string => {
      return localEdits[index]?.[field] ?? legend[index]?.[field] ?? '';
    },
    [legend, localEdits]
  );

  // Handle item field changes
  const handleItemChange = useCallback(
    (index: number, field: keyof LegendItem, value: string) => {
      setLocalEdits(prev => ({
        ...prev,
        [index]: { ...prev[index], [field]: value }
      }));
      
      // Check if the value is different from the original
      const isDirty = value !== (legend[index]?.[field] ?? '');
      setDirtyItems(prev => ({ ...prev, [index]: isDirty }));
    },
    [legend]
  );

  // Update item in context
  const updateItem = useCallback(
    (index: number) => {
      if (!dirtyItems[index] || !localEdits[index]) return;

      const updatedLegend = [...legend];
      updatedLegend[index] = {
        label: getItemValue(index, 'label'),
        content: getItemValue(index, 'content'),
      };

      setLegend(updatedLegend);
      
      // Clear local state for this item
      setLocalEdits(prev => {
        const { [index]: _, ...rest } = prev;
        return rest;
      });
      setDirtyItems(prev => ({ ...prev, [index]: false }));
    },
    [legend, setLegend, dirtyItems, localEdits, getItemValue]
  );

  // Add new legend item
  const addLegendItem = useCallback(() => {
    const newItem: LegendItem = {
      label: '',
      content: '',
    };
    const newLegend = [...legend, newItem];
    setLegend(newLegend);
    
    // Expand the new item
    const newIndex = newLegend.length - 1;
    setExpandedIndex(newIndex);
  }, [legend, setLegend]);

  // Remove legend item
  const removeLegendItem = useCallback(
    (index: number) => {
      const updatedLegend = legend.filter((_, i) => i !== index);
      setLegend(updatedLegend);
      
      // Clear local state
      setLocalEdits(prev => {
        const { [index]: _, ...rest } = prev;
        return rest;
      });
      setDirtyItems(prev => {
        const { [index]: _, ...rest } = prev;
        return rest;
      });
      setDeleteConfirmations(prev => {
        const { [index]: _, ...rest } = prev;
        return rest;
      });
      
      // Adjust expanded index if necessary
      if (expandedIndex === index) {
        setExpandedIndex(null);
      } else if (expandedIndex !== null && expandedIndex > index) {
        setExpandedIndex(expandedIndex - 1);
      }
    },
    [legend, setLegend, expandedIndex]
  );

  // Move item up or down
  const moveItem = useCallback(
    (index: number, direction: 'up' | 'down') => {
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= legend.length) return;

      const updatedLegend = [...legend];
      [updatedLegend[index], updatedLegend[newIndex]] = 
        [updatedLegend[newIndex], updatedLegend[index]];
      
      setLegend(updatedLegend);
    },
    [legend, setLegend]
  );

  // Handle accordion toggle
  const handleAccordionChange = useCallback(
    (index: number) => {
      setExpandedIndex(prev => prev === index ? null : index);
    },
    []
  );

  // Handle delete confirmation
  const handleDeleteConfirmation = useCallback(
    (index: number, e: React.MouseEvent) => {
      e.stopPropagation();
      
      if (deleteConfirmations[index]) {
        // Confirm delete
        removeLegendItem(index);
      } else {
        // Show confirmation
        setDeleteConfirmations(prev => ({ ...prev, [index]: true }));
      }
    },
    [deleteConfirmations, removeLegendItem]
  );

  // Toggle reorder mode
  const toggleReorderMode = useCallback(() => {
    setIsReorderMode(prev => !prev);
    setExpandedIndex(null);
  }, []);

  // Handle Enter key press to save
  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      if (e.key === 'Enter' && dirtyItems[index]) {
        e.preventDefault();
        updateItem(index);
      }
    },
    [dirtyItems, updateItem]
  );

  if (isReorderMode) {
    return (
      <div className="space-y-4">
        
        <div className="space-y-2">
          {legend.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-2 px-4 py-1 pr-1 bg-white border border-zinc-200 rounded-lg"
            >
              <div className="flex-1">
                <span className="text-sm font-medium">{item.label}</span>
                <span className="mx-2 text-zinc-400">•</span>
                <span className="text-sm text-zinc-600">{item.content}</span>
              </div>
              <div className="flex gap-1">
                <Button
                  onClick={() => moveItem(index, 'up')}
                  disabled={index === 0}
                  outline
                  className="p-1"
                  aria-label="Move up"
                >
                  <ChevronUpIcon className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => moveItem(index, 'down')}
                  disabled={index === legend.length - 1}
                  outline
                  className="p-1"
                  aria-label="Move down"
                >
                  <ChevronDownIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        <Button onClick={toggleReorderMode} outline className="flex items-center gap-1">
          <CheckIcon className="w-4 h-4" />
          Done Reordering
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {/* Accordion Items */}
      <div className="space-y-2">
        {legend.length === 0 ? (
          <p className="text-sm text-zinc-500 italic">No legend items yet. Click "Add Item" to create one.</p>
        ) : (
          legend.map((item, index) => {
            const isExpanded = expandedIndex === index;
            const isDirty = dirtyItems[index] || false;
            const isConfirmingDelete = deleteConfirmations[index] || false;

            return (
              <div
                key={index}
                className={clsx(
                  'border rounded-lg transition-all',
                  isExpanded ? 'border-zinc-300 shadow-sm' : 'border-zinc-200',
                  isDirty && 'border-blue-300'
                )}
              >
                {/* Collapsed View */}
                <button
                  onClick={() => handleAccordionChange(index)}
                  className="w-full px-4 py-2 text-left flex items-center justify-between hover:bg-zinc-50 rounded-lg transition-colors"
                  aria-expanded={isExpanded}
                >
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium">{item.label || '(empty)'}</span>
                    <span className="mx-2 text-zinc-400">•</span>
                    <span className="text-sm text-zinc-600">{item.content || '(empty)'}</span>
                    {isDirty && (
                      <span className="ml-2 text-xs text-blue-600 font-medium">(unsaved)</span>
                    )}
                  </div>
                  <ChevronDownIcon
                    className={clsx(
                      'w-4 h-4 text-zinc-400 transition-transform',
                      isExpanded && 'rotate-180'
                    )}
                  />
                </button>

                {/* Expanded View */}
                {isExpanded && (
                  <div className="p-4 pt-0 space-y-3">
                    <Field>
                      <Label htmlFor={`legend-label-${index}`}>Label</Label>
                      <Input
                        id={`legend-label-${index}`}
                        type="text"
                        value={getItemValue(index, 'label')}
                        onChange={(e) => handleItemChange(index, 'label', e.target.value)}
                        onKeyPress={(e) => handleKeyPress(e, index)}
                        placeholder="Enter label"
                        disabled={isRendering}
                      />
                    </Field>

                    <Field>
                      <Label htmlFor={`legend-content-${index}`}>Content</Label>
                      <Input
                        id={`legend-content-${index}`}
                        type="text"
                        value={getItemValue(index, 'content')}
                        onChange={(e) => handleItemChange(index, 'content', e.target.value)}
                        onKeyPress={(e) => handleKeyPress(e, index)}
                        placeholder="Enter content"
                        disabled={isRendering}
                      />
                    </Field>

                    <div className="flex gap-2 justify-end">

                      <Button
                        onClick={(e: React.MouseEvent) => handleDeleteConfirmation(index, e)}
                        disabled={isRendering}
                        outline
                        className="flex items-center gap-1"
                      >
                        {isConfirmingDelete ? (
                          <>
                            <ExclamationTriangleIcon className="w-4 h-4" />
                            Confirm Delete
                          </>
                        ) : (
                          <>
                            <TrashIcon className="w-4 h-4" />
                            Delete
                          </>
                        )}
                      </Button>
                      
                      <Button
                        onClick={() => updateItem(index)}
                        color="indigo"
                        disabled={!isDirty || isRendering}
                      >
                        Update
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          onClick={addLegendItem}
          outline
          disabled={isRendering}
          className="flex items-center gap-1"
        >
          <PlusIcon className="w-4 h-4" />
          Add Item
        </Button>
        {legend.length > 0 && (
          <Button
            onClick={toggleReorderMode}
            outline
            disabled={isRendering}
            className="flex items-center gap-1"
          >
            <ArrowsUpDownIcon className="w-4 h-4" />
            Reorder
          </Button>
        )}
      </div>
    </div>
  );
}

// Helper to combine class names
function clsx(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}