/**
 * RequestDesign
 * 
 * A form component for submitting a design request.
 * 
 * Collects: name, email address, and design request details.
 * Submits to the Drawscape API endpoint /api/v1/schematics/request
 * 
 * Props: none
 */
import React, { useState, useEffect } from 'react';
import { Input } from '~/ui/input';
import { Textarea } from '~/ui/textarea';
import { Button } from '~/ui/button';
import { Heading } from '~/ui/heading';
import { Fieldset, Field, Label } from '~/ui/fieldset';
import { useAside } from '~/components/Aside';
import drawscapeApi from '~/lib/drawscapeApi';

// Declare Klaviyo global for TypeScript
declare global {
  interface Window {
    klaviyo?: {
      identify: (properties: Record<string, any>) => void;
      track: (eventName: string, properties?: Record<string, any>) => void;
      push: (args: any[]) => void;
    };
  }
}

export const RequestDesign = () => {
  const { close } = useAside();
  
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [request, setRequest] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Determine if form is valid (all required fields filled)
  const isFormValid = name.trim() !== '' && email.trim() !== '' && request.trim() !== '';

  // Submit handler with API integration
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Prepare the request payload according to API specification
      const payload = {
        name: name,
        email: email,
        request: request
      };

      // Submit to Drawscape API via the proxy
      await drawscapeApi.post('schematics/request', payload);

      if (window.klaviyo) {
        await window.klaviyo.identify({
          email: payload.email,
          first_name: payload.name.split(' ')[0],
          last_name: payload.name.split(' ').slice(1).join(' '),
        });
        
        await window.klaviyo.track('Requested Design', {
          email: payload.email,
          design_request: payload.request,
        });
      }
      
      setSubmitted(true);
      // Clear form on success
      setName('');
      setEmail('');
      setRequest('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <Heading level={2} className="mb-4 text-2xl font-bold">
        Don't see what you need?
      </Heading>
      <p className="text-sm text-gray-500">Tell us what you are looking for and we'll notify you when it's added to the store.</p>
      <br />
      
      {submitted ? (
        <>
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <p className="text-green-800 text-center">
              Thank you for your request! We'll be in touch soon.
            </p>
          </div>
          <div className="flex justify-center">
            <Button 
              onClick={close}
              outline={true}
              className="px-6 py-2"
            >
              Continue Shopping
            </Button>
          </div>
        </>
      ) : (
        <>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800 text-center">
                {error}
              </p>
            </div>
          )}
        <form onSubmit={handleSubmit} className="max-w-md">
          <Fieldset>
            <Field className="mb-6">
              <Label htmlFor="request-name" className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </Label>
              <Input
                id="request-name"
                type="text"
                value={name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                required
                autoComplete="name"
                placeholder="Your name"
                className="w-full"
              />
            </Field>
            <Field className="mb-6">
              <Label htmlFor="request-email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </Label>
              <Input
                id="request-email"
                type="email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@email.com"
                className="w-full"
              />
            </Field>

            <Field className="mb-8">
              <Label htmlFor="request-details" className="block text-sm font-medium text-gray-700 mb-2">
                Design Request
              </Label>
              <Textarea
                id="request-details"
                value={request}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRequest(e.target.value)}
                required
                rows={4}
                placeholder="Describe your design request..."
                className="w-full resize-none"
              />
            </Field>

            <div className="flex justify-center gap-4">
              <Button 
                type="submit" 
                color="indigo" 
                className="px-8 py-3 text-lg font-semibold"
                disabled={isSubmitting || !isFormValid}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </Button>
              <Button
                type="button"
                outline={true}
                className="px-8 py-3 text-lg font-semibold"
                onClick={close}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </Fieldset>
        </form>
        </>
      )}
    </div>
  );
};

export default RequestDesign;
