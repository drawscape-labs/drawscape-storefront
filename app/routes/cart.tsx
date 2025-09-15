import {type MetaFunction, useLoaderData} from 'react-router';
import type {CartQueryDataReturn} from '@shopify/hydrogen';
import {CartForm} from '@shopify/hydrogen';
import {
  data,
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
  type HeadersFunction,
} from '@shopify/remix-oxygen';
import {CartMain} from '~/components/CartMain';
import drawscapeServerApi from '~/lib/drawscapeServerApi';

export const meta: MetaFunction = () => {
  return [{title: `Drawscape | Cart`}];
};

export const headers: HeadersFunction = ({actionHeaders}) => actionHeaders;

export async function action({request, context}: ActionFunctionArgs) {
  const drawscapeApi = drawscapeServerApi(context.env.DRAWSCAPE_API_URL);
  
  const {cart} = context;

  const formData = await request.formData();

  const {action, inputs} = CartForm.getFormInput(formData);

  if (!action) {
    throw new Error('No action provided');
  }

  let status = 200;
  let result: CartQueryDataReturn;

  switch (action) {
    case CartForm.ACTIONS.LinesAdd:
      
      // If an _artboard_payload attribute is found
      // Create an artboard and attach the id to the line's attributes array
      // Delete the _artboard_payload attribute from the line's attributes array
      // Add a _preview_url attribute to the line's attributes array
      for (const line of inputs.lines) {
        const artboardAttr = line.attributes?.find(
          (attribute) => attribute.key === '_artboard_payload',
        );

        if (typeof artboardAttr?.value === 'string') {
          const payload = JSON.parse(artboardAttr.value);
          const artboardResponse = await drawscapeApi.post('artboards', payload).catch(console.log);

          const attributes =
            (line.attributes ?? []).filter((attr) => attr.key !== '_artboard_payload');

          if (artboardResponse?.id) {
            attributes.push({
              key: '_artboard_id',
              value: artboardResponse.id,
            });

            // Preview URL
            if (context.env.DRAWSCAPE_API_URL) {
              const apiBase = context.env.DRAWSCAPE_API_URL.replace(/\/?$/, '/');
              const previewUrl = new URL(`artboards/${artboardResponse.id}/render`, apiBase).toString();
              attributes.push({
                key: '_preview_url',
                value: previewUrl,
              });
            }
          }

          line.attributes = attributes;
        }
      }
      
      result = await cart.addLines(inputs.lines);
      break;
    case CartForm.ACTIONS.LinesUpdate:
      result = await cart.updateLines(inputs.lines);
      break;
    case CartForm.ACTIONS.LinesRemove:
      result = await cart.removeLines(inputs.lineIds);
      break;
    case CartForm.ACTIONS.DiscountCodesUpdate: {
      const formDiscountCode = inputs.discountCode;

      // User inputted discount code
      const discountCodes = (
        formDiscountCode ? [formDiscountCode] : []
      ) as string[];

      // Combine discount codes already applied on cart
      discountCodes.push(...inputs.discountCodes);

      result = await cart.updateDiscountCodes(discountCodes);
      break;
    }
    case CartForm.ACTIONS.GiftCardCodesUpdate: {
      const formGiftCardCode = inputs.giftCardCode;

      // User inputted gift card code
      const giftCardCodes = (
        formGiftCardCode ? [formGiftCardCode] : []
      ) as string[];

      // Combine gift card codes already applied on cart
      giftCardCodes.push(...inputs.giftCardCodes);

      result = await cart.updateGiftCardCodes(giftCardCodes);
      break;
    }
    case CartForm.ACTIONS.BuyerIdentityUpdate: {
      result = await cart.updateBuyerIdentity({
        ...inputs.buyerIdentity,
      });
      break;
    }
    default:
      throw new Error(`${action} cart action is not defined`);
  }

  const cartId = result?.cart?.id;
  const headers = cartId ? cart.setCartId(result.cart.id) : new Headers();
  const {cart: cartResult, errors, warnings} = result;

  const redirectTo = formData.get('redirectTo') ?? null;
  if (typeof redirectTo === 'string') {
    status = 303;
    headers.set('Location', redirectTo);
  }

  return data(
    {
      cart: cartResult,
      errors,
      warnings,
      analytics: {
        cartId,
      },
    },
    {status, headers},
  );
}

export async function loader({context}: LoaderFunctionArgs) {
  const {cart} = context;
  // Initialize Drawscape server API (validates base URL and prepares client)
  void drawscapeServerApi(context.env.DRAWSCAPE_API_URL);
  return await cart.get();
}

export default function Cart() {
  const cart = useLoaderData<typeof loader>();

  return (
    <div className="cart">
      <h1>Cart</h1>
      <CartMain layout="page" cart={cart} />
    </div>
  );
}
