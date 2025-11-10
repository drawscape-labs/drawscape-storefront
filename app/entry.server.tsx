import type {AppLoadContext} from '@shopify/remix-oxygen';
import {ServerRouter} from 'react-router';
import {isbot} from 'isbot';
import {renderToReadableStream} from 'react-dom/server';
import type {EntryContext} from 'react-router';
import {createContentSecurityPolicy} from '@shopify/hydrogen';

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  reactRouterContext: EntryContext,
  context: AppLoadContext,
) {
  const {nonce, header, NonceProvider} = createContentSecurityPolicy({
    shop: {
      checkoutDomain: context.env.PUBLIC_CHECKOUT_DOMAIN,
      storeDomain: context.env.PUBLIC_STORE_DOMAIN,
    },
    // Allow external stylesheet for Inter font
    styleSrc: ['https://rsms.me', 'blob:', "'self'"],
    // Allow images from Tailwind assets and Shopify domains
    imgSrc: [
      "'self'",
      'data:',
      'https://cdn.shopify.com',
      'https://shopify.com',
      'https://tailwindcss.com',
      'https://drawscape.io',
      'https://drawscape-projects.s3.us-west-2.amazonaws.com',
      'https://queue.simpleanalyticscdn.com',
    ],
    // Allow font files for Inter
    fontSrc: [
      "'self'",
      'data:',
      'https://rsms.me',
      'https://static.klaviyo.com',
    ],
    connectSrc: [
      "'self'",
      'https://cdn.judge.me',
      'https://cdnwidget.judge.me',
      'https://cdn.shopify.com',
      'https://scripts.simpleanalyticscdn.com',
      'https://static-forms.klaviyo.com',
      'https://fast.a.klaviyo.com',
      'https://monorail-edge.shopifysvc.com',
      `https://${context.env.PUBLIC_CHECKOUT_DOMAIN}`,
      `https://${context.env.PUBLIC_STORE_DOMAIN}`,
    ],
    scriptSrc: [
      "'self'",
      'https://cdn.judge.me',
      'https://cdnwidget.judge.me',
      'https://cdn.shopify.com',
      'https://scripts.simpleanalyticscdn.com',
      'https://static.klaviyo.com',
      'https://static-tracking.klaviyo.com',
      'https://chat-assets.frontapp.com',
      `https://${context.env.PUBLIC_CHECKOUT_DOMAIN}`,
      "'unsafe-inline'",
      "'unsafe-eval'",
    ],
  });

  const body = await renderToReadableStream(
    <NonceProvider>
      <ServerRouter
        context={reactRouterContext}
        url={request.url}
        nonce={nonce}
      />
    </NonceProvider>,
    {
      nonce,
      signal: request.signal,
      onError(error) {
        console.error(error);
        responseStatusCode = 500;
      },
    },
  );

  if (isbot(request.headers.get('user-agent'))) {
    await body.allReady;
  }

  responseHeaders.set('Content-Type', 'text/html');
  responseHeaders.set('Content-Security-Policy', header);

  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}

/*
// ===== Previous CSP implementation (kept for reference) =====
import {createContentSecurityPolicy} from '@shopify/hydrogen';

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  reactRouterContext: EntryContext,
  context: AppLoadContext,
) {
  const {nonce, header, NonceProvider} = createContentSecurityPolicy({
    shop: {
      checkoutDomain: context.env.PUBLIC_CHECKOUT_DOMAIN,
      storeDomain: context.env.PUBLIC_STORE_DOMAIN,
    },
    // Allow external stylesheet for Inter font
    styleSrc: ['https://rsms.me', 'blob:', "'self'"],
    // Allow images from Tailwind assets and Shopify domains
    imgSrc: [
      "'self'",
      'data:',
      'https://cdn.shopify.com',
      'https://shopify.com',
      'https://tailwindcss.com',
      'https://drawscape.io',
      'https://drawscape-projects.s3.us-west-2.amazonaws.com',
      'https://queue.simpleanalyticscdn.com',
    ],
    // Allow font files for Inter
    fontSrc: [
      "'self'",
      'data:',
      'https://rsms.me',
      'https://static.klaviyo.com',
    ],
    connectSrc: [
      "'self'",
      'https://cdn.judge.me',
      'https://cdnwidget.judge.me',
      'https://cdn.shopify.com',
      'https://scripts.simpleanalyticscdn.com',
      'https://static-forms.klaviyo.com',
      'https://fast.a.klaviyo.com',
    ],
    scriptSrc: [
      "'self'",
      'https://cdn.judge.me',
      'https://cdnwidget.judge.me',
      'https://cdn.shopify.com',
      'https://scripts.simpleanalyticscdn.com',
      'https://static.klaviyo.com',
      'https://static-tracking.klaviyo.com',
      'https://chat-assets.frontapp.com',
      "'unsafe-inline'",
      "'unsafe-eval'",
      // The nonce will be automatically added by createContentSecurityPolicy
    ],
  });

  const body = await renderToReadableStream(
    <NonceProvider>
      <ServerRouter
        context={reactRouterContext}
        url={request.url}
        nonce={nonce}
      />
    </NonceProvider>,
    {
      nonce,
      signal: request.signal,
      onError(error) {
        console.error(error);
        responseStatusCode = 500;
      },
    },
  );

  if (isbot(request.headers.get('user-agent'))) {
    await body.allReady;
  }

  responseHeaders.set('Content-Type', 'text/html');

  responseHeaders.set('Content-Security-Policy', header);

  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}
*/
