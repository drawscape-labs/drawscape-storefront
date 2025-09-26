import { type MetaFunction, Link } from 'react-router';
import { Image } from '@shopify/hydrogen-react';

export const meta: MetaFunction = () => {
  return [{ title: 'Shop All' }];
};

export default function ShopAllPage() {
  return (
    <div className="">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="sm:flex sm:items-baseline sm:justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Shop by Product</h2>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:grid-rows-2 sm:gap-x-6 lg:gap-8">
          <div className="group relative aspect-2/1 overflow-hidden rounded-lg sm:row-span-2 sm:aspect-square">
            <Image
              src="https://cdn.shopify.com/s/files/1/0905/0138/2438/files/DSC_0079_1.jpg"
              alt="Aircraft blueprint artwork collection"
              className="absolute size-full object-cover group-hover:opacity-75"
              sizes="(min-width: 1024px) 50vw, (min-width: 768px) 100vw, 100vw"
              width={400}
              height={400}
              loading="lazy"
            />
            <div aria-hidden="true" className="absolute inset-0 bg-linear-to-b from-transparent to-black opacity-50" />
            <div className="absolute inset-0 flex items-end p-6">
              <div>
                <h3 className="font-semibold text-white">
                  <Link to="/products/aircraft" prefetch="intent">
                    <span className="absolute inset-0" />
                    Aircraft
                  </Link>
                </h3>
                <p aria-hidden="true" className="mt-1 text-sm text-white">
                  Shop now
                </p>
              </div>
            </div>
          </div>
          <div className="group relative aspect-2/1 overflow-hidden rounded-lg sm:aspect-auto">
            <Image
              src="https://cdn.shopify.com/s/files/1/0905/0138/2438/files/DSC_0061_1.jpg"
              alt="Airport diagram blueprint artwork"
              className="absolute size-full object-cover group-hover:opacity-75"
              sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
              width={400}
              height={200}
              loading="lazy"
            />
            <div aria-hidden="true" className="absolute inset-0 bg-linear-to-b from-transparent to-black opacity-50" />
            <div className="absolute inset-0 flex items-end p-6">
              <div>
                <h3 className="font-semibold text-white">
                  <Link to="/products/airports" prefetch="intent">
                    <span className="absolute inset-0" />
                    Airports
                  </Link>
                </h3>
                <p aria-hidden="true" className="mt-1 text-sm text-white">
                  Shop now
                </p>
              </div>
            </div>
          </div>
          <div className="group relative aspect-2/1 overflow-hidden rounded-lg sm:aspect-auto">
            <Image
              src="https://cdn.shopify.com/s/files/1/0905/0138/2438/files/DSC_0014_1.jpg"
              alt="Sailboat blueprint artwork"
              className="absolute size-full object-cover group-hover:opacity-75"
              sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
              width={400}
              height={200}
              loading="lazy"
            />
            <div aria-hidden="true" className="absolute inset-0 bg-linear-to-b from-transparent to-black opacity-50" />
            <div className="absolute inset-0 flex items-end p-6">
              <div>
                <h3 className="font-semibold text-white">
                  <Link to="/products/sailboats" prefetch="intent">
                    <span className="absolute inset-0" />
                    Sailboats
                  </Link>
                </h3>
                <p aria-hidden="true" className="mt-1 text-sm text-white">
                  Shop now
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

