import { useEffect, useState, useRef } from 'react';
import { useArtboards } from '~/context/artboards';
import API from '~/lib/drawscapeApi';

export function ArtboardPreview() {
  const { schematicId, vectorId, selectedVector, legend, title, subtitle, status, colorScheme } = useArtboards();
  const [svgMarkup, setSvgMarkup] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  function normalizeSvgForResponsiveDisplay(rawSvg: string): string {
    try {
      if (typeof window === 'undefined') return rawSvg;
      const parser = new DOMParser();
      const doc = parser.parseFromString(rawSvg, 'image/svg+xml');
      const svgEl = doc.documentElement as unknown as SVGSVGElement;
      if (!svgEl || svgEl.tagName.toLowerCase() !== 'svg') return rawSvg;

      const existingViewBox = svgEl.getAttribute('viewBox');
      const rawWidth = svgEl.getAttribute('width') || '';
      const rawHeight = svgEl.getAttribute('height') || '';

      if (!existingViewBox) {
        const widthNumber = parseFloat((rawWidth || '').toString().replace(/[^0-9.]/g, ''));
        const heightNumber = parseFloat((rawHeight || '').toString().replace(/[^0-9.]/g, ''));
        if (!Number.isNaN(widthNumber) && !Number.isNaN(heightNumber) && widthNumber > 0 && heightNumber > 0) {
          svgEl.setAttribute('viewBox', `0 0 ${widthNumber} ${heightNumber}`);
        }
      }

      if (!svgEl.getAttribute('preserveAspectRatio')) {
        svgEl.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      }

      svgEl.removeAttribute('width');
      svgEl.removeAttribute('height');

      // Do not enforce inline styles; Tailwind utilities on the container
      // will size the nested <svg> element responsively.

      const serializer = new XMLSerializer();
      return serializer.serializeToString(svgEl);
    } catch (_e) {
      return rawSvg;
    }
  }

  useEffect(() => {
    // Increment request ID to ignore stale responses
    const currentRequestId = ++requestIdRef.current;

    async function fetchArtboardRender() {
      if (!schematicId || !vectorId || !selectedVector) {
        setSvgMarkup(null);
        return;
      }

      try {

        // Get the schematic URL - now typed on vector object
        const schematicUrl = (selectedVector as any).url || (selectedVector as any).public_url || (selectedVector as any).download_url;
        if (!schematicUrl) {
          setSvgMarkup(null);
          return;
        }

        // Build the payload
        const payload = {
          render_style: 'blueprint',
          title: title || 'Preview Title',
          subtitle: subtitle || 'Preview Subtitle',
          schematic_url: schematicUrl,
          
          // Use color scheme from context
          color_scheme: colorScheme?.name || 'blue_white',
          paper_color: colorScheme?.paper_color || 'navy',
          pen_color: colorScheme?.pen_color || 'white',
          size: 'letter',
          orientation: 'portrait',
          legend,
        };

        // Call the API with text response type to handle raw SVG
        const result = await API.post<string>('artboard/render', payload, { responseType: 'text' });

        // Check if this is still the current request
        if (currentRequestId !== requestIdRef.current) {
          return; // Ignore stale response
        }

        // Normalize the response
        let svg: string | null = null;

        // Check if response is raw SVG string
        if (typeof result === 'string' && result.includes('<svg')) {
          svg = result;
        } else {
          // Try to parse as JSON in case API returns JSON despite text responseType
          try {
            const jsonResult = typeof result === 'string' ? JSON.parse(result) : result;
            const parsed = jsonResult as { svg?: string; svg_text?: string; svg_url?: string };
            
            // Look for common SVG fields in JSON response
            if (parsed.svg && typeof parsed.svg === 'string') {
              svg = parsed.svg;
            } else if (parsed.svg_text && typeof parsed.svg_text === 'string') {
              svg = parsed.svg_text;
            } else if (parsed.svg_url && typeof parsed.svg_url === 'string') {
              // If we get a URL, fetch the SVG content
              const svgResponse = await fetch(parsed.svg_url);
              svg = await svgResponse.text();
            }
          } catch {
            // Not JSON, and not valid SVG
            throw new Error('Invalid response format from render API');
          }
        }

        if (!svg || !svg.includes('<svg')) {
          throw new Error('No valid SVG content in response');
        }

        setSvgMarkup(normalizeSvgForResponsiveDisplay(svg));
      } catch (err) {
        if (currentRequestId === requestIdRef.current) {
          setSvgMarkup(null);
        }
      }
    }

    fetchArtboardRender();
  }, [schematicId, vectorId, legend, title, subtitle, colorScheme]);

  return (
    <div className="w-full">
      {svgMarkup ? (
        <div 
          className="w-full overflow-hidden [&>svg]:block [&>svg]:max-w-full [&>svg]:w-full [&>svg]:h-auto" 
          dangerouslySetInnerHTML={{ __html: svgMarkup }} 
        />
      ) : status === 'loading' ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading schematic…</div>
        </div>
      ) : status === 'error' ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-red-600">Error loading schematic</div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-400">Select a schematic and vector to preview</div>
        </div>
      )}
    </div>
  );
}