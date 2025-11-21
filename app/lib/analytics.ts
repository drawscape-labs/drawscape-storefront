/**
 * Centralized Analytics Tracking Utility
 * 
 * This utility provides a single interface to track events across multiple
 * analytics platforms: Shopify Analytics, Klaviyo, and Simple Analytics.
 * 
 * Usage:
 *   import { trackEvent } from '~/lib/analytics';
 *   
 *   trackEvent('requested_design', {
 *     request_category: 'aircraft',
 *     request_details: 'Boeing 747'
 *   });
 */

// Event name types - add more as needed
export type AnalyticsEventName = 
  | 'requested_design'
  | 'newsletter_signup'
  | 'custom_event';

// Event properties for specific events
export interface RequestedDesignEventProperties {
  request_category: string;
  request_details: string;
}

export interface NewsletterSignupEventProperties {
  source: string;
}

// Map event names to their property types
export type AnalyticsEventProperties = {
  requested_design: RequestedDesignEventProperties;
  newsletter_signup: NewsletterSignupEventProperties;
  custom_event: Record<string, any>;
};

/**
 * Track an event across all analytics platforms
 * 
 * This function sends events to:
 * - Shopify Analytics (via Analytics.publish)
 * - Klaviyo (via window.klaviyo.track)
 * - Simple Analytics (via window.sa_event)
 * 
 * @param eventName - The name of the event to track
 * @param properties - Event-specific properties
 * @param analytics - Optional Shopify analytics instance (from useAnalytics hook)
 */
export function trackEvent<T extends AnalyticsEventName>(
  eventName: T,
  properties: AnalyticsEventProperties[T],
  analytics?: {
    publish: (eventName: string, properties?: Record<string, any>) => void;
  }
): void {
  try {
    // Track to Shopify Analytics
    if (analytics) {
      trackToShopify(eventName, properties, analytics);
    } else {
      console.warn('Shopify Analytics not available - did you forget to pass analytics instance?');
    }

    // Track to Klaviyo
    trackToKlaviyo(eventName, properties);

    // Track to Simple Analytics
    trackToSimpleAnalytics(eventName);

  } catch (error) {
    console.error('Error tracking event:', eventName, error);
  }
}

/**
 * Send event to Shopify Analytics
 * Uses the Analytics.publish() method which respects Customer Privacy API consent
 */
function trackToShopify(
  eventName: string,
  properties: Record<string, any>,
  analytics: {
    publish: (eventName: string, properties?: Record<string, any>) => void;
  }
): void {
  try {
    // Send as custom event to Shopify Analytics
    analytics.publish('custom_event', {
      event_name: eventName,
      ...properties,
    });
    
    console.log('[Analytics] Shopify:', eventName, properties);
  } catch (error) {
    console.error('[Analytics] Shopify tracking failed:', error);
  }
}

/**
 * Send event to Klaviyo
 * Uses window.klaviyo.track() with human-readable event names
 */
function trackToKlaviyo(
  eventName: string,
  properties: Record<string, any>
): void {
  try {
    if (typeof window === 'undefined' || !window.klaviyo) {
      console.warn('[Analytics] Klaviyo not available');
      return;
    }

    // Convert snake_case to Title Case for Klaviyo
    const klaviyoEventName = eventName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    window.klaviyo.track(klaviyoEventName, properties);
    
    console.log('[Analytics] Klaviyo:', klaviyoEventName, properties);
  } catch (error) {
    console.error('[Analytics] Klaviyo tracking failed:', error);
  }
}

/**
 * Send event to Simple Analytics
 * Uses window.sa_event() with snake_case event names
 */
function trackToSimpleAnalytics(eventName: string): void {
  try {
    if (typeof window === 'undefined' || !window.sa_event) {
      console.warn('[Analytics] Simple Analytics not available');
      return;
    }

    window.sa_event(eventName);
    
    console.log('[Analytics] Simple Analytics:', eventName);
  } catch (error) {
    console.error('[Analytics] Simple Analytics tracking failed:', error);
  }
}

/**
 * Hook version for use in React components
 * Automatically gets the Shopify Analytics instance
 * 
 * Usage:
 *   const track = useTrackEvent();
 *   track('requested_design', { ... });
 */
export function useTrackEvent() {
  // This will be imported from @shopify/hydrogen in the component
  // We return a function that components can use
  return trackEvent;
}

