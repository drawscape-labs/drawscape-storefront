import type {CartApiQueryFragment} from 'storefrontapi.generated';
import type {CartLayout} from '~/components/CartMain';
import {Money, type OptimisticCart} from '@shopify/hydrogen';

type CartSummaryProps = {
  cart: OptimisticCart<CartApiQueryFragment | null>;
  layout: CartLayout;
};

export function CartSummary2({cart, layout}: CartSummaryProps) {
  const className =
    layout === 'page' ? 'cart-summary-page' : 'cart-summary-aside';

  return (
    <div className={className}>
      {/* Order summary */}
      <section aria-labelledby="summary-heading" className="mt-10 pb-6">
        <h2 id="summary-heading" className="sr-only">
          Order summary
        </h2>

        <div>
          <dl className="space-y-4">
            <div className="flex items-center justify-between">
              <dt className="text-base font-medium text-gray-900">Subtotal</dt>
              <dd className="ml-4 text-base font-medium text-gray-900">
                {cart.cost?.subtotalAmount?.amount ? (
                  <Money data={cart.cost?.subtotalAmount} />
                ) : (
                  '-'
                )}
              </dd>
            </div>
          </dl>
          <p className="mt-1 text-sm text-gray-500">
            Shipping and discounts will be calculated at checkout.
          </p>
        </div>

        <div className="mt-10">
          {cart.checkoutUrl ? (
            <a
              href={cart.checkoutUrl}
              target="_self"
              className="w-full inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-3 text-base font-medium text-white shadow-xs hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50 focus:outline-hidden"
            >
              Checkout
            </a>
          ) : (
            <button
              type="button"
              disabled
              aria-disabled
              className="w-full rounded-md border border-transparent bg-indigo-600/60 px-4 py-3 text-base font-medium text-white shadow-xs cursor-not-allowed"
            >
              Checkout
            </button>
          )}
        </div>

      </section>
    </div>
  );
}