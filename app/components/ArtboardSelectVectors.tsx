import {Field, Label} from '../ui/fieldset';
import {Select} from '../ui/select';
import {useArtboards} from '~/context/artboards';

export function ArtboardSelectVectors({placeholder, category}: {placeholder?: string; category?: string}) {
  const {vectors, vectorId, selectVector} = useArtboards();

  return (
    <div className="max-w-xs">
      <Field>
        <Label className="capitalize">{category ?? 'Vector'}</Label>
        <Select
          name="schematicVector"
          value={vectorId ?? ''}
          onChange={(event) => {
            const id = event.target.value || null;
            selectVector(id);
          }}
          aria-label="Select vector"
          disabled={vectors.length === 0}
        >
          <option value="" disabled={vectors.length > 0}>
            {placeholder ?? 'Select a vector'}
          </option>
          {vectors.map((option) => (
            <option key={option.id} value={option.id}>
              {option.title || 'Untitled Vector'}
            </option>
          ))}
        </Select>
      </Field>
    </div>
  );
}


