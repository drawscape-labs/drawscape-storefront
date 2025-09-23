import {Select} from '../ui/select';
import {useArtboards} from '~/context/artboards';

export function ArtboardSelectVectors({placeholder}: {placeholder?: string}) {
  const {vectors, vectorId, selectVector} = useArtboards();

  return (
    <Select
      name="schematicVector"
      value={vectorId ?? ''}
      onChange={(event) => {
        const id = event.target.value || null;
        selectVector(id);
      }}
      aria-label="Select Layout"
      disabled={vectors.length === 0}
    >
      <option value="" disabled={vectors.length > 0}>
        {placeholder ?? 'Select a Layout'}
      </option>
      {vectors.map((option) => (
        <option key={option.id} value={option.id}>
          {option.title || 'Untitled Layout'} 
          {option.orientation && (` - ${option.orientation.charAt(0).toUpperCase() + option.orientation.slice(1)}`)}
        </option>
      ))}
    </Select>
  );
}


