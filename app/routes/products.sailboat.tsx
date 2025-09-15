import {type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {useLoaderData, type MetaFunction} from 'react-router';
import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';
import {
  JudgemeAllReviewsCount,
  JudgemeAllReviewsRating,
} from "@judgeme/shopify-hydrogen";

import {ProductPrice} from '~/components/ProductPrice';
import {ProductForm} from '~/components/ProductForm';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {ArtboardsProvider} from '~/context/artboards';
import {ArtboardPreview} from '~/components/ArtboardPreview';
import { ArtboardSelectSchematic, type Schematic } from '~/components/ArtboardSelectSchematic';
import { ArtboardSelectVectors } from '~/components/ArtboardSelectVectors';
import { ArtboardText } from '~/components/ArtboardText';
import { ArtboardColorPicker } from '~/components/ArtboardColorPicker';
import Tabs from '~/components/Tabs';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export const meta: MetaFunction<typeof loader> = ({data}) => {
  return [
    {title: `Drawscape | ${data?.product.title ?? ''}`},
    {
      rel: 'canonical',
      href: `/products/${data?.product.handle}`,
    },
  ];
};

export async function loader(args: LoaderFunctionArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  // Parse URL query params
  const url = new URL(args.request.url);
  const paramId = url.searchParams.get('schematic_id') || url.searchParams.get('schematicId');
  const envDefault = args.context.env.SAILBOAT_DEFAULT_SCHEMATIC_ID ?? null;

  // Fetch schematics via app proxy with absolute URL (server-safe)
  let schematics: Schematic[] = [];
  try {
    const origin = url.origin;
    const apiUrl = new URL('/api/drawscape/schematics', origin);
    apiUrl.searchParams.set('published', 'true');
    apiUrl.searchParams.set('sort', 'title');
    apiUrl.searchParams.set('category', 'sailboats');
    const res = await fetch(apiUrl.toString());
    const raw = await res.json();
    schematics = (Array.isArray(raw) ? raw : [])
      .filter(Boolean)
      .map((item: any) => ({ id: item?.id, name: item?.title || 'Untitled' }));
  } catch (error) {
    console.error('Error fetching schematics', error);
    schematics = [];
  }

  // Compute initialSchematicId with proper precedence
  const validIds = new Set(schematics.map((s) => s.id));
  const initialSchematicId = paramId && validIds.has(paramId)
    ? paramId
    : envDefault && validIds.has(envDefault)
      ? envDefault
      : schematics[0]?.id ?? null;

  return {...deferredData, ...criticalData, initialSchematicId, schematics};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({
  context,
  request,
}: LoaderFunctionArgs) {
  const handle = 'sailboat';
  const {storefront} = context;

  console.log('loadCriticalData')

  const [{product}] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {handle, selectedOptions: getSelectedProductOptions(request)},
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  // The API handle might be localized, so redirect to the localized handle
  redirectIfHandleIsLocalized(request, {handle, data: product});

  return {
    product,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData(_args: LoaderFunctionArgs) {
  // Put any API calls that is not critical to be available on first page render
  // For example: product reviews, product recommendations, social feeds.

  return {};
}

export default function Product() {
  const {product, initialSchematicId, schematics} = useLoaderData<typeof loader>();

  // Optimistically selects a variant with given available variant information
  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  // Sets the search param to the selected variant without navigation
  // only when no search params are set in the url
  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  // Get the product options array
  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  const {title, descriptionHtml} = product;

  return (
    <>
    <ArtboardsProvider initialSchematicId={initialSchematicId}>
      <div className="bg-white">
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
          <div className="lg:grid lg:grid-cols-6 lg:items-start lg:gap-x-8">
            
            {/* Artboard preview */}
            <div className="lg:col-span-4">
              <ArtboardPreview />
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
                  <ArtboardSelectSchematic category="sailboats" options={schematics} />
                  <ArtboardSelectVectors />
                  
                  {/* Color Picker */}
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-gray-900">Color</h3>
                    <div className="mt-2">
                      <ArtboardColorPicker />
                    </div>
                  </div>
                </Tabs.Content>
                
                <Tabs.Content value="text" className="mt-6">
                  <ArtboardText />
                </Tabs.Content>
                
                <Tabs.Content value="legend" className="mt-6"></Tabs.Content>
              </Tabs>

              {/* Divider */}
              <div className="my-8 border-t border-gray-200" aria-hidden="true" />

              {/* Title */}
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">{title}</h1>
              
              {/* Reviews */}
              <div className="mt-3">
                <h3 className="sr-only">Reviews</h3>
                <div className="flex items-center">
                  <div className="flex items-center">
                    <JudgemeAllReviewsRating />
                    <JudgemeAllReviewsCount /> Reviews
                  </div>
                  <p className="sr-only">4 out of 5 stars</p>
                </div>
              </div>            

              <div className="mt-3">
                <div className="text-3xl tracking-tight text-gray-900">
                  <ProductPrice
                    price={selectedVariant?.price}
                    compareAtPrice={selectedVariant?.compareAtPrice}
                  />
                </div>
                <ProductForm
                  productOptions={productOptions}
                  selectedVariant={selectedVariant}
                />         
              </div>
            </div>
          </div>

        </div>
      </div>

    </ArtboardsProvider>

    {/* Analytics */}
      <Analytics.ProductView
      data={{
        products: [
          {
            id: product.id,
            title: product.title,
            price: selectedVariant?.price.amount || '0',
            vendor: product.vendor,
            variantId: selectedVariant?.id || '',
            variantTitle: selectedVariant?.title || '',
            quantity: 1,
          },
        ],
      }}
    />
    </>
    
  );
}

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    compareAtPrice {
      amount
      currencyCode
    }
    id
    image {
      __typename
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
    selectedOptions {
      name
      value
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
  }
` as const;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    handle
    descriptionHtml
    description
    encodedVariantExistence
    encodedVariantAvailability
    options {
      name
      optionValues {
        name
        firstSelectableVariant {
          ...ProductVariant
        }
        swatch {
          color
          image {
            previewImage {
              url
            }
          }
        }
      }
    }
    selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...ProductVariant
    }
    adjacentVariants (selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    seo {
      description
      title
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
` as const;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
  ${PRODUCT_FRAGMENT}
` as const;


