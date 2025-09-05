import {createContext, useContext, useMemo, useState} from 'react';

type ArtboardsContextValue = {
  schematic_id: string | null;
  setSchematicId: (id: string | null) => void;
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

  const value = useMemo<ArtboardsContextValue>(
    () => ({schematic_id: schematicId, setSchematicId}),
    [schematicId],
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


