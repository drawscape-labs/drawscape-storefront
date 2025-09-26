import React from 'react';
import { Form, useActionData, useNavigation } from 'react-router';
import type { ActionFunctionArgs } from 'react-router';
import { sendPostmarkEmail } from '~/lib/postmark';
import { Image } from '@shopify/hydrogen-react';

export async function action({ request, context }: ActionFunctionArgs) {
  const formData = await request.formData();
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const message = formData.get('message') as string;

  // Get country information from Cloudflare headers with graceful fallback
  const countryCode = request.headers.get('CF-IPCountry') || 'Unknown';
  const countryName = request.headers.get('CF-IPCountryName') || 'Unknown';
  const city = request.headers.get('CF-IPCity') || 'Unknown';
  const region = request.headers.get('CF-IPRegion') || 'Unknown';

  // Basic validation
  if (!name || !email || !message) {
    return {
      error: 'Please fill in all required fields.',
      success: false,
    };
  }

  if (message.length > 2500) {
    return {
      error: 'Message must be 2500 characters or less.',
      success: false,
    };
  }

  // Send email using Postmark
  try {
    const postmarkApiKey = context.env.POSTMARK_API_KEY;
    
    if (!postmarkApiKey) {
      console.error('POSTMARK_API_KEY environment variable is not set');
      return {
        error: 'Email service is not configured. Please try again later.',
        success: false,
      };
    }

    // Send email to team@drawscape.io
    await sendPostmarkEmail(postmarkApiKey, {
      to: 'team@drawscape.io',
      subject: `New Contact Form Submission from ${name} (${countryCode})`,
      textBody: `New contact form submission:

Name: ${name}
Email: ${email}
Message: ${message}
Location: ${city}, ${region}, ${countryName} (${countryCode})
Timestamp: ${new Date().toISOString()}`,
      htmlBody: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Location:</strong> ${city}, ${region}, ${countryName} (${countryCode})</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
      `,
      replyTo: email, // Allow team to reply directly to the sender
    });
    
    return {
      success: true,
      message: 'Thank you for your message! We\'ll get back to you soon.',
    };
  } catch (error) {
    console.error('Error sending contact form email:', error);
    return {
      error: 'Failed to send your message. Please try again later.',
      success: false,
    };
  }
}

export default function Contact() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  // Image data for optimization
  const contactImage = {
    url: 'https://cdn.shopify.com/s/files/1/0905/0138/2438/files/DSC_0027.jpg?v=1747759978',
  };

  return (
    <div className="relative bg-white dark:bg-gray-900">
      <div className="lg:absolute lg:inset-0 lg:left-1/2">
        <Image
          data={contactImage}
          alt=""
          className="h-64 w-full bg-gray-50 object-cover sm:h-80 lg:absolute lg:h-full dark:bg-gray-800"
          width="800"  
          sizes="(min-width: 1024px) 50vw, 100vw"
          loading="eager"
        />
      </div>
      <div className="pt-16 pb-24 sm:pt-24 sm:pb-32 lg:mx-auto lg:grid lg:max-w-7xl lg:grid-cols-2 lg:pt-32">
        <div className="px-6 lg:px-8">
          <div className="mx-auto max-w-xl lg:mx-0 lg:max-w-lg">
            <h2 className="text-4xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-5xl dark:text-white">
              Get in touch
            </h2>
            <p className="mt-2 text-lg/8 text-gray-600 dark:text-gray-400">
              Need a custom design? Curious about our products and capabilities? We'd love to hear from you!
            </p>
            
            {/* Success/Error Messages */}
            {actionData?.success && (
              <div className="mt-8 rounded-md bg-green-50 p-4 dark:bg-green-900/20">
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  {actionData.message}
                </p>
              </div>
            )}
            
            {actionData?.error && (
              <div className="mt-8 rounded-md bg-red-50 p-4 dark:bg-red-900/20">
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  {actionData.error}
                </p>
              </div>
            )}
            
            {/* Only show form if not successfully submitted */}
            {!actionData?.success && (
              <Form method="post" className="mt-16">
              <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="name" className="block text-sm/6 font-semibold text-gray-900 dark:text-white">
                    Name
                  </label>
                  <div className="mt-2.5">
                    <input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      required
                      className="block w-full rounded-md bg-white px-3.5 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
                    />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="email" className="block text-sm/6 font-semibold text-gray-900 dark:text-white">
                    Email
                  </label>
                  <div className="mt-2.5">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className="block w-full rounded-md bg-white px-3.5 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
                    />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <div className="flex justify-between text-sm/6">
                    <label htmlFor="message" className="block text-sm/6 font-semibold text-gray-900 dark:text-white">
                      Message
                    </label>
                    <p id="message-description" className="text-gray-400 dark:text-gray-500">
                      Max 2500 characters
                    </p>
                  </div>
                  <div className="mt-2.5">
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      required
                      aria-describedby="message-description"
                      className="block w-full rounded-md bg-white px-3.5 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
                      defaultValue={''}
                    />
                  </div>
                </div>
              </div>
              <div className="mt-10 flex justify-end border-t border-gray-900/10 pt-8 dark:border-white/10">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500"
                >
                  {isSubmitting ? 'Sending...' : 'Send message'}
                </button>
              </div>
            </Form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
