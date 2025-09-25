import {createContext, useContext, useEffect, useMemo, useRef, useState} from 'react';
import API from '~/lib/drawscapeApi';

export type VectorOption = {
  id: string;
  title?: string;
  url?: string;
  orientation?: string;
  primary?: boolean;
  optimized?: boolean;
  published?: boolean;
  style?: string;
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
  
  // Raw data
  schematic: Schematic | null;
  
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
  
  // Render functionality
  renderedImageDataUrl: string | null;
  isRendering: boolean;
  render: () => Promise<void>;
  
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
  
  // Render state
  const [renderedImageDataUrl, setRenderedImageDataUrl] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const renderAbortControllerRef = useRef<AbortController | null>(null);
  

  // Derived Data
  // Data that is massaged and populated when changes are made
  const vectors = useMemo<VectorOption[]>(() => {
    const raw = (schematic?.vectors ?? []) as any[];
    return Array.isArray(raw)
      ? raw
          .map((v: any) => ({
            id: v?.id,
            url: v?.url,
            title: v?.title,
            orientation: v?.orientation,
            primary: v?.primary,
            style: v?.style,
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
      // Cancel any pending render requests when changing schematics
      if (renderAbortControllerRef.current) {
        renderAbortControllerRef.current.abort();
        renderAbortControllerRef.current = null;
      }
      
      setSchematicId(id);
      // Reset vector selection immediately to prevent stale selections
      setVectorId(null);
    }
  };

  const selectVector = (id: string | null) => {
    setVectorId(id);
  };

  // Render function
  const render = async () => {
    if (!schematicId || !selectedVector || !colorScheme) {
      return;
    }
    
    // Cancel any existing render request
    if (renderAbortControllerRef.current) {
      renderAbortControllerRef.current.abort();
    }
    
    // Create new abort controller for this render request
    const abortController = new AbortController();
    renderAbortControllerRef.current = abortController;
    
    setIsRendering(true);

    try {
      const renderData = {
        title: title || schematic?.display_title || '',
        subtitle: subtitle || schematic?.display_subtitle || '',
        color_scheme: colorScheme.name,
        paper_color: colorScheme.paper_color,
        pen_color: colorScheme.pen_color,
        orientation: selectedVector.orientation || 'portrait',
        legend: legend,
        schematic_url: selectedVector.url || '',
        render_style: selectedVector.style || 'blueprint',
      };

      const response = await API.renderArtboard(renderData, {
        signal: abortController.signal
      });
            
      // Only update state if this request wasn't aborted
      if (!abortController.signal.aborted && response) {
        // Convert PNG blob to data URL
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result as string;
          setRenderedImageDataUrl(dataUrl);
        };
        reader.readAsDataURL(response);
      }
    } catch (err) {
      // Don't log errors for aborted requests
      if (!abortController.signal.aborted) {
        console.error('Failed to render artboard:', err);
      }
    } finally {
      // Only update rendering state if this request wasn't aborted
      if (!abortController.signal.aborted) {
        setIsRendering(false);
        renderAbortControllerRef.current = null;
      }
    }
  };

  // Auto-render effect - watches all relevant variables and triggers render
  // Previous render requests are automatically cancelled when new ones start
  useEffect(() => {
    // Only render if we have all required data
    if (schematicId && selectedVector && colorScheme) {
      render();
    }
  }, [schematicId, selectedVector, colorScheme, title, subtitle, legend]);


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
          // Compute initial vector selection synchronously with schematic load
          const rawVectors = (data?.vectors ?? []) as any[];
          const mapped = Array.isArray(rawVectors)
            ? rawVectors
                .map((v: any) => ({
                  id: v?.id,
                  primary: v?.primary,
                  published: v?.published !== false,
                }))
                .filter((v: { id: string | undefined; published: boolean }) => !!v.id && v.published)
            : [];

          let nextId: string | null = vectorId;
          const hasCurrent = nextId && mapped.some((v) => v.id === nextId);
          if (!hasCurrent) {
            const primary = mapped.find((v) => v.primary === true);
            nextId = (primary?.id as string | undefined) ?? (mapped[0]?.id as string | undefined) ?? null;
          }
          if (nextId !== vectorId) {
            setVectorId(nextId);
          }
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

  // Initial vector selection now occurs synchronously when the schematic is loaded


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

  // Cleanup effect - cancel any pending render requests on unmount
  useEffect(() => {
    return () => {
      if (renderAbortControllerRef.current) {
        renderAbortControllerRef.current.abort();
        renderAbortControllerRef.current = null;
      }
    };
  }, []);

  const value = useMemo<ArtboardsContextValue>(
    () => ({
      schematicId,
      selectSchematic,
      vectorId,
      selectVector,
      schematic,
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
      renderedImageDataUrl,
      isRendering,
      render,
      status,
      error,
    }),
    [schematicId, vectorId, schematic, vectors, selectedVector, colorSchemes, colorScheme, legend, title, subtitle, renderedImageDataUrl, isRendering, status, error],
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