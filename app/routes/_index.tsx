import {type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {Link, type MetaFunction} from 'react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { byPrefixAndName } from '@awesome.me/kit-725782e741/icons'

export const meta: MetaFunction = () => {
  return [{title: 'Drawscape | Plotter Art'}];
};

export async function loader(args: LoaderFunctionArgs) {
  // No critical data needed for initial render
  return {};
}

export default function Homepage() {
  return (
    <div className="home">
      <Hero />
      <HowMade />
      <Products />
    </div>
  );
}

const incentives = [
  {
    name: 'Personalized',
    icon: byPrefixAndName.fad['sliders'],
    description: "Create a truly unique piece of art by personalizing your design with custom text, colors, and layout.",
  },
  {
    name: 'Plotted, Not Printed',
    icon: byPrefixAndName.fad['pen-nib'],
    description: "Created using real ink pens and a high-precision plotting machine.",
  },
  {
    name: 'Timelapse Video',
    icon: byPrefixAndName.fad['video'],
    description:
      "Every order comes with a timelapse video of your art being drawn.",
  },
]

function HowMade() {
  return (
    <div className="bg-gray-50">
      <div className="mx-auto max-w-7xl py-24 sm:px-2 sm:py-32 lg:px-4">
        <div className="mx-auto max-w-2xl px-4 lg:max-w-none">
          <div className="grid grid-cols-1 items-center gap-x-16 gap-y-10 lg:grid-cols-2">
            <div>
              <h2 className="text-4xl font-bold tracking-tight text-gray-900">
                How it's Made
              </h2>
              <p className="mt-4 text-gray-500">
                Each line is physically drawn by an ink pen and our high-precision plotter. We use Sakura® & Stabilo® pens to draw your custom artwork on 120lb/250gsm stock paper.
              </p>
            </div>
            <div className="aspect-3/2 w-full rounded-lg bg-gray-100 overflow-hidden">
              <video
                className="w-full h-full object-cover"
                style={{ aspectRatio: '3/2', border: 0 }}
                controls
                poster="https://cdn.shopify.com/s/files/1/0905/0138/2438/files/preview_images/bb7a8ed368cc4095afd2619c1c01be60.thumbnail.0000000000_800x800.jpg">
                <source src="https://cdn.shopify.com/videos/c/o/v/bb7a8ed368cc4095afd2619c1c01be60.mp4" type="video/mp4" />
              </video>
            </div>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-3">
            {incentives.map((incentive) => (
              <div key={incentive.name} className="sm:flex lg:block">
                <div className="sm:shrink-0">
                  <FontAwesomeIcon icon={incentive.icon} size="3x" className="" />
                </div>
                <div className="mt-4 sm:mt-0 sm:ml-6 lg:mt-6 lg:ml-0">
                  <h3 className="text-sm font-medium text-gray-900">{incentive.name}</h3>
                  <p className="mt-2 text-sm text-gray-500">{incentive.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function Hero() {
  return (
    <div className="relative overflow-hidden">
      <div className="pt-16 pb-80 sm:pt-24 sm:pb-40 lg:pt-40 lg:pb-48">
        <div className="relative mx-auto max-w-7xl px-4 sm:static sm:px-6 lg:px-8">
          <div className="sm:max-w-lg">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Turn your passion into frame-worthy art
            </h1>
            <p className="mt-4 text-xl text-gray-500">
              Create personalized art, and then watch it drawn (just for you) with a plotting machine.
            </p>
          </div>
          <div>
            <div className="mt-10">
              {/* Decorative image grid */}
              <div
                aria-hidden="true"
                className="pointer-events-none lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2"
              >
                <div className="absolute transform sm:left-16 sm:top-16 lg:left-0 lg:top-1/2 lg:-translate-y-1/2">
                <div className="flex items-center space-x-6 lg:space-x-8">
                  <div className="grid shrink-0 grid-cols-1 gap-y-6 lg:gap-y-8">
                    <div className="h-64 w-44 overflow-hidden rounded-lg">
                      <img
                        alt=""
                        src="https://cdn.shopify.com/s/files/1/0905/0138/2438/files/DSC_0061_1.jpg"
                        className="size-full object-cover"
                      />
                    </div>

                    <div className="h-64 w-44 overflow-hidden rounded-lg">
                      <img
                        alt=""
                        src="https://cdn.shopify.com/s/files/1/0905/0138/2438/files/IMG_8726.jpg"
                        className="size-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="grid shrink-0 grid-cols-1 gap-y-6 lg:gap-y-8">
                    <div className="h-64 w-44 overflow-hidden rounded-lg">
                      <img
                        alt=""
                        src="https://drawscape-projects.s3.us-west-2.amazonaws.com/projects/524/images/IMG_9939.jpeg"
                        className="size-full object-cover"
                      />
                    </div>

                    <div className="h-64 w-44 overflow-hidden rounded-lg sm:opacity-0 lg:opacity-100">
                      <img
                        alt=""
                        src="https://cdn.shopify.com/s/files/1/0905/0138/2438/files/IMG_7238.jpg"
                        className="size-full object-cover"
                      />
                    </div>
  
                    <div className="h-64 w-44 overflow-hidden rounded-lg">
                      <img
                        alt=""
                        src="https://cdn.shopify.com/s/files/1/0905/0138/2438/files/DSC_0021.jpg"
                        className="size-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="grid shrink-0 grid-cols-1 gap-y-6 lg:gap-y-8">
                    <div className="h-64 w-44 overflow-hidden rounded-lg">
                      <img
                        alt=""
                        src="https://drawscape-projects.s3.us-west-2.amazonaws.com/projects/842/images/IMG_6657.jpeg"
                        className="size-full object-cover"
                      />
                    </div>
                    <div className="h-64 w-44 overflow-hidden rounded-lg">
                      <img
                        alt=""
                        src="https://drawscape-projects.s3.us-west-2.amazonaws.com/projects/414/images/DSC_0011.jpeg"
                        className="size-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </div>

            <Link
              to="/shop-all"
              className="inline-block rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-center font-medium text-white hover:bg-indigo-700">
              Shop Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function Products() {
  return (
    <div className="">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="sm:flex sm:items-baseline sm:justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Shop by Product</h2>
          <Link to="/shop-all" prefetch="intent" className="hidden text-sm font-semibold text-indigo-600 hover:text-indigo-500 sm:block">
            Shop all Products
            <span aria-hidden="true"> &rarr;</span>
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:grid-rows-2 sm:gap-x-6 lg:gap-8">
          <div className="group relative aspect-2/1 overflow-hidden rounded-lg sm:row-span-2 sm:aspect-square">
            <img
              src="https://cdn.shopify.com/s/files/1/0905/0138/2438/files/DSC_0079_1.jpg"
              className="absolute size-full object-cover group-hover:opacity-75"
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
            <img
              src="https://cdn.shopify.com/s/files/1/0905/0138/2438/files/DSC_0061_1.jpg"
              className="absolute size-full object-cover group-hover:opacity-75"
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
            <img
              src="https://cdn.shopify.com/s/files/1/0905/0138/2438/files/DSC_0014_1.jpg"
              className="absolute size-full object-cover group-hover:opacity-75"
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

        <div className="mt-6 sm:hidden">
          <Link to="/shop-all" prefetch="intent" className="block text-sm font-semibold text-indigo-600 hover:text-indigo-500">
            Shop all Products
            <span aria-hidden="true"> &rarr;</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
