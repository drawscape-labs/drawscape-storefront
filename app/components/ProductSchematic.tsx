import React from 'react';
import { ProductPrice } from '~/components/ProductPrice';
import { ArtboardProductForm } from '~/components/ArtboardProductForm';
import { ArtboardsProvider } from '~/context/artboards';
import { ArtboardDesign } from '~/components/ArtboardDesign';
import { ArtboardText } from '~/components/ArtboardText';
import { ArtboardLegendManager } from '~/components/ArtboardLegendManager';
import ArtboardGallery from '~/components/ArtboardGallery';
import Tabs from '~/components/Tabs';
import { ProductReviews } from '~/components/ProductReviews';
import { ProductSchematicDescription } from './ProductSchematicDescription';

export interface Schematic {
  id: string;
  name: string;
}

export interface ProductSchematicProps {
  product: any;
  initialSchematicId: string | null;
  schematics: Schematic[];
  productOptions: any[];
  selectedVariant: any;
}

/**
 * ProductSchematic
 * 
 * Props:
 * - product: The product object to display schematics for.
 * - initialSchematicId: The id of the schematic to show by default.
 * - schematics: Array of available schematics for this product.
 * - productOptions: Array of product options for the form.
 * - selectedVariant: The currently selected product variant.
 */
export function ProductSchematic({
  product,
  initialSchematicId,
  schematics,
  productOptions,
  selectedVariant,
}: ProductSchematicProps) {
  const { title, media } = product;

  return (
    <ArtboardsProvider key={initialSchematicId ?? 'none'} initialSchematicId={initialSchematicId}>
      <div className="bg-white">
        <div className="mx-auto max-w-2xl px-4 py-0 sm:px-6 md:py-12 lg:max-w-7xl lg:px-8 lg:py-12">
          <div className="lg:grid lg:grid-cols-6 lg:items-start lg:gap-x-8">
            
            {/* Artboard preview */}
            <div className="lg:col-span-4">
              <ArtboardGallery 
                productMedia={media} 
                variantImage={product?.selectedOrFirstAvailableVariant?.image}
                limit={5}
              />
            </div>

            {/* Product info */}
            <div className="mt-10 px-4 sm:mt-16 sm:px-0 lg:mt-0 lg:col-span-2">

              {/* Product Information Tabs */}

              <Tabs defaultValue="design" ariaLabel="Product Customization">
                <Tabs.List>
                  <Tabs.Trigger value="design">Design</Tabs.Trigger>
                  <Tabs.Trigger value="text">Text</Tabs.Trigger>
                  <Tabs.Trigger value="legend">Legend</Tabs.Trigger>
                </Tabs.List>

                <Tabs.Content value="design" className="mt-6">
                  <ArtboardDesign 
                    schematics={schematics}
                    category="sailboats"
                  />
                </Tabs.Content>
                
                <Tabs.Content value="text" className="mt-6">
                  <ArtboardText />
                </Tabs.Content>
                
                <Tabs.Content value="legend" className="mt-6">
                  <ArtboardLegendManager />
                </Tabs.Content>
              </Tabs>

              {/* Divider */}
              <div className="my-8 border-t border-gray-200" aria-hidden="true" />
              <div className="flex flex-col gap-3">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">{title}</h1>

                <div className="text-3xl tracking-tight text-gray-900">
                  <ProductPrice
                    price={selectedVariant?.price}
                    compareAtPrice={selectedVariant?.compareAtPrice}
                  />
                </div>

                <div>
                  <h3 className="sr-only">Reviews</h3>
                  <ProductReviews />
                </div>

                <div>
                  <h3 className="sr-only">Description</h3>
                  <ProductSchematicDescription />
                </div>

                <ArtboardProductForm
                  productOptions={productOptions}
                  selectedVariant={selectedVariant}
                />
              </div>

            </div>
          </div>

        </div>
      </div>

    </ArtboardsProvider>
  );
}

