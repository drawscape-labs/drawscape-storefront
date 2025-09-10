import { Combobox, ComboboxOption, ComboboxLabel } from './combobox';
import { useArtboards } from '~/context/artboards';
import { Field, Label } from '../ui/fieldset';

export type Schematic = {
  id: string;
  name: string;
};

type ArtboardSelectSchematicProps = {
  options: Schematic[];
  category?: string;
  placeholder?: string;
};

export function ArtboardSelectSchematic({
  options,
  category,
  placeholder,
}: ArtboardSelectSchematicProps) {
  const { schematicId, selectSchematic } = useArtboards();

  const selected = options.find((s) => s.id === schematicId) ?? null;

  return (
    <div className="max-w-xs">
      <Field>
        <Label className="capitalize">{category ?? 'Schematic'}</Label>
        <Combobox<Schematic>
          by={(a, b) => (a as Schematic | null)?.id === (b as Schematic | null)?.id}
          options={options}
          value={selected ?? undefined}
          onChange={(option) => selectSchematic(option?.id ?? null)}
          displayValue={(option) => option?.name}
          placeholder={placeholder ?? 'Select a schematic'}
          aria-label="Select schematic"
        >
          {(option) => (
            <ComboboxOption key={option.id} value={option}>
              <ComboboxLabel>{option.name}</ComboboxLabel>
            </ComboboxOption>
          )}
        </Combobox>
      </Field>
    </div>
  );
}
