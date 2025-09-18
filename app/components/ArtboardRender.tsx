import { useEffect, useState, useRef } from 'react';
import { useArtboards } from '~/context/artboards';

export function ArtboardRender() {
  const { renderedSvg } = useArtboards();
  const [svgBlobUrl, setSvgBlobUrl] = useState<string | null>(null);
  const svgUrlRef = useRef<string | null>(null);

  useEffect(() => {
    // Clean up previous blob URL
    if (svgUrlRef.current) {
      URL.revokeObjectURL(svgUrlRef.current);
      svgUrlRef.current = null;
    }

    if (!renderedSvg || !renderedSvg.includes('<svg')) {
      setSvgBlobUrl(null);
      return;
    }

    // Create new blob URL from the SVG string
    const url = URL.createObjectURL(new Blob([renderedSvg], { type: 'image/svg+xml' }));
    svgUrlRef.current = url;
    setSvgBlobUrl(url);
  }, [renderedSvg]);

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