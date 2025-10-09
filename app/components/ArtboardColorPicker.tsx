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
    <div role="group" className="flex flex-wrap gap-4">
      {colorSchemes.map((scheme) => {
        const paperColor = colorMap[scheme.paper_color] || scheme.paper_color;
        const defaultPen = scheme.pens?.find((pen) => pen.key === 'default');
        const penColors = scheme.pens?.filter((pen) => pen.key !== 'default') || [];
        const isSelected = colorScheme?.key === scheme.key;

        // Determine if we should show bands (default + at least one pen color)
        const showBands = defaultPen && penColors.length > 0;
        const allPenColors = showBands ? [defaultPen, ...penColors] : [];

        return (
          <label
            key={scheme.key}
            className="relative inline-flex items-center cursor-pointer"
          >
            <input
              type="radio"
              name="color-scheme"
              value={scheme.key}
              checked={isSelected}
              onChange={() => setColorScheme(scheme)}
              aria-label={scheme.key.replace(/_/g, ' ')}
              className="sr-only peer"
            />
            <span
              className="size-8 aspect-square rounded-none border border-black/10 peer-checked:ring-2 peer-checked:ring-black/50 peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500 relative overflow-hidden"
              style={{ backgroundColor: paperColor }}
            >
              {showBands ? (
                <span className="absolute bottom-0 left-0 right-0 h-1/2 flex">
                  {allPenColors.map((pen, index) => (
                    <span
                      key={pen.key}
                      className="flex-1"
                      style={{ backgroundColor: colorMap[pen.color] || pen.color }}
                    />
                  ))}
                </span>
              ) : defaultPen ? (
                <span
                  className="absolute bottom-0 right-0 w-1/2 h-1/2"
                  style={{ backgroundColor: colorMap[defaultPen.color] || defaultPen.color }}
                />
              ) : null}
            </span>
          </label>
        );
      })}
    </div>
  );
}