import React from 'react';
import { ProductPrice } from '~/components/ProductPrice';
import { ProductSchematicForm } from '~/components/ProductSchematicForm';
import { ArtboardsProvider } from '~/context/artboards';
import { ArtboardDesign } from '~/components/ArtboardDesign';
import { ArtboardText } from '~/components/ArtboardText';
import { ArtboardLegendManager } from '~/components/ArtboardLegendManager';
import ArtboardGallery from '~/components/ArtboardGallery';
import Tabs from '~/components/Tabs';
import { ProductReviews } from '~/components/ProductReviews';
import { ProductSchematicDescription } from './ProductSchematicDescription';
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from '@headlessui/react';
import { MinusIcon, PlusIcon } from '@heroicons/react/24/outline';

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

// Product details for disclosure sections
const productDetails = [
  {
    name: 'About the Drawing',
    items: [
      'Size: 11x17 Inches (Tabloid)',
      'Pens: Stabilo Fineliners or Sakura Gelly Rolls',
      'Paper: 120lb / 250gsm Stock Paper',
      'Drawn with a NextDraw Plotting Machine'
    ],
  },
  {
    name: 'Shipping / Returns',
    items: [
      '🇺🇸 US and 🌎 International Shipping',
      'Shipping is less than $10 in the US and $20 - $40 internationally',
      '100% Money Back Guarantee (Free Returns)',
      'Shipped in under 7 Days'
    ],
  }
];

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

              {/* Product Information */}
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

                <ProductSchematicForm
                  productOptions={productOptions}
                  selectedVariant={selectedVariant}
                />
              </div>

              {/* Additional Product Information */}
              <section aria-labelledby="details-heading" className="mt-8">
                <h2 id="details-heading" className="sr-only">
                  Additional details
                </h2>

                <div className="divide-y divide-gray-200 border-t border-gray-200">
                  {productDetails.map((detail) => (
                    <Disclosure key={detail.name} as="div">
                      <h3>
                        <DisclosureButton className="group relative flex w-full items-center justify-between py-6 text-left">
                          <span className="text-sm font-medium text-gray-900 group-data-open:text-indigo-600">
                            {detail.name}
                          </span>
                          <span className="ml-6 flex items-center">
                            <PlusIcon
                              aria-hidden="true"
                              className="block size-6 text-gray-400 group-hover:text-gray-500 group-data-open:hidden"
                            />
                            <MinusIcon
                              aria-hidden="true"
                              className="hidden size-6 text-indigo-400 group-hover:text-indigo-500 group-data-open:block"
                            />
                          </span>
                        </DisclosureButton>
                      </h3>
                      <DisclosurePanel className="pb-6">
                        <ul role="list" className="list-disc space-y-1 pl-5 text-sm/6 text-gray-700 marker:text-gray-300">
                          {detail.items.map((item) => (
                            <li key={item} className="pl-2">
                              {item}
                            </li>
                          ))}
                        </ul>
                      </DisclosurePanel>
                    </Disclosure>
                  ))}
                </div>
              </section>

            </div>
          </div>

        </div>
      </div>

    </ArtboardsProvider>
  );
}

