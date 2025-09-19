import { ArtboardSelectSchematic, type Schematic } from './ArtboardSelectSchematic';
import { ArtboardSelectVectors } from './ArtboardSelectVectors';
import { ArtboardColorPicker } from './ArtboardColorPicker';
import { Field, Label } from '../ui/fieldset';
import { useArtboards } from '../context/artboards';

type ArtboardDesignProps = {
  schematics: Schematic[];
  category?: string;
  schematicPlaceholder?: string;
  vectorPlaceholder?: string;
};

export function ArtboardDesign({
  schematics,
  category = 'sailboats',
  schematicPlaceholder,
  vectorPlaceholder,
}: ArtboardDesignProps) {
  const { vectors } = useArtboards();
  
  return (
    <div className="space-y-4">
      {/* Schematic Selection */}
      <Field>
        <Label className="capitalize">{category}</Label>
        <ArtboardSelectSchematic 
          options={schematics} 
          placeholder={schematicPlaceholder}
        />
      </Field>
      
      {/* Vector Selection - only show if more than 1 vector available */}
      {vectors.length > 1 && (
        <Field>
          <Label className="capitalize">Layout</Label>
          <ArtboardSelectVectors placeholder={vectorPlaceholder} />
        </Field>
      )}
      
      {/* Color Picker */}
      <Field>
        <Label className="capitalize">Color</Label>
        <div className="mt-3">
          <ArtboardColorPicker />
        </div>
      </Field>
    </div>
  );
}
