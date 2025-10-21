import {type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {useLoaderData, type MetaFunction} from 'react-router';
import {useState, useEffect} from 'react';
import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';
import {ProductPrice} from '~/components/ProductPrice';
import {ProductReviews} from '~/components/ProductReviews';
import {AddToCartButton} from '~/components/AddToCartButton';
import {useAside} from '~/components/Aside';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import drawscapeServerApi from '~/lib/drawscapeServerApi';
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from '@headlessui/react';
import {MinusIcon, PlusIcon} from '@heroicons/react/24/outline';
import {Input} from '~/ui/input';
import {Field, Label} from '~/ui/fieldset';

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
}: LoaderFunctionArgs) {
  const handle = 'request-a-design';
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

  // Parse URL query params for schematic_id
  const url = new URL(request.url);
  const schematicId = url.searchParams.get('schematic_id') || url.searchParams.get('schematicId');

  // Fetch schematic data if schematic_id is provided
  let schematic: {id: string; title: string} | null = null;
  if (schematicId) {
    try {
      const api = drawscapeServerApi(context.env.DRAWSCAPE_API_URL);
      const schematicData = await api.get<any>(`schematics/${schematicId}`);
      if (schematicData?.id && schematicData?.title) {
        schematic = {
          id: schematicData.id,
          title: schematicData.title,
        };
      }
    } catch (error) {
      console.error('Error fetching schematic:', error);
      // Continue without schematic data - gracefully degrade
    }
  }

  return {
    product,
    schematic,
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

// Product details for disclosure sections
const productDetails = [
  {
    name: 'How it Works',
    items: [
      'Tell us your design request, and then pay the $5 down payment.',
      'We will send you design renderings in 24-72 hours.',
      'You can request changes if needed.',
      'Make your purchase via the website when you are happy with the design.',
    ],
  },
  {
    name: 'How Long Does it Take?',
    items: [
      'Our goal is 24-72 hours to show you the first rendering.',
      'If you have requests or changes, it can take longer.',
    ],
  },
  {
    name: '100% Refund Policy',
    items: [
      `If you don't like the design, we'll refund your $5. No questions asked.`,
    ],
  },
  {
    name: 'Can I share designs files?',
    items: [
      `Yes, if you have any custom images/files of your design, please share them with us.`,
    ],
  },
  {
    name: 'What can I Request?',
    items: [
      `This is primarily meant for Airports, Airplanes, Helicopters, and Sailboats.`,
      <>If you have a more custom request, please <a href="/contact" className="underline text-blue-600 hover:text-blue-800">contact us</a>.</>,
    ],
  },
];

export default function Product() {
  const {product, schematic} = useLoaderData<typeof loader>();
  const {open} = useAside();

  // State for design request input - initialize with schematic title if available
  const [designRequest, setDesignRequest] = useState(schematic?.title || '');

  // Update the design request when schematic changes (for client-side navigation)
  useEffect(() => {
    if (schematic?.title) {
      setDesignRequest(schematic.title);
    }
  }, [schematic]);

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

  const {title, descriptionHtml, media} = product;

  // Get the first image from media gallery
  const firstMediaNode = media?.edges?.[0]?.node;
  const firstImage =
    (firstMediaNode?.__typename === 'MediaImage' ? firstMediaNode.image : null) ||
    selectedVariant?.image;

  return (
    <>
      <div className="bg-white">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 md:py-12 lg:max-w-7xl lg:px-8 lg:py-12">
          <div className="lg:grid lg:grid-cols-6 lg:items-start lg:gap-x-8">

            {/* Product image */}
            <div className="px-4 sm:px-0 lg:col-span-4 sm:mt-0">
              {firstImage && (
                <div className="h-40 sm:h-auto w-full overflow-hidden rounded-lg">
                  <img
                    src={firstImage.url}
                    alt={firstImage.altText || title}
                    className="w-full h-full object-cover object-center"
                  />
                </div>
              )}
            </div>

            {/* Product info */}
            <div className="mt-1 px-4 sm:mt-10 sm:px-0 lg:mt-0 lg:col-span-2">

              {/* Product Information */}
              <div className="flex flex-col gap-3">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                  {title}
                </h1>

                <div className="text-3xl tracking-tight text-gray-900">
                  <ProductPrice
                    price={selectedVariant?.price}
                    compareAtPrice={selectedVariant?.compareAtPrice}
                  />
                </div>

                <div>
                  <h3 className="sr-only">Reviews</h3>
                  <ProductReviews />
                  <div
                    className="mt-3 text-gray-700"
                    dangerouslySetInnerHTML={{__html: descriptionHtml}}
                  />
                </div>

                <Field>
                  <Label htmlFor="design-request">Design Request</Label>
                  <Input
                    id="design-request"
                    type="text"
                    value={designRequest}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setDesignRequest(e.target.value)
                    }
                    placeholder="Describe your design request..."
                    className="w-full"
                  />
                </Field>

                <AddToCartButton
                  disabled={!selectedVariant || !selectedVariant.availableForSale}
                  onClick={() => {
                    open('cart');
                  }}
                  lines={
                    selectedVariant
                      ? [
                          {
                            merchandiseId: selectedVariant.id,
                            quantity: 1,
                            selectedVariant,
                            attributes: [
                              ...(designRequest.trim()
                                ? [{key: 'Design', value: designRequest.trim()}]
                                : []),
                              ...(schematic?.id
                                ? [{key: '_schematic_id', value: schematic.id}]
                                : []),
                            ],
                          },
                        ]
                      : []
                  }
                >
                  {selectedVariant?.availableForSale ? 'Add to cart' : 'Sold out'}
                </AddToCartButton>
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
                          {detail.items.map((item, index) => (
                            <li key={index} className="pl-2">
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
          __typename
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
