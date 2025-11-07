import {type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {Link, type MetaFunction} from 'react-router';
import { Image } from '@shopify/hydrogen';
import { FancyIcon } from '~/components/FancyIcons';

export const meta: MetaFunction = () => {
  return [{title: 'Drawscape | Plotter Art'}];
};


export async function loader(args: LoaderFunctionArgs) {
  return {};
}

export default function Homepage() {
  return (
    <div className="home">
      <Hero />
      <Products />
      <HowMade />
    </div>
  );
}

const incentives: Array<{
  name: string;
  icon: 'sliders' | 'pen-nib' | 'video';
  description: string;
}> = [
  {
    name: 'Personalized',
    icon: 'sliders',
    description: "Create a truly unique piece of art by personalizing your design with custom text, colors, and layout.",
  },
  {
    name: 'Plotted, Not Printed',
    icon: 'pen-nib',
    description: "Created using real ink pens and a high-precision plotting machine.",
  },
  {
    name: 'Timelapse Video',
    icon: 'video',
    description:
      "Every order comes with a timelapse video of your art being drawn.",
  },
]


function Hero() {
  return (
    <div className="relative overflow-hidden">
      <div className="pt-16 pb-80 sm:pt-24 sm:pb-40 lg:pt-40 lg:pb-48">
        <div className="relative mx-auto max-w-7xl px-4 sm:static sm:px-6 lg:px-8">
          <div className="sm:max-w-lg">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Personalized Plotter Art, Drawn by Robots 🤖
            </h1>
            <p className="mt-4 text-xl text-gray-500">
            One-of-a-Kind Gift for Enthusiasts & Adventures
            </p>
          </div>
          <div>
            <div className="mt-10">
              {/* Decorative image grid */}
              <div
                aria-hidden="true"
                className="pointer-events-none lg:absolute lg:inset-y-0 lg:mx-auto lg:w-full lg:max-w-7xl"
              >
                <div className="absolute transform sm:top-0 sm:left-1/2 sm:translate-x-8 lg:top-1/2 lg:left-1/2 lg:translate-x-8 lg:-translate-y-1/2">
                <div className="flex items-center space-x-6 lg:space-x-8">
                  <div className="grid shrink-0 grid-cols-1 gap-y-6 lg:gap-y-8">
                    <div className="h-64 w-44 overflow-hidden rounded-lg sm:opacity-0 lg:opacity-100">
                      {/* Airports Blue */}
                      <Image
                        src="https://cdn.shopify.com/s/files/1/0905/0138/2438/files/DSC_0061_1.jpg"
                        alt="Airport diagram blueprint art being drawn by plotting machine"
                        className="size-full object-cover"
                        sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
                        width={176}
                        height={256}
                        loading="lazy"
                      />
                    </div>

                    <div className="h-64 w-44 overflow-hidden rounded-lg">
                      <Image
                        src="https://cdn.shopify.com/s/files/1/0905/0138/2438/files/IMG_8726.jpg"
                        alt="Couple holding framed blueprint artwork"
                        className="size-full object-cover"
                        sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
                        width={176}
                        height={256}
                        loading="lazy"
                      />
                    </div>
                  </div>
                  <div className="grid shrink-0 grid-cols-1 gap-y-6 lg:gap-y-8">
                    <div className="h-64 w-44 overflow-hidden rounded-lg">
                      <Image
                        alt="Airbus A320 airplane blueprint being drawn by plotting machine"
                        src="https://drawscape-projects.s3.us-west-2.amazonaws.com/projects/524/images/IMG_9939.jpeg"
                        className="size-full object-cover"
                        sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
                        width={176}
                        height={256}
                        loading="lazy"
                      />
                    </div>

                    <div className="h-64 w-44 overflow-hidden rounded-lg">
                      <Image
                        alt="Framed sailboat blueprint artwork on display"
                        src="https://cdn.shopify.com/s/files/1/0905/0138/2438/files/IMG_7238.jpg"
                        className="size-full object-cover"
                        sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
                        width={176}
                        height={256}
                        loading="lazy"
                      />
                    </div>
  
                    <div className="h-64 w-44 overflow-hidden rounded-lg">
                      <Image
                        alt="White pen on airplane blueprint artwork"
                        src="https://cdn.shopify.com/s/files/1/0905/0138/2438/files/DSC_0021.jpg"
                        className="size-full object-cover"
                        sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
                        width={176}
                        height={256}
                        loading="lazy"
                      />
                    </div>
                  </div>
                  <div className="grid shrink-0 grid-cols-1 gap-y-6 lg:gap-y-8">
                    <div className="h-64 w-44 overflow-hidden rounded-lg">
                      <Image
                        alt="KOBELCO hydraulic crawler crane blueprint being drawn by plotting machine"
                        src="https://drawscape-projects.s3.us-west-2.amazonaws.com/projects/842/images/IMG_6657.jpeg"
                        className="size-full object-cover"
                        sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
                        width={176}
                        height={256}
                        loading="lazy"
                      />
                    </div>
                    <div className="h-64 w-44 overflow-hidden rounded-lg">
                      <Image
                        alt="Red airplane blueprint artwork with detailed fuselage"
                        src="https://drawscape-projects.s3.us-west-2.amazonaws.com/projects/414/images/DSC_0011.jpeg"
                        className="size-full object-cover"
                        sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
                        width={176}
                        height={256}
                        loading="lazy"
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

function HowMade() {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl py-24 sm:px-2 sm:py-32 lg:px-4">
        <div className="mx-auto max-w-2xl px-4 lg:max-w-none">
          <div className="grid grid-cols-1 items-center gap-x-16 gap-y-10 lg:grid-cols-2">
            <div>
              <h2 className="text-4xl font-bold tracking-tight text-gray-900">
                How it's Made
              </h2>
              <p className="mt-4 text-gray-500">
                We create each art piece with ink pens and a high-precision plotter. Each line is drawn with Sakura® / Stabilo® pens on 120lb/250gsm stock paper.
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
                  <FancyIcon name={incentive.icon} width={48} height={48} className="text-indigo-600" />
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
];

function Products() {
  return (
    <div className="bg-gray-50">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        <div className="flex items-center justify-between space-x-4">
          <h2 className="text-lg font-medium text-gray-900">Shop by Product</h2>
          <Link to="/shop-all" prefetch="intent" className="text-sm font-medium whitespace-nowrap text-indigo-600 hover:text-indigo-500">
            View all
            <span aria-hidden="true"> &rarr;</span>
          </Link>
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
  )
}
