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

export function ArtboardDesign({
  schematics,
  category = 'sailboats',
  schematicPlaceholder,
  vectorPlaceholder,
}: ArtboardDesignProps) {
  const { vectors } = useArtboards();
  const { open } = useAside();
  
  return (
    <div className="space-y-4">
      {/* Schematic Selection */}
      <Field>
        <Label className="capitalize">{category}</Label>
        <div className="flex items-center gap-2" data-slot="control">
          <ArtboardSelectSchematic 
            options={schematics} 
            placeholder={schematicPlaceholder}
          />
          <Button outline onClick={() => open('request-design')}>Request</Button>
        </div>
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
        <div data-slot="control">
          <ArtboardColorPicker />
        </div>
      </Field>
    </div>
  );
}
