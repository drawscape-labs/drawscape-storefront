import { type MetaFunction } from 'react-router';
import { Image } from '@shopify/hydrogen-react';

export const meta: MetaFunction = () => {
  return [{ title: 'Shop All' }];
};

export default function ShopAllPage() {
  return (
    <div className="shop-all">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">Shop All</h1>
        <p className="mt-4 text-gray-600">Browse featured categories below.</p>
        <section className="mt-10">
          <h2 id="products-heading" className="sr-only">
            Products
          </h2>

          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
            {products.map((product) => (
              <a key={product.id} href={product.href} className="group">
                <Image
                  data={{
                    url: product.imageSrc,
                    altText: product.imageAlt,
                  }}
                  aspectRatio="1/1"
                  className="aspect-square w-full overflow-hidden rounded-lg object-cover group-hover:opacity-75 sm:aspect-2/3"
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  loading="lazy"
                />
                <div className="mt-4 flex items-center justify-between text-base font-medium text-gray-900">
                  <h3>{product.name}</h3>
                  <p>{product.price}</p>
                </div>
                <p className="mt-1 text-sm text-gray-500 italic">{product.description}</p>
              </a>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

const products = [
  {
    id: 1,
    name: 'Aircraft',
    href: '/products/aircraft',
    price: '$99',
    description: 'Commercial, General Aviation, and Military',
    imageSrc:
      'https://cdn.shopify.com/s/files/1/0905/0138/2438/files/DSC_0079_1.jpg',
    imageAlt: 'Aircraft artwork collage.',
  },
  {
    id: 2,
    name: 'Airports',
    href: '/products/airports',
    price: '$99',
    description: 'FAA Diagrams and Aero Charts',
    imageSrc:
      'https://cdn.shopify.com/s/files/1/0905/0138/2438/files/DSC_0061_1.jpg',
    imageAlt: 'Airport themed artwork on a shelf.',
  },
  {
    id: 3,
    name: 'Sailboats',
    href: '/products/sailboats',
    price: '$99',
    description: 'Browse sailboat artwork',
    imageSrc: 'https://cdn.shopify.com/s/files/1/0905/0138/2438/files/DSC_0014_1.jpg',
    imageAlt: 'Sailboat themed artwork and accessories.',
  },
];
