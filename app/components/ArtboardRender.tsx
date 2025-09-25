import React from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { useArtboards } from '~/context/artboards';

interface ArtboardRenderProps {
  showLoading?: boolean;
}

export function ArtboardRender({ showLoading = false }: ArtboardRenderProps) {
  const { renderedImageDataUrl, isRendering } = useArtboards();


  const shouldDim = showLoading && isRendering;

  // Show loading icon when no image is available
  if (!renderedImageDataUrl) {
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
        src={renderedImageDataUrl} 
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