import {createContext, useContext, useEffect, useMemo, useState} from 'react';
import API from '~/lib/drawscapeApi';

export type VectorOption = {
  id: string;
  title?: string;
  url?: string;
  orientation?: string;
  primary?: boolean;
  optimized?: boolean;
  published?: boolean;
};

export type LegendItem = {
  label: string;
  content: string;
};

export type ColorScheme = {
  name: string;
  paper_color: string;
  pen_color: string;
};

// Internal type for schematic data coming from the API
type Schematic = {
  id: string;
  title?: string;
  subtitle?: string;
  legend?: LegendItem[];
  vectors?: any[];
  [key: string]: any;
};

type ArtboardsContextValue = {
  // Selection
  schematicId: string | null;
  selectSchematic: (id: string | null) => void;
  
  vectorId: string | null;
  selectVector: (id: string | null) => void;
  
  // Color schemes
  colorSchemes: ColorScheme[];
  colorScheme: ColorScheme | null;
  setColorScheme: (scheme: ColorScheme) => void;
  
  // Derived data
  vectors: VectorOption[];
  selectedVector: VectorOption | null;
  
  // Controlled presentation state
  title?: string;
  setTitle: (title?: string) => void;
  subtitle?: string;
  setSubtitle: (subtitle?: string) => void;
  legend: LegendItem[];
  setLegend: (items: LegendItem[]) => void;
  
  // Loading state
  status: 'idle' | 'loading' | 'ready' | 'error';
  error: string | null;
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
  // Selection state
  const [schematicId, setSchematicId] = useState<string | null>(
    initialSchematicId ?? null,
  );
  const [vectorId, setVectorId] = useState<string | null>(null);
  
  // Internal data
  const [schematic, setSchematic] = useState<Schematic | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  
  // Controlled presentation state
  const [legend, setLegend] = useState<LegendItem[]>([]);
  const [title, setTitle] = useState<string | undefined>(undefined);
  const [subtitle, setSubtitle] = useState<string | undefined>(undefined);
  
  // Color scheme state
  const [colorSchemes, setColorSchemes] = useState<ColorScheme[]>([]);
  const [colorScheme, setColorScheme] = useState<ColorScheme | null>(null);
  

  // Derived Data
  // Data that is massaged and populated when changes are made
  const vectors = useMemo<VectorOption[]>(() => {
    const raw = (schematic?.vectors ?? []) as any[];
    return Array.isArray(raw)
      ? raw
          .map((v: any) => ({
            id: v?.id,
            url: v?.url || v?.public_url || v?.download_url,
            title: v?.title,
            orientation: v?.orientation,
            primary: v?.primary,
            published: v?.published,
          }))
          .filter((v: VectorOption) => !!v.id && v.published !== false)
      : [];
  }, [schematic]);

  const selectedVector = useMemo(() => {
    return vectors.find(v => v.id === vectorId) ?? null;
  }, [vectors, vectorId]);


  // Triggers when new schematic is selected from the select list
  const selectSchematic = (id: string | null) => {
    if (id !== schematicId) {
      setSchematicId(id);
      // Reset vector selection immediately to prevent stale selections
      setVectorId(null);
    }
  };

  const selectVector = (id: string | null) => {
    setVectorId(id);
  };

  // Effect 1: Handle schematic changes and fetching
  useEffect(() => {
    let isCancelled = false;

    async function handleSchematicChange() {
      if (!schematicId) {
        // Clear everything when no schematic selected
        setSchematic(null);
        setVectorId(null);
        setLegend([]);
        setTitle(undefined);
        setSubtitle(undefined);
        setStatus('idle');
        setError(null);
        return;
      }

      // Start loading
      setStatus('loading');
      setError(null);
      
      try {
        const data = await API.get<Schematic>(`/schematics/${schematicId}`);
        if (!isCancelled) {
          setSchematic(data);
          // Initialize presentation state from fetched data
          setLegend(data?.legend ?? []);
          setTitle(data?.display_title);
          setSubtitle(data?.display_subtitle);
          setStatus('ready');
        }
      } catch (err) {
        if (!isCancelled) {
          setSchematic(null);
          setStatus('error');
          setError(err instanceof Error ? err.message : 'Failed to load schematic');
        }
      }
    }

    handleSchematicChange();
    
    return () => {
      isCancelled = true;
    };
  }, [schematicId]);

  // Logic to select an initial vector
  useEffect(() => {
    const published = (vectors ?? []).filter(v => v?.id && v.published !== false);

    let nextId: string | null = null;
    if (vectorId && published.some(v => v.id === vectorId)) {
      nextId = vectorId;
    } else {
      const primary = published.find(v => v.primary === true);
      nextId = primary?.id ?? (published[0]?.id ?? null);
    }

    if (nextId !== vectorId) {
      setVectorId(nextId);
    }
  }, [vectors, vectorId]);

  // Effect to fetch color schemes
  useEffect(() => {
    let isCancelled = false;

    async function fetchColorSchemes() {
      try {
        const response = await API.get<{color_schemes: ColorScheme[]}>('/artboard/color-schemes');
        if (!isCancelled && response?.color_schemes) {
          setColorSchemes(response.color_schemes);
          
          // Initialize colorScheme to first result or preferred default
          if (!colorScheme || !response.color_schemes.some(cs => cs.name === colorScheme.name)) {
            const blueWhite = response.color_schemes.find(cs => cs.name === 'blue_white');
            setColorScheme(blueWhite || response.color_schemes[0] || null);
          }
        }
      } catch (err) {
        console.error('Failed to fetch color schemes:', err);
        if (!isCancelled) {
          setColorSchemes([]);
        }
      }
    }

    fetchColorSchemes();

    return () => {
      isCancelled = true;
    };
  }, []); // Fetch once on mount


  const value = useMemo<ArtboardsContextValue>(
    () => ({
      schematicId,
      selectSchematic,
      vectorId,
      selectVector,
      vectors,
      selectedVector,
      colorSchemes,
      colorScheme,
      setColorScheme,
      legend,
      setLegend,
      title,
      setTitle,
      subtitle,
      setSubtitle,
      status,
      error,
    }),
    [schematicId, vectorId, vectors, selectedVector, colorSchemes, colorScheme, legend, title, subtitle, status, error],
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