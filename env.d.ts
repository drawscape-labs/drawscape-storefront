/// <reference types="vite/client" />
/// <reference types="react-router" />
/// <reference types="@shopify/oxygen-workers-types" />

// Enhance TypeScript's built-in typings.
import '@total-typescript/ts-reset';

import type {
  HydrogenContext,
  HydrogenSessionData,
  HydrogenEnv,
} from '@shopify/hydrogen';
import type {createAppLoadContext} from '~/lib/context';

declare global {
  /**
   * A global `process` object is only available during build to access NODE_ENV.
   */
  const process: {env: {NODE_ENV: 'production' | 'development'}};

  interface Env extends HydrogenEnv {
    // declare additional Env parameter use in the fetch handler and Remix loader context here
    DRAWSCAPE_API_URL: string;

    // Server-only bearer token for Drawscape API
    DRAWSCAPE_API_TOKEN?: string;

    // Default schematic id for Sailboat product page
    SAILBOAT_DEFAULT_SCHEMATIC_ID?: string;
    AIRCRAFT_DEFAULT_SCHEMATIC_ID?: string;
    AIRPORT_DEFAULT_SCHEMATIC_ID?: string;
    AIRPORT_TRAFFIC_DEFAULT_SCHEMATIC_ID?: string;
    TRAIL_DEFAULT_SCHEMATIC_ID?: string;
    
    // Judgeme public configuration
    JUDGEME_SHOP_DOMAIN: string;
    JUDGEME_PUBLIC_TOKEN: string;
    JUDGEME_CDN_HOST: string;

    // Postmark email service configuration
    POSTMARK_API_KEY?: string;
  }

  // Judge.me globals injected on the client
  interface Window {
    jdgm_preloader?: () => void;
    jdgmCacheServer?: {
      reloadAll: () => void;
    };
    jdgm_rerender?: number;
  }
}

declare module 'react-router' {
  interface AppLoadContext
    extends Awaited<ReturnType<typeof createAppLoadContext>> {
    // to change context type, change the return of createAppLoadContext() instead
  }

  // TODO: remove this once we've migrated our loaders to `Route.LoaderArgs` 
  interface LoaderFunctionArgs {
    context: AppLoadContext;
  }

  // TODO: remove this once we've migrated our loaders to `Route.ActionArgs`
  interface ActionFunctionArgs {
    context: AppLoadContext;
  }

  interface SessionData extends HydrogenSessionData {
    // declare local additions to the Remix session data here
  }
}
