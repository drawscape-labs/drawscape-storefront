/**
 * ProductSchematicDescription
 * 
 * Displays a product schematic's description, using the Artboard context.
 * 
 * - If schematic.display_title is present, it is shown as the description.
 * - Otherwise, a generic product description is displayed.
 * 
 * Props: none (uses Artboard context)
 */

import { useArtboards } from '~/context/artboards';

export function ProductSchematicDescription() {
  const { schematic } = useArtboards();

  // Prefer schematic.display_title, otherwise show a generic description
  const description = schematic?.display_title
    ? `Custom art of a ${schematic.display_title} drawn with a plotting machine.`
    : 'Custom art drawn with a plotting machine.';

  return (
    <section className="product-schematic-description">
      <p className="text-gray-700">{description}</p>
    </section>
  );
}
