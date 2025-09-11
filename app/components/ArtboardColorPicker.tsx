import { useArtboards } from '~/context/artboards';

export function ArtboardColorPicker() {
  const { colorSchemes, colorScheme, setColorScheme } = useArtboards();

  if (!colorSchemes || colorSchemes.length === 0) {
    return null;
  }

  const colorMap: Record<string, string> = {
    navy: '#1e3a8a',
    white: '#ffffff',
    blue: '#3b82f6',
    red: '#ef4444',
    black: '#000000',
    tan: '#d2b48c',
  };

  return (
    <div role="group" className="flex flex-wrap gap-2">
      {colorSchemes.map((scheme) => {
        const paperColor = colorMap[scheme.paper_color] || scheme.paper_color;
        const penColor = colorMap[scheme.pen_color] || scheme.pen_color;
        const isSelected = colorScheme?.name === scheme.name;
        
        return (
          <label
            key={scheme.name}
            className="relative inline-flex items-center cursor-pointer"
          >
            <input
              type="radio"
              name="color-scheme"
              value={scheme.name}
              checked={isSelected}
              onChange={() => setColorScheme(scheme)}
              aria-label={scheme.name.replace(/_/g, ' ')}
              className="sr-only peer"
            />
            <span 
              className="size-8 aspect-square rounded-none border border-black/10 peer-checked:ring-2 peer-checked:ring-black/50 peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500 relative overflow-hidden"
              style={{ backgroundColor: paperColor }}
            >
              <span
                className="absolute bottom-0 right-0 w-1/2 h-1/2"
                style={{ backgroundColor: penColor }}
              />
            </span>
          </label>
        );
      })}
    </div>
  );
}