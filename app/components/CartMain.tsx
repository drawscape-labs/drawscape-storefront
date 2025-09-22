import {useOptimisticCart} from '@shopify/hydrogen';
import {Link} from 'react-router';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';
import {CartLineItem} from '~/components/CartLineItem';
import {CartSummary2} from '~/components/CartSummary2';
import {Button} from '~/ui/button';

export type CartLayout = 'page' | 'aside';

export type CartMainProps = {
  cart: CartApiQueryFragment | null;
  layout: CartLayout;
};

/**
 * The main cart component that displays the cart items and summary.
 * It is used by both the /cart route and the cart aside dialog.
 */
export function CartMain({layout, cart: originalCart}: CartMainProps) {
  // The useOptimisticCart hook applies pending actions to the cart
  // so the user immediately sees feedback when they modify the cart.
  const cart = useOptimisticCart(originalCart);

  const linesCount = Boolean(cart?.lines?.nodes?.length || 0);
  const withDiscount =
    cart &&
    Boolean(cart?.discountCodes?.filter((code) => code.applicable)?.length);
  const className = `cart-main ${withDiscount ? 'with-discount' : ''}`;
  const cartHasItems = cart?.totalQuantity ? cart.totalQuantity > 0 : false;

  // For aside layout: use flex column to fill aside's main area properly
  // For page layout: use full height
  const containerClass = layout === 'aside' 
    ? `${className} flex flex-col h-full` 
    : `${className} h-full flex flex-col`;

  return (
    <div className={containerClass}>
      <CartEmpty hidden={linesCount} layout={layout} />
      {layout === 'aside' ? (
        // Aside layout: Use CSS classes that work with aside's height constraints
        <div className="cart-details flex flex-col flex-1 min-h-0">
          <div className="cart-lines-scroll">
            <ul className="divide-y divide-gray-200">
              {(cart?.lines?.nodes ?? []).map((line) => (
                <CartLineItem key={line.id} line={line} layout={layout} />
              ))}
            </ul>
          </div>
          {cartHasItems && (
            <CartSummary2 cart={cart} layout={layout} />
          )}
        </div>
      ) : (
        // Page layout: Keep original structure
        <div className="cart-details relative flex-1 flex flex-col h-full min-h-0">
          <div
            aria-labelledby="cart-lines"
            className="flex-1 min-h-0 overflow-y-auto pb-[120px]"
          >
            <ul className="divide-y divide-gray-200">
              {(cart?.lines?.nodes ?? []).map((line) => (
                <CartLineItem key={line.id} line={line} layout={layout} />
              ))}
            </ul>
          </div>
          {cartHasItems && (
            <div className="absolute left-0 right-0 bottom-0 z-10 bg-white py-4">
              <CartSummary2 cart={cart} layout={layout} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CartEmpty({
  hidden = false,
}: {
  hidden: boolean;
  layout?: CartMainProps['layout'];
}) {
  const {close} = useAside();
  return (
    <div hidden={hidden} className="flex flex-col items-center justify-center py-8">
      <br />
      <p className="text-lg text-gray-700 text-center">
        Your Cart is Empty
      </p>
      <Button
        className="mt-6"
        outline
        onClick={close}
      >
        Continue Shopping
      </Button>
    </div>
  );
}
