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

  // tempararily hardcode for development
  menu = {
    "id": "gid://shopify/Menu/284328165670",
    "items": [
        {
            "id": "gid://shopify/MenuItem/687200108838",
            "resourceId": null,
            "tags": [],
            "title": "Home",
            "type": "FRONTPAGE",
            "url": "/",
            "items": []
        },
        {
            "id": "gid://shopify/MenuItem/687200141606",
            "resourceId": "gid://shopify/Page/151583064358",
            "tags": [],
            "title": "Shop",
            "type": "PAGE",
            "url": "/shop-all",
            "items": []
        },
        {
            "id": "gid://shopify/MenuItem/717103038752",
            "tags": [],
            "title": "Gallery",
            "type": "PAGE",
            "url": "/gallery",
            "items": []
        },
        {
            "id": "gid://shopify/MenuItem/717103038758",
            "resourceId": "gid://shopify/Page/149251293478",
            "tags": [],
            "title": "Reviews",
            "type": "PAGE",
            "url": "/reviews",
            "items": []
        },
        {
            "id": "gid://shopify/MenuItem/687200174374",
            "resourceId": "gid://shopify/Page/141668942118",
            "tags": [],
            "title": "Contact",
            "type": "PAGE",
            "url": "/contact",
            "items": []
        }
    ]
  };

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
      <div className="ml-2 flow-root lg:ml-0">
        <SearchToggle />
      </div>
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

// SearchToggle matches CartToggle/CartBadge for style and functionality
function SearchToggle() {
  const {open} = useAside();
  const {publish, shop} = useAnalytics();

  // For accessibility, we use a link and span structure like CartBadge
  return (
    <a
      href="/search"
      onClick={e => {
        e.preventDefault();
        open('search');
      }}
    >
      <span className="group -m-2 flex items-center p-2">
        <MagnifyingGlassIcon
          aria-hidden="true"
          className="h-6 w-6 shrink-0 text-gray-400 group-hover:text-gray-500"
        />
        {/* No badge/number for search, but keep spacing for visual consistency */}
        <span className="ml-2 text-sm font-medium text-gray-700 group-hover:text-gray-800">
          {/* visually hidden label for accessibility */}
          <span className="sr-only">Search</span>
        </span>
      </span>
    </a>
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
