import { Select } from '~/ui/select';
import { useArtboards } from '~/context/artboards';

export type Schematic = {
  id: string;
  name: string;
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

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = event.target.value;
    selectSchematic(selectedId || null);
  };

  return (
    <Select
      value={schematicId || ''}
      onChange={handleChange}
    >
      <option value="" disabled>
        {placeholder ?? 'Select a Design'}
      </option>
      {options.map((option) => (
        <option key={option.id} value={option.id}>
          {option.name}
        </option>
      ))}
    </Select>
  );
}
