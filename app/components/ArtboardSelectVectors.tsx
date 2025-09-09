import {Field, Label} from '../ui/fieldset';
import {Select} from '../ui/select';
import {useArtboards} from '~/context/artboards';

export type Vector = {
  id: string;
  title?: string;
  filename?: string;
  orientation?: string;
  primary?: boolean;
  optimized?: boolean;
  published?: boolean;
};

type ArtboardSelectVectorsProps = {
  options?: Vector[];
  selectedId?: string | null;
  onChange?: (id: string | null) => void;
  placeholder?: string;
  category?: string;
};

export function ArtboardSelectVectors({options, selectedId, onChange, placeholder, category}: ArtboardSelectVectorsProps) {
  const {vectors, schematicVectorId, setSchematicVectorId} = useArtboards();

  const safeOptions = (Array.isArray(options) ? options : []).filter((v) => v.published !== false);
  const effectiveOptions = (vectors?.length ?? 0) > 0 ? ((vectors as Vector[]).filter((v) => v.published !== false)) : safeOptions;
  const effectiveSelectedId = schematicVectorId ?? selectedId ?? null;
  const selected = effectiveOptions.find((v) => v.id === effectiveSelectedId) ?? null;

  return (
    <div className="max-w-xs">
      <Field>
        <Label className="capitalize">{category ?? 'Vector'}</Label>
        <Select
          name="schematicVector"
          value={effectiveSelectedId ?? ''}
          onChange={(event) => {
            const id = event.target.value || null;
            setSchematicVectorId(id);
            onChange?.(id);
          }}
          aria-label="Select vector"
        >
          <option value="" disabled={effectiveOptions.length > 0}>
            {placeholder ?? 'Select a vector'}
          </option>
          {effectiveOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.title || 'Untitled Vector'}
            </option>
          ))}
        </Select>
      </Field>
    </div>
  );
}


