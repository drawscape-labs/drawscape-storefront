import { ComboboxSchematic, ComboboxSchematicOption, ComboboxSchematicLabel } from '~/ui/combobox-schematic';
import { useArtboards } from '~/context/artboards';

export type Schematic = {
  id: string;
  name: string;
  category?: string;
};

type ArtboardSelectSchematicProps = {
  options: Schematic[];
  placeholder?: string;
};

export function ArtboardSelectSchematic({
  options,
  placeholder,
}: ArtboardSelectSchematicProps) {
  const { schematicId, selectSchematic } = useArtboards();

  // Find the currently selected schematic
  const selectedSchematic = options.find((option) => option.id === schematicId) || null;

  const handleChange = (schematic: Schematic | null) => {
    selectSchematic(schematic?.id || null);
  };

  return (
    <ComboboxSchematic
      value={selectedSchematic}
      onChange={handleChange}
      options={options}
      displayValue={(schematic) => schematic?.name}
      placeholder={placeholder ?? 'Select a Design'}
      aria-label="Select schematic design"
    >
      {(schematic) => (
        <ComboboxSchematicOption key={schematic.id} value={schematic}>
          <ComboboxSchematicLabel>{schematic.name}</ComboboxSchematicLabel>
        </ComboboxSchematicOption>
      )}
    </ComboboxSchematic>
  );
}
