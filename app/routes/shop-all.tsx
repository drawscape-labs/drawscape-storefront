import { type MetaFunction, Link } from 'react-router';
import { Image } from '@shopify/hydrogen-react';

export const meta: MetaFunction = () => {
  return [{ title: 'Shop All' }];
};

const products = [
  {
    id: 1,
    name: 'Aircraft',
    category: 'Blueprints',
    href: '/products/aircraft',
    imageSrc: 'https://cdn.shopify.com/s/files/1/0905/0138/2438/files/DSC_0079_1.jpg',
    imageAlt: 'Aircraft blueprint artwork collection',
  },
  {
    id: 2,
    name: 'Airport Diagrams',
    category: 'Blueprints',
    href: '/products/airports',
    imageSrc: 'https://cdn.shopify.com/s/files/1/0905/0138/2438/files/DSC_0061_1.jpg',
    imageAlt: 'Airport diagram blueprint artwork',
  },
  {
    id: 3,
    name: 'Sailboats',
    category: 'Blueprints',
    href: '/products/sailboats',
    imageSrc: 'https://cdn.shopify.com/s/files/1/0905/0138/2438/files/DSC_0014_1.jpg',
    imageAlt: 'Sailboat blueprint artwork',
  },
  {
    id: 4,
    name: 'Cars',
    category: 'Blueprints',
    href: '/products/cars',
    imageSrc: 'https://cdn.shopify.com/s/files/1/0905/0138/2438/files/IMG_0085.jpg',
    imageAlt: 'Car blueprint artwork collection',
  },
  {
    id: 5,
    name: 'Engines',
    category: 'Blueprints',
    href: '/products/engines',
    imageSrc: 'https://cdn.shopify.com/s/files/1/0905/0138/2438/files/IMG_0425_1.jpg',
    imageAlt: 'Engine blueprint artwork collection',
  },
];

export default function ShopAllPage() {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        <div className="flex items-center justify-between space-x-4">
          <h2 className="text-lg font-medium text-gray-900">Shop by Product</h2>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-8 sm:gap-y-10 lg:grid-cols-4">
          {products.map((product) => (
            <div key={product.id} className="group relative">
              <div className="relative">
                <Image
                  alt={product.imageAlt}
                  src={product.imageSrc}
                  className="aspect-square w-full rounded-lg bg-gray-100 object-cover"
                  sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
                  width={400}
                  height={400}
                  loading="lazy"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 flex items-end p-4 opacity-0 group-hover:opacity-100"
                >
                  <div className="w-full rounded-md bg-white/75 px-4 py-2 text-center text-sm font-medium text-gray-900 backdrop-blur-sm backdrop-filter">
                    View Products
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between space-x-8 text-base font-medium text-gray-900">
                <h3>
                  <Link to={product.href} prefetch="intent">
                    <span aria-hidden="true" className="absolute inset-0" />
                    {product.name}
                  </Link>
                </h3>
              </div>
              <p className="mt-1 text-sm text-gray-500">{product.category}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

