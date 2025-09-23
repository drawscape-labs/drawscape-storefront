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

import {ProductSchematic} from '~/components/ProductSchematic';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import { type Schematic } from '~/components/ArtboardSelectSchematic';
import drawscapeServerApi from '~/lib/drawscapeServerApi';


const SCHEMATIC_CATEGORY = 'airport_diagrams';


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


  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({
  context,
  request,
  params,
}: LoaderFunctionArgs) {
  
  const handle = 'airports';
  const {storefront} = context;

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

  // Parse URL query params
  const url = new URL(request.url);
  const paramId = url.searchParams.get('schematic_id') || url.searchParams.get('schematicId');
  const envDefault = context.env.AIRPORT_DEFAULT_SCHEMATIC_ID ?? null;

  // Fetch schematics using Drawscape server API
  let schematics: Schematic[] = [];
  try {
    const api = drawscapeServerApi(context.env.DRAWSCAPE_API_URL);
    const raw = await api.get('schematics', {
      published: 'true',
      sort: 'title',
      category: SCHEMATIC_CATEGORY, 
      limit: 500
    });
    schematics = (Array.isArray(raw) ? raw : [])
      .filter(Boolean)
      .map((item: any) => ({ id: item?.id, name: item?.title, category: item?.category || 'Untitled' }));
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


  return {
    product,
    initialSchematicId,
    schematics,
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
  

  return (
    <>
      <ProductSchematic
        product={product}
        initialSchematicId={initialSchematicId}
        schematics={schematics}
        productOptions={productOptions}
        selectedVariant={selectedVariant}
      />
      
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
  fragment ProductWithMedia on Product {
    id
    title
    vendor
    handle
    descriptionHtml
    description
    encodedVariantExistence
    encodedVariantAvailability
    media(first: 20) {
      edges {
        node {
          ... on MediaImage {
            id
            image {
              id
              url
              altText
              width
              height
            }
          }
          ... on Video {
            id
            sources {
              url
              mimeType
              format
              height
              width
            }
            previewImage {
              url
              altText
              width
              height
            }
          }
        }
      }
    }
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
  query ProductWithMedia(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...ProductWithMedia
    }
  }
  ${PRODUCT_FRAGMENT}
` as const;


