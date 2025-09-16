import { useEffect, useState, useRef } from 'react';
import { useArtboards } from '~/context/artboards';
import API from '~/lib/drawscapeApi';

export function ArtboardRender() {
  const { schematicId, vectorId, selectedVector, legend, title, subtitle, colorScheme } = useArtboards();
  const [svgBlobUrl, setSvgBlobUrl] = useState<string | null>(null);
  const svgUrlRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchArtboardRender() {
      if (!schematicId || !vectorId || !selectedVector) {
        if (svgUrlRef.current) {
          URL.revokeObjectURL(svgUrlRef.current);
          svgUrlRef.current = null;
        }
        setSvgBlobUrl(null);
        return;
      }

      try {
        const schematicUrl = (selectedVector as any).url || (selectedVector as any).public_url || (selectedVector as any).download_url;
        if (!schematicUrl) {
          if (svgUrlRef.current) {
            URL.revokeObjectURL(svgUrlRef.current);
            svgUrlRef.current = null;
          }
          setSvgBlobUrl(null);
          return;
        }

        const payload = {
          render_style: 'blueprint',
          title: title || 'Preview Title',
          subtitle: subtitle || 'Preview Subtitle',
          schematic_url: schematicUrl,
          color_scheme: colorScheme?.name || 'blue_white',
          paper_color: colorScheme?.paper_color || 'navy',
          pen_color: colorScheme?.pen_color || 'white',
          orientation: selectedVector?.orientation || 'portrait',
          legend,
        };

        const result = await API.post<string>('artboard/render', payload, { responseType: 'text' });

        let svg: string | null = null;
        if (typeof result === 'string' && result.includes('<svg')) {
          svg = result;
        } else {
          try {
            const jsonResult = typeof result === 'string' ? JSON.parse(result) : result;
            const parsed = jsonResult as { svg?: string; svg_text?: string; svg_url?: string };
            if (parsed.svg && typeof parsed.svg === 'string') {
              svg = parsed.svg;
            } else if (parsed.svg_text && typeof parsed.svg_text === 'string') {
              svg = parsed.svg_text;
            } else if (parsed.svg_url && typeof parsed.svg_url === 'string') {
              const svgResponse = await fetch(parsed.svg_url);
              svg = await svgResponse.text();
            }
          } catch {
            throw new Error('Invalid response format from render API');
          }
        }

        if (!svg || !svg.includes('<svg')) {
          throw new Error('No valid SVG content in response');
        }

        if (svgUrlRef.current) {
          URL.revokeObjectURL(svgUrlRef.current);
          svgUrlRef.current = null;
        }
        const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
        svgUrlRef.current = url;
        if (!cancelled) setSvgBlobUrl(url);
      } catch {
        if (!cancelled) {
          if (svgUrlRef.current) {
            URL.revokeObjectURL(svgUrlRef.current);
            svgUrlRef.current = null;
          }
          setSvgBlobUrl(null);
        }
      }
    }

    fetchArtboardRender();

    return () => {
      cancelled = true;
    };
  }, [schematicId, vectorId, legend, title, subtitle, colorScheme]);

  // Cleanup Blob URL on unmount
  useEffect(() => {
    return () => {
      if (svgUrlRef.current) {
        URL.revokeObjectURL(svgUrlRef.current);
        svgUrlRef.current = null;
      }
    };
  }, []);

  if (!svgBlobUrl) return null;

  return (
    <img src={svgBlobUrl} className="w-full h-full object-contain mx-auto" alt="Artboard preview" />
  );
}