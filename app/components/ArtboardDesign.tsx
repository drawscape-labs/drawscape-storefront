import { ArtboardSelectSchematic, type Schematic } from './ArtboardSelectSchematic';
import { ArtboardSelectVectors } from './ArtboardSelectVectors';
import { ArtboardColorPicker } from './ArtboardColorPicker';
import { Field, Label } from '../ui/fieldset';
import { Button } from '../ui/button';
import { useArtboards } from '../context/artboards';
import { useAside } from './Aside';

type ArtboardDesignProps = {
  schematics: Schematic[];
  category?: string;
  schematicPlaceholder?: string;
  vectorPlaceholder?: string;
};

// Helper function to create readable category label
function getCategoryLabel(category: string): string {
  switch (category) {
    case 'sailboats':
      return 'Sailboats';
    case 'airport_diagrams':
      return 'Airport Diagrams';
    case 'aircraft':
      return 'Aircraft';
    default:
      return 'Design'
  }
}

export function ArtboardDesign({
  schematics,
}: ArtboardDesignProps) {
  const { vectors } = useArtboards();
  const { open } = useAside();

  // Get category from first schematic and create readable label
  const firstSchematic = schematics[0];
  const categoryLabel = firstSchematic?.category
    ? getCategoryLabel(firstSchematic.category)
    : 'Design';

  return (
    <div className="space-y-4">
      {/* Schematic Selection */}
      <Field>
        <Label className="capitalize">{categoryLabel}</Label>
        <div className="flex items-center gap-2 mt-1 sm:mt-2">
          <ArtboardSelectSchematic  options={schematics} />
          <Button outline href="/request-a-design">Request</Button>
        </div>
      </Field>
      
      {/* Vector Selection - only show if more than 1 vector available */}
      {vectors.length > 1 && (
        <Field>
          <Label className="capitalize">Layout</Label>
          <div className="mt-1 sm:mt-2">
            <ArtboardSelectVectors />
          </div>
        </Field>
      )}
      
      {/* Color Picker */}
      <Field>
        <Label className="capitalize">Color</Label>
        <div className="mt-1 sm:mt-2">
          <ArtboardColorPicker />
        </div>
      </Field>
    </div>
  );
}
