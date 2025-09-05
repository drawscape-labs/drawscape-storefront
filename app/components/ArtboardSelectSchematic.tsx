import { Combobox, ComboboxOption, ComboboxLabel } from './combobox';
import { useEffect, useState } from 'react';
import { useRouteLoaderData } from 'react-router';
import API, { setDrawscapeBaseUrl } from '~/lib/drawscapeApi';
import type { RootLoader } from '~/root';

type Schematic = {
  id: string;
  name: string;
};

type ArtboardSelectSchematicProps = {
  value?: Schematic | null;
  onChange?: (schematic: Schematic | null) => void;
};

export function ArtboardSelectSchematic({
  value,
  onChange,
}: ArtboardSelectSchematicProps) {
  const rootData = useRouteLoaderData<RootLoader>('root');
  const baseUrl = rootData?.drawscapeApiUrl || '';
  setDrawscapeBaseUrl(baseUrl);

  const [schematics, setSchematics] = useState<Schematic[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {

    let cancelled = false;
    setLoading(true);

    API.get<any[]>('schematics', { published: 'true', sort: 'title' })
      .then((res) => {
        if (cancelled) return;
        const mapped: Schematic[] = (Array.isArray(res) ? res : [])
          .filter(Boolean)
          .map((item: any) => {
            const name =  item?.title || 'Untitled';
            return { id: item?.id, name } as Schematic;
          });
        setSchematics(mapped);
      })
      .catch(() => {
        if (cancelled) return;
        setSchematics([]);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="max-w-xs">
      <Combobox<Schematic>
        options={schematics}
        onChange={onChange}
        displayValue={(option) => option?.name}
        placeholder={loading ? 'Loading schematics…' : 'Select a schematic'}
        aria-label="Select schematic"
      >
        {(option) => (
          <ComboboxOption key={option.id} value={option}>
            <ComboboxLabel>{option.name}</ComboboxLabel>
          </ComboboxOption>
        )}
      </Combobox>
    </div>
  );
}
