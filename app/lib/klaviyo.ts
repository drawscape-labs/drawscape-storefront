// Klaviyo API configuration
const KLAVIYO_API_BASE_URL = 'https://a.klaviyo.com/api';
const KLAVIYO_API_REVISION = '2025-07-15';

// Klaviyo newsletter list ID
export const KLAVIYO_NEWSLETTER_LIST_ID = 'TL5yEt';

/**
 * Parameters for subscribing a profile to Klaviyo
 */
export interface KlaviyoSubscribeParams {
  email: string;
  firstName?: string;
  lastName?: string;
  properties?: Record<string, string>;
}

/**
 * Type definition for Klaviyo API error response with duplicate profile
 */
interface KlaviyoErrorResponse {
  errors: Array<{
    status: number;
    code: string;
    meta?: { duplicate_profile_id?: string };
  }>;
}

/**
 * Creates standard headers for Klaviyo API requests
 */
function createKlaviyoHeaders(apiKey: string): HeadersInit {
  return {
    'Authorization': `Klaviyo-API-Key ${apiKey}`,
    'Content-Type': 'application/vnd.api+json',
    'accept': 'application/vnd.api+json',
    'revision': KLAVIYO_API_REVISION,
  };
}

/**
 * Builds profile attributes object from parameters
 */
function buildProfileAttributes(params: KlaviyoSubscribeParams) {
  const { email, firstName, lastName, properties } = params;
  
  return {
    email,
    ...(firstName && { first_name: firstName }),
    ...(lastName && { last_name: lastName }),
    ...(properties && { properties }),
  };
}

/**
 * Creates or retrieves an existing Klaviyo profile
 * @returns Profile ID if successful, null otherwise
 */
async function getOrCreateProfile(
  apiKey: string,
  params: KlaviyoSubscribeParams
): Promise<string | null> {
  const profileAttributes = buildProfileAttributes(params);
  
  const profilePayload = {
    data: {
      type: 'profile',
      attributes: profileAttributes,
    },
  };

  const response = await fetch(`${KLAVIYO_API_BASE_URL}/profiles`, {
    method: 'POST',
    headers: createKlaviyoHeaders(apiKey),
    body: JSON.stringify(profilePayload),
  });

  // Profile created successfully
  if (response.ok) {
    const profileData = await response.json() as { data: { id: string } };
    return profileData.data.id;
  }

  // Profile already exists - extract the existing profile ID
  if (response.status === 409) {
    const errorData = await response.json() as KlaviyoErrorResponse;
    const duplicateProfileId = errorData.errors?.[0]?.meta?.duplicate_profile_id;
    return duplicateProfileId || null;
  }

  // Other error occurred
  return null;
}

/**
 * Subscribes a profile to a Klaviyo list with marketing consent
 */
async function subscribeProfileToList(
  apiKey: string,
  profileId: string,
  email: string,
  listId: string
): Promise<boolean> {
  const subscriptionPayload = {
    data: {
      type: 'profile-subscription-bulk-create-job',
      attributes: {
        profiles: {
          data: [
            {
              type: 'profile',
              id: profileId,
              attributes: {
                email,
                subscriptions: {
                  email: {
                    marketing: {
                      consent: 'SUBSCRIBED',
                    },
                  },
                },
              },
            },
          ],
        },
        historical_import: false,
      },
      relationships: {
        list: {
          data: {
            type: 'list',
            id: listId,
          },
        },
      },
    },
  };

  const response = await fetch(
    `${KLAVIYO_API_BASE_URL}/profile-subscription-bulk-create-jobs`,
    {
      method: 'POST',
      headers: createKlaviyoHeaders(apiKey),
      body: JSON.stringify(subscriptionPayload),
    }
  );

  return response.ok;
}

/**
 * Creates or updates a Klaviyo profile without subscribing them to any list.
 * This is useful for tracking contacts while respecting their subscription preferences.
 * 
 * @param apiKey - Klaviyo API key
 * @param params - Profile information including email and optional name/properties
 * @returns Promise that resolves to true if successful, false otherwise
 */
export async function updateProfile(
  apiKey: string,
  params: KlaviyoSubscribeParams,
): Promise<boolean> {
  try {
    const profileId = await getOrCreateProfile(apiKey, params);
    return profileId !== null;
  } catch (error) {
    return false;
  }
}

/**
 * Subscribes a user to the Klaviyo newsletter list.
 * 
 * This function performs two operations:
 * 1. Creates or updates the profile with their information
 * 2. Subscribes them to the specified list with SUBSCRIBED consent
 * 
 * @param apiKey - Klaviyo API key
 * @param params - Profile information including email and optional name/properties
 * @param listId - Optional list ID (defaults to KLAVIYO_NEWSLETTER_LIST_ID)
 * @returns Promise that resolves to true if successful, false otherwise
 */
export async function subscribeToNewsletter(
  apiKey: string,
  params: KlaviyoSubscribeParams,
  listId: string = KLAVIYO_NEWSLETTER_LIST_ID,
): Promise<boolean> {
  try {
    // Step 1: Create or get existing profile
    const profileId = await getOrCreateProfile(apiKey, params);
    
    if (!profileId) {
      return false;
    }
    
    // Step 2: Subscribe the profile to the newsletter list
    const subscribed = await subscribeProfileToList(
      apiKey,
      profileId,
      params.email,
      listId
    );

    return subscribed;
  } catch (error) {
    return false;
  }
}
