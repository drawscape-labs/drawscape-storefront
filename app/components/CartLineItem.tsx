import type {CartLineUpdateInput} from '@shopify/hydrogen/storefront-api-types';
import type {CartLayout} from '~/components/CartMain';
import {CartForm, Image, type OptimisticCartLine} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';
import {Link} from 'react-router';
import {ProductPrice} from './ProductPrice';
import {useAside} from './Aside';
import type {CartApiQueryFragment} from 'storefrontapi.generated';

type CartLine = OptimisticCartLine<CartApiQueryFragment>;

/**
 * A single line item in the cart. It displays the product image, title, price.
 * It also provides controls to update the quantity or remove the line item.
 */
export function CartLineItem({
  layout,
  line,
}: {
  layout: CartLayout;
  line: CartLine;
}) {
  const {id, merchandise} = line;
  const {product, title, image, selectedOptions} = merchandise;
  const lineItemUrl = useVariantUrl(product.handle, selectedOptions);
  const {close} = useAside();

  let previewUrl = line.attributes?.find((attribute) => attribute.key === '_preview_url')?.value;

  console.log(previewUrl);


  // We no longer read `_preview_svg`. If present from legacy carts, it will
  // simply be ignored in favor of `_preview_url` or the inline optimistic
  // variant image.

  // Detect if the merchandise image is an inline data/blob URL. In that case,
  // render with a plain <img> instead of Hydrogen's <Image> helper.
  const merchandiseImageUrl = (image as any)?.url as string | undefined;
  const isInlineImage = Boolean(
    merchandiseImageUrl &&
      (merchandiseImageUrl.startsWith('data:') || merchandiseImageUrl.startsWith('blob:')),
  );

  return (
    <li key={id} className="flex py-6">
      {image && (
        <div className="shrink-0">
          {previewUrl ? (
            <img
              src={previewUrl}
              className="size-24 rounded-md sm:size-32"
              height={100}
              loading="lazy"
              width={100}
              alt={`Custom design preview`}
            />
          ) : isInlineImage ? (
            <img
              src={merchandiseImageUrl}
              className="size-24 rounded-md sm:size-32"
              height={100}
              loading="lazy"
              width={100}
              alt={title || 'Custom design preview'}
            />
          ) : (
            <Image
              alt={title}
              aspectRatio="1/1"
              data={image}
              className="size-24 rounded-md object-cover sm:size-32"
              height={100}
              loading="lazy"
              width={100}
            />
          )}
        </div>
      )}

      <div className="ml-4 flex flex-1 flex-col sm:ml-6">
        <div>
          <div className="flex justify-between">
            <h4 className="text-sm">
              <Link
                prefetch="intent"
                to={lineItemUrl}
                className="font-medium text-gray-700 hover:text-gray-800"
                onClick={() => {
                  if (layout === 'aside') {
                    close();
                  }
                }}
              >
                {product.title}
              </Link>
            </h4>
            <div className="ml-4 text-sm font-medium text-gray-900">
              <ProductPrice price={line?.cost?.totalAmount} />
            </div>
          </div>
          <ul className="mt-1 text-sm text-gray-500">
            {selectedOptions.map((option) => (
              <li key={option.name}>
                {option.name}: {option.value}
              </li>
            ))}
            {(line.attributes ?? [])
              .filter((a) => a?.key && a?.value)
              .filter((a) => !a.key.startsWith('_'))
              .map((attr) => (
                <li key={`attr-${attr.key}`}>
                  {attr.key}: {attr.value}
                </li>
              ))}
          </ul>
        </div>

        <div className="mt-4 flex flex-1 items-end justify-between">
          <CartLineQuantity line={line} />
          <div className="ml-4">
            <CartLineRemoveButton
              lineIds={[id]}
              disabled={!!line.isOptimistic}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
            />
          </div>
        </div>
      </div>
    </li>
  );
}

/**
 * Provides the controls to update the quantity of a line item in the cart.
 * These controls are disabled when the line item is new, and the server
 * hasn't yet responded that it was successfully added to the cart.
 */
function CartLineQuantity({line}: {line: CartLine}) {
  if (!line || typeof line?.quantity === 'undefined') return null;
  const {id: lineId, quantity, isOptimistic} = line;
  const prevQuantity = Number(Math.max(0, quantity - 1).toFixed(0));
  const nextQuantity = Number((quantity + 1).toFixed(0));

  return (
    <div className="flex items-center space-x-2 text-sm text-gray-700">
      <span className="sr-only">Quantity</span>
      <div className="flex items-center">
        <CartLineUpdateButton lines={[{id: lineId, quantity: prevQuantity}]}>
          <button
            aria-label="Decrease quantity"
            disabled={quantity <= 1 || !!isOptimistic}
            name="decrease-quantity"
            value={prevQuantity}
            className="px-2 py-1 rounded border border-gray-300 text-gray-700 disabled:opacity-50"
          >
            <span>&#8722;</span>
          </button>
        </CartLineUpdateButton>
        <span className="mx-3">{quantity}</span>
        <CartLineUpdateButton lines={[{id: lineId, quantity: nextQuantity}]}>
          <button
            aria-label="Increase quantity"
            name="increase-quantity"
            value={nextQuantity}
            disabled={!!isOptimistic}
            className="px-2 py-1 rounded border border-gray-300 text-gray-700 disabled:opacity-50"
          >
            <span>&#43;</span>
          </button>
        </CartLineUpdateButton>
      </div>
    </div>
  );
}

/**
 * A button that removes a line item from the cart. It is disabled
 * when the line item is new, and the server hasn't yet responded
 * that it was successfully added to the cart.
 */
function CartLineRemoveButton({
  lineIds,
  disabled,
  className,
}: {
  lineIds: string[];
  disabled: boolean;
  className?: string;
}) {
  return (
    <CartForm
      fetcherKey={getUpdateKey(lineIds)}
      route="/cart"
      action={CartForm.ACTIONS.LinesRemove}
      inputs={{lineIds}}
    >
      <button disabled={disabled} type="submit" className={className}>
        <span>Remove</span>
      </button>
    </CartForm>
  );
}

function CartLineUpdateButton({
  children,
  lines,
}: {
  children: React.ReactNode;
  lines: CartLineUpdateInput[];
}) {
  const lineIds = lines.map((line) => line.id);

  return (
    <CartForm
      fetcherKey={getUpdateKey(lineIds)}
      route="/cart"
      action={CartForm.ACTIONS.LinesUpdate}
      inputs={{lines}}
    >
      {children}
    </CartForm>
  );
}

/**
 * Returns a unique key for the update action. This is used to make sure actions modifying the same line
 * items are not run concurrently, but cancel each other. For example, if the user clicks "Increase quantity"
 * and "Decrease quantity" in rapid succession, the actions will cancel each other and only the last one will run.
 * @param lineIds - line ids affected by the update
 * @returns
 */
function getUpdateKey(lineIds: string[]) {
  return [CartForm.ACTIONS.LinesUpdate, ...lineIds].join('-');
}
