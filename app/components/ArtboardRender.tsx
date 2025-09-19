import { useEffect, useState, useRef } from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { useArtboards } from '~/context/artboards';

interface ArtboardRenderProps {
  showLoading?: boolean;
}

export function ArtboardRender({ showLoading = false }: ArtboardRenderProps) {
  const { renderedSvg, isRendering } = useArtboards();
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

  const shouldDim = showLoading && isRendering;

  // Show loading icon when no SVG is available
  if (!svgBlobUrl) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <ArrowPathIcon className="h-8 w-8 text-gray-500 animate-spin" />
          <span className="text-gray-500 text-sm">Loading Preview Image</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <img 
        src={svgBlobUrl} 
        className={`w-full h-full object-contain mx-auto transition-opacity duration-200 ${
          shouldDim ? 'opacity-50' : 'opacity-100'
        }`} 
        alt="Artboard preview" 
      />
      {shouldDim && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50">
          <div className="flex flex-col items-center space-y-2">
            <ArrowPathIcon className="h-6 w-6 text-gray-600 animate-spin" />
            <span className="text-gray-600 text-xs">Rendering...</span>
          </div>
        </div>
      )}
    </div>
  );
}