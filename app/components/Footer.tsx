import {Suspense, useState} from 'react';
import {Await, NavLink} from 'react-router';
import type {FooterQuery, HeaderQuery} from 'storefrontapi.generated';

import { FancyIcon } from './FancyIcons';
import { Input } from '~/ui/input';
import { Button } from '~/ui/button';
import { subscribeToNewsletterClient } from '~/lib/klaviyo';

// Declare Klaviyo global for TypeScript
declare global {
  interface Window {
    klaviyo?: {
      identify: (properties: Record<string, any>) => void;
      track: (eventName: string, properties?: Record<string, any>) => void;
      push: (args: any[]) => void;
      isIdentified: () => boolean;
    };
  }
}

const FALLBACK_FOOTER_MENU = {
  items: [
    { id: '1', title: 'Home', url: '/' },
    { id: '2', title: 'About', url: '/about' },
    { id: '3', title: 'Contact', url: '/contact' },
  ],
};

const navigation = {
  copyright: '© 2025 Drawscape, Inc. All rights reserved.',
  social: [
    {
      name: 'Facebook',
      href: 'https://www.facebook.com/profile.php?id=61567081632107',
      icon: 'facebook',
    },
    {
      name: 'Instagram',
      href: 'https://www.instagram.com/_draw_scape',
      icon: 'instagram',
    },
    {
      name: 'X (Twitter)',
      href: 'https://x.com/draw_scape',
      icon: 'x',
    },
    {
      name: 'GitHub',
      href: 'https://github.com/drawscape-labs',
      icon: 'github',
    },
    {
      name: 'YouTube',
      href: 'https://www.youtube.com/@draw_scape',
      icon: 'youtube',
    },
    {
      name: 'TikTok',
      href: 'https://www.tiktok.com/@draw_scape',
      icon: 'tiktok',
    },
  ],
};

interface FooterProps {
  footer: Promise<FooterQuery | null>;
  footerProducts: Promise<FooterQuery | null>;
  footerLegal: Promise<FooterQuery | null>;
  header: HeaderQuery;
  publicStoreDomain: string;
}

function activeLinkStyle({
  isActive,
  isPending,
}: {
  isActive: boolean;
  isPending: boolean;
}) {
  return {
    fontWeight: isActive ? 'bold' : undefined,
    color: isPending ? 'grey' : undefined,
  };
}

export function Footer({
  footer: footerPromise,
  footerProducts: footerProductsPromise,
  footerLegal: footerLegalPromise,
  header,
  publicStoreDomain,
}: FooterProps) {
  return (
    <Suspense>
      <footer className="bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 pt-20 pb-8 sm:pt-24 lg:px-8 lg:pt-32">
          <div className="xl:grid xl:grid-cols-3 xl:gap-8">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 xl:col-span-2">
              <div>
                <Await resolve={footerPromise}>
                  {(footer) => (
                    <>
                      {footer?.menu && header.shop.primaryDomain?.url ? (
                        <div>
                          <h3 className="text-sm/6 font-semibold text-gray-900">Company</h3>
                          <FooterMenu
                            menu={footer.menu}
                            primaryDomainUrl={header.shop.primaryDomain.url}
                            publicStoreDomain={publicStoreDomain}
                          />
                        </div>
                      ) : null}
                    </>
                  )}
                </Await>
              </div>
              <div>
                <Await resolve={footerProductsPromise}>
                  {(footerProducts) => (
                    <>
                      {footerProducts?.menu && header.shop.primaryDomain?.url ? (
                        <div>
                          <h3 className="text-sm/6 font-semibold text-gray-900">Products</h3>
                          <FooterMenu
                            menu={footerProducts.menu}
                            primaryDomainUrl={header.shop.primaryDomain.url}
                            publicStoreDomain={publicStoreDomain}
                          />
                        </div>
                      ) : null}
                    </>
                  )}
                </Await>
              </div>
              <div>
                <Await resolve={footerLegalPromise}>
                  {(footerLegal) => (
                    <>
                      {footerLegal?.menu && header.shop.primaryDomain?.url ? (
                        <div>
                          <h3 className="text-sm/6 font-semibold text-gray-900">Legal</h3>
                          <FooterMenu
                            menu={footerLegal.menu}
                            primaryDomainUrl={header.shop.primaryDomain.url}
                            publicStoreDomain={publicStoreDomain}
                          />
                        </div>
                      ) : null}
                    </>
                  )}
                </Await>
              </div>
            </div>
            <div className="mt-10 xl:mt-0">
              <h3 className="text-sm/6 font-semibold text-gray-900">Stay Updated!</h3>
              <p className="mt-2 text-sm/6 text-gray-600">
              Don't miss new additions to the Drawscape library.
              </p>
              <NewsletterForm />
            </div>
          </div>
          <div className="mt-16 border-t border-gray-900/10 pt-8 sm:mt-20 md:flex md:items-center md:justify-between lg:mt-24">
            <div className="flex gap-x-6 md:order-2">
              {navigation.social.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-800"
                >
                  <span className="sr-only">{item.name}</span>
                  <FancyIcon name={item.icon as any} width={24} height={24} />
                </a>
              ))}
            </div>
            <p className="mt-8 text-sm/6 text-gray-600 md:order-1 md:mt-0">
              {navigation.copyright}
            </p>
          </div>
        </div>
      </footer>
    </Suspense>
  );
}

function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const success = await subscribeToNewsletterClient({
        email,
        properties: {
          source: 'Footer Newsletter',
        },
      });

      if (success) {
        // Identify the user in Klaviyo for session tracking
        if (window.klaviyo) {
          window.klaviyo.identify({
            email: email,
          });
        }

        setSubmitted(true);
        setEmail('');
      } else {
        setError('Failed to subscribe. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="mt-6 rounded-md bg-green-50 p-4">
        <p className="text-sm font-medium text-green-800">
          Thanks for subscribing! Check your email to confirm.
        </p>
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className="mt-6 rounded-md bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}
      <form onSubmit={handleSubmit} className="mt-6 sm:flex sm:max-w-md">
        <label htmlFor="email-address" className="sr-only">
          Email address
        </label>
        <div className="w-full sm:w-64 xl:w-full">
          <Input
            id="email-address"
            name="email-address"
            type="email"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            required
            placeholder="Enter your email"
            autoComplete="email"
            className="w-full"
          />
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-4 sm:shrink-0">
          <Button
            type="submit"
            color="indigo"
            disabled={isSubmitting || !email.trim()}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? 'Subscribing...' : 'Subscribe'}
          </Button>
        </div>
      </form>
    </>
  );
}

function FooterMenu({
  menu,
  primaryDomainUrl,
  publicStoreDomain,
  className,
  linkClassName,
  ulClassName,
}: {
  menu: FooterQuery['menu'];
  primaryDomainUrl?: FooterProps['header']['shop']['primaryDomain']['url'];
  publicStoreDomain?: string;
  className?: string;
  linkClassName?: string;
  ulClassName?: string;
}) {
  const resolvedUlClassName = ulClassName ?? 'mt-6 space-y-4';
  const resolvedLinkClassName =
    linkClassName ??
    'text-sm/6 text-gray-600 hover:text-gray-900';
  return (
    <nav className={className} role="navigation">
      <ul role="list" className={resolvedUlClassName}>
        {(menu || FALLBACK_FOOTER_MENU).items.map((item) => {
          if (!item.url) return null;
          const matchesPublicStore = publicStoreDomain ? item.url.includes(publicStoreDomain) : false;
          const matchesPrimaryDomain = primaryDomainUrl ? item.url.includes(primaryDomainUrl) : false;
          const url =
            item.url.includes('myshopify.com') || matchesPublicStore || matchesPrimaryDomain
              ? new URL(item.url).pathname
              : item.url;
          const isExternal = !url.startsWith('/');
          return (
            <li key={item.id}>
              {isExternal ? (
                <a href={url} rel="noopener noreferrer" target="_blank" className={resolvedLinkClassName}>
                  {item.title}
                </a>
              ) : (
                <NavLink
                  end
                  prefetch="intent"
                  style={activeLinkStyle}
                  className={resolvedLinkClassName}
                  to={url}
                >
                  {item.title}
                </NavLink>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}


