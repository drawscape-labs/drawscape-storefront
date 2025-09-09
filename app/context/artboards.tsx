import {createContext, useContext, useEffect, useMemo, useState} from 'react';
import API from '~/lib/drawscapeApi';

export type VectorOption = {
  id: string;
  title?: string;
  url?: string;
  filename?: string;
  orientation?: string;
  primary?: boolean;
  optimized?: boolean;
  published?: boolean;
};

export type LegendItem = {
  label: string;
  content: string;
};

type ArtboardsContextValue = {
  schematicId: string | null;
  setSchematicId: (id: string | null) => void;
  schematic: any | null;
  setSchematic: (schematic: any | null) => void;
  schematicVectorId: string | null;
  setSchematicVectorId: (id: string | null) => void;
  vectors: VectorOption[];
  legend: LegendItem[];
  setLegend: (items: LegendItem[]) => void;
};

const ArtboardsContext = createContext<ArtboardsContextValue | undefined>(
  undefined,
);

export function ArtboardsProvider({
  children,
  initialSchematicId,
}: {
  children: React.ReactNode;
  initialSchematicId?: string | null;
}) {
  const [schematicId, setSchematicId] = useState<string | null>(
    initialSchematicId ?? null,
  );
  const [schematic, setSchematic] = useState<any | null>(null);
  const [schematicVectorId, setSchematicVectorId] = useState<string | null>(null);
  const [legend, setLegend] = useState<LegendItem[]>([]);
  
  const vectors = useMemo<VectorOption[]>(() => {
    const raw = (schematic?.vectors ?? schematic?.schematic_vectors ?? []) as any[];
    return Array.isArray(raw)
      ? raw
          .map((v: any) => ({
            id: v?.id,
            url: v?.url || v?.public_url || v?.download_url,
            title: v?.title,
            filename: v?.filename,
            orientation: v?.orientation,
            primary: v?.primary,
            published: v?.published,
          }))
          .filter((v: VectorOption) => !!v.id && v.published !== false)
      : [];
  }, [schematic]);

  // Centralized vector selection algorithm
  function chooseVectorId(vectors: VectorOption[], currentId: string | null): string | null {
    const published = (vectors ?? []).filter(v => v?.id && v.published !== false);
    if (currentId && published.some(v => v.id === currentId)) return currentId;
    const primary = published.find(v => v.primary === true);
    if (primary?.id) return primary.id;
    return published[0]?.id ?? null;
  }

  useEffect(() => {
    const nextId = chooseVectorId(vectors, schematicVectorId);
    if (nextId !== schematicVectorId) {
      setSchematicVectorId(nextId);
    }
  }, [vectors, schematicVectorId]);

  useEffect(() => {
    // Reset vector selection when schematic changes
    setSchematicVectorId(null);
    // Clear current schematic immediately to avoid stale vectors re-selection
    setSchematic(null);
    
    let isCancelled = false;
    async function fetchSchematicDetails() {
      if (!schematicId) {
        setSchematic(null);
        setSchematicVectorId(null);
        return;
      }
      try {
        const data = await API.get(`/schematics/${schematicId}`);
        if (!isCancelled) {
          setSchematic(data);
        }
      } catch (_error) {
        if (!isCancelled) {
          setSchematic(null);
          setSchematicVectorId(null);
        }
      }
    }
    fetchSchematicDetails();
    return () => {
      isCancelled = true;
    };
  }, [schematicId]);

  useEffect(() => {
    if (!schematicId) {
      setLegend([]);
      return;
    }
    setLegend(schematic?.legend ?? []);
  }, [schematicId, schematic?.legend]);

  const value = useMemo<ArtboardsContextValue>(
    () => ({schematicId, setSchematicId, schematic, setSchematic, schematicVectorId, setSchematicVectorId, vectors, legend, setLegend}),
    [schematicId, schematic, schematicVectorId, vectors, legend],
  );



  return (
    <ArtboardsContext.Provider value={value}>{children}</ArtboardsContext.Provider>
  );
}

export function useArtboards() {
  
  const ctx = useContext(ArtboardsContext);
  if (!ctx) {
    throw new Error('useArtboards must be used within an ArtboardsProvider');
  }
  return ctx;
}


