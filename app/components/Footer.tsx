import {Suspense} from 'react';
import {Await, NavLink} from 'react-router';
import type {FooterQuery, HeaderQuery} from 'storefrontapi.generated';

import { FancyIcon } from './FancyIcons';

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
              <h3 className="text-sm/6 font-semibold text-gray-900">Subscribe to our newsletter</h3>
              <p className="mt-2 text-sm/6 text-gray-600">
                The latest news, articles, and resources, sent to your inbox weekly.
              </p>
              <form className="mt-6 sm:flex sm:max-w-md">
                <label htmlFor="email-address" className="sr-only">
                  Email address
                </label>
                <input
                  id="email-address"
                  name="email-address"
                  type="email"
                  required
                  placeholder="Enter your email"
                  autoComplete="email"
                  className="w-full min-w-0 rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:w-64 sm:text-sm/6 xl:w-full"
                />
                <div className="mt-4 sm:mt-0 sm:ml-4 sm:shrink-0">
                  <button
                    type="submit"
                    className="flex w-full items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    Subscribe
                  </button>
                </div>
              </form>
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


