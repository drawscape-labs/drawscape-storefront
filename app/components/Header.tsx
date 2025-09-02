import {Suspense} from 'react';
import {Await, NavLink, useAsyncValue} from 'react-router';
import {
  type CartViewPayload,
  useAnalytics,
  useOptimisticCart,
} from '@shopify/hydrogen';
import type {HeaderQuery, CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';
import {Bars3Icon, MagnifyingGlassIcon, ShoppingCartIcon} from '@heroicons/react/24/outline';
import {ChevronDownIcon} from '@heroicons/react/20/solid';

interface HeaderProps {
  header: HeaderQuery;
  cart: Promise<CartApiQueryFragment | null>;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
}

type Viewport = 'desktop' | 'mobile';

export function Header({
  header,
  cart,
  publicStoreDomain,
}: HeaderProps) {
  const {shop, menu} = header;
  return (
    <header className="header bg-white">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="border-b border-gray-200">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center lg:flex-1">
              <HeaderMenuMobileToggle />
              <NavLink
                prefetch="intent"
                to="/"
                end
                className="absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0"
              >
                <span className="sr-only">{shop.name}</span>
                <img
                  alt={shop.name}
                  src="/logo-full.png"
                  className="h-8 w-auto lg:hidden"
                />
                <img
                  alt={shop.name}
                  src="/logo-full.png"
                  className="hidden h-8 w-auto lg:block lg:ml-2"
                />
              </NavLink>
            </div>

            <div className="hidden lg:flex lg:h-full">
              <div className="flex h-full items-center space-x-8">
                <HeaderMenu
                  menu={menu}
                  viewport="desktop"
                  primaryDomainUrl={header.shop.primaryDomain.url}
                  publicStoreDomain={publicStoreDomain}
                />
              </div>
            </div>

            <HeaderCtas cart={cart} />
          </div>
        </div>
      </div>
    </header>
  );
}

export function HeaderMenu({
  menu,
  primaryDomainUrl,
  viewport,
  publicStoreDomain,
}: {
  menu: HeaderProps['header']['menu'];
  primaryDomainUrl: HeaderProps['header']['shop']['primaryDomain']['url'];
  viewport: Viewport;
  publicStoreDomain: HeaderProps['publicStoreDomain'];
}) {
  const className = `header-menu-${viewport}`;
  const {close} = useAside();

  return (
    <nav
      className={
        viewport === 'desktop'
          ? `${className} flex h-full items-center`
          : `${className} w-full`
      }
      role="navigation"
    >
      {viewport === 'mobile' && (
        <div className="mt-2 w-full">
          {/* Primary links */}
          <div className="space-y-6 border-b border-gray-200 px-4 py-6">
            <div className="flow-root">
              <NavLink
                end
                onClick={close}
                prefetch="intent"
                to="/"
                className="-m-2 block p-2 text-base font-medium text-gray-900"
              >
                Home
              </NavLink>
            </div>
            {(menu || FALLBACK_HEADER_MENU).items.map((item) => {
              if (!item.url) return null;
              const url =
                item.url.includes('myshopify.com') ||
                item.url.includes(publicStoreDomain) ||
                item.url.includes(primaryDomainUrl)
                  ? new URL(item.url).pathname
                  : item.url;
              return (
                <div className="flow-root" key={item.id}>
                  <NavLink
                    end
                    onClick={close}
                    prefetch="intent"
                    to={url}
                    className="-m-2 block p-2 text-base font-medium text-gray-900"
                  >
                    {item.title}
                  </NavLink>
                </div>
              );
            })}
          </div>

          {/* Account links */}
          <div className="space-y-6 border-b border-gray-200 px-4 py-6">
            <div className="flow-root">
              <NavLink
                onClick={close}
                prefetch="intent"
                to="/account/register"
                className="-m-2 block p-2 font-medium text-gray-900"
              >
                Create an account
              </NavLink>
            </div>
            <div className="flow-root">
              <NavLink
                onClick={close}
                prefetch="intent"
                to="/account/login"
                className="-m-2 block p-2 font-medium text-gray-900"
              >
                Sign in
              </NavLink>
            </div>
          </div>

          {/* Currency selector */}
          <div className="px-4 py-6">
            <form>
              <div className="-ml-2 inline-grid grid-cols-1">
                <select
                  id="mobile-currency"
                  name="currency"
                  aria-label="Currency"
                  className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-0.5 pr-7 pl-2 text-base font-medium text-gray-700 focus:outline-2 sm:text-sm"
                  defaultValue="USD"
                >
                  {['USD', 'CAD', 'AUD', 'EUR', 'GBP'].map((cur) => (
                    <option key={cur}>{cur}</option>
                  ))}
                </select>
                <ChevronDownIcon
                  aria-hidden="true"
                  className="pointer-events-none col-start-1 row-start-1 mr-1 h-5 w-5 self-center justify-self-end fill-gray-500"
                />
              </div>
            </form>
          </div>
        </div>
      )}
      {viewport === 'desktop' &&
        (menu || FALLBACK_HEADER_MENU).items.map((item) => {
          if (!item.url) return null;
          const url =
            item.url.includes('myshopify.com') ||
            item.url.includes(publicStoreDomain) ||
            item.url.includes(primaryDomainUrl)
              ? new URL(item.url).pathname
              : item.url;
          return (
            <NavLink
              end
              key={item.id}
              onClick={close}
              prefetch="intent"
              to={url}
              className="header-menu-item px-3 py-4 text-sm font-medium text-gray-700 hover:text-gray-800"
            >
              {item.title}
            </NavLink>
          );
        })}
    </nav>
  );
}

function HeaderCtas({
  cart,
}: Pick<HeaderProps, 'cart'>) {
  return (
    <div className="flex flex-1 items-center justify-end">
      <SearchToggleMobile />
      <SearchToggleDesktop />
      <div className="ml-4 flow-root lg:ml-8">
        <CartToggle cart={cart} />
      </div>
    </div>
  );
}

function HeaderMenuMobileToggle() {
  const {open} = useAside();
  return (
    <button
      type="button"
      aria-label="Open menu"
      onClick={() => open('mobile')}
      className="-ml-2 rounded-md p-2 text-gray-400 lg:hidden hover:text-gray-500"
    >
      <Bars3Icon aria-hidden="true" className="h-6 w-6" />
    </button>
  );
}

function SearchToggleMobile() {
  const {open} = useAside();
  return (
    <button
      type="button"
      aria-label="Search"
      onClick={() => open('search')}
      className="ml-2 p-2 text-gray-400 hover:text-gray-500 lg:hidden"
    >
      <MagnifyingGlassIcon aria-hidden="true" className="h-6 w-6" />
    </button>
  );
}

function SearchToggleDesktop() {
  const {open} = useAside();
  return (
    <button
      type="button"
      onClick={() => open('search')}
      className="hidden px-1 py-4 lg:block"
      aria-label="Search"
    >
      <MagnifyingGlassIcon className="h-5 w-5 text-gray-700 hover:text-gray-800" aria-hidden="true" />
    </button>
  );
}

function CartBadge({count}: {count: number | null}) {
  const {open} = useAside();
  const {publish, shop, cart, prevCart} = useAnalytics();

  return (
    <a
      href="/cart"
      onClick={(e) => {
        e.preventDefault();
        open('cart');
        publish('cart_viewed', {
          cart,
          prevCart,
          shop,
          url: window.location.href || '',
        } as CartViewPayload);
      }}
    >
      <span className="group -m-2 flex items-center p-2">
        <ShoppingCartIcon aria-hidden="true" className="h-6 w-6 shrink-0 text-gray-400 group-hover:text-gray-500" />
        <span className="ml-2 text-sm font-medium text-gray-700 group-hover:text-gray-800">
          {count === null ? '\u00A0' : count}
        </span>
        <span className="sr-only">items in cart, view bag</span>
      </span>
    </a>
  );
}

function CartToggle({cart}: Pick<HeaderProps, 'cart'>) {
  return (
    <Suspense fallback={<CartBadge count={null} />}>
      <Await resolve={cart}>
        <CartBanner />
      </Await>
    </Suspense>
  );
}

function CartBanner() {
  const originalCart = useAsyncValue() as CartApiQueryFragment | null;
  const cart = useOptimisticCart(originalCart);
  return <CartBadge count={cart?.totalQuantity ?? 0} />;
}

const FALLBACK_HEADER_MENU = {
  id: 'gid://shopify/Menu/199655587896',
  items: [
    {
      id: 'gid://shopify/MenuItem/461609500728',
      resourceId: null,
      tags: [],
      title: 'Collections',
      type: 'HTTP',
      url: '/collections',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609533496',
      resourceId: null,
      tags: [],
      title: 'Blog',
      type: 'HTTP',
      url: '/blogs/journal',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609566264',
      resourceId: null,
      tags: [],
      title: 'Policies',
      type: 'HTTP',
      url: '/policies',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609599032',
      resourceId: 'gid://shopify/Page/92591030328',
      tags: [],
      title: 'About',
      type: 'PAGE',
      url: '/pages/about',
      items: [],
    },
  ],
};
