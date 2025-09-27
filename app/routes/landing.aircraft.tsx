import {type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {Link, type MetaFunction} from 'react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { byPrefixAndName } from '@awesome.me/kit-725782e741/icons'
import { Image, Video } from '@shopify/hydrogen';
import { ProductReviews } from '~/components/ProductReviews';

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


function Hero() {
  return (
    <div className="relative overflow-hidden">
      <div className="pt-16 pb-80 sm:pt-24 sm:pb-40 lg:pt-40 lg:pb-48">
        <div className="relative mx-auto max-w-7xl px-4 sm:static sm:px-6 lg:px-8">
          <div className="sm:max-w-lg">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Turn any Aircraft into frame-worthy art
            </h1>
            <p className="mt-4 text-xl text-gray-500">
              Create custom aircraft art, and then watch it drawn with a plotting machine.
            </p>
            <div className="mt-3 sm:mt-6">
              <ProductReviews />
            </div>
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
                      <Image
                        src="https://cdn.shopify.com/s/files/1/0905/0138/2438/files/DSC_0079_1.jpg?v=1747329767"
                        className="size-full object-cover"
                        sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
                        width={176}
                        height={256}
                        loading="lazy"
                      />
                    </div>

                    <div className="h-64 w-44 overflow-hidden rounded-lg">
                      <Image
                        src="https://cdn.shopify.com/s/files/1/0905/0138/2438/files/DSC_0021.jpg?v=1743016750"
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
                        src="https://cdn.shopify.com/s/files/1/0905/0138/2438/files/IMG_9916.png?v=1758994931"
                        className="size-full object-cover"
                        sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
                        width={176}
                        height={256}
                        loading="lazy"
                      />
                    </div>

                    <div className="h-64 w-44 overflow-hidden rounded-lg">
                      <Image
                        src="https://cdn.shopify.com/s/files/1/0905/0138/2438/files/IMG_6657.jpg?v=1758995182"
                        className="size-full object-cover"
                        sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
                        width={176}
                        height={256}
                        loading="lazy"
                      />
                    </div>
  
                    <div className="h-64 w-44 overflow-hidden rounded-lg">
                      <Image
                        alt="Holding a framed aircraft  artwork"
                        src="https://cdn.shopify.com/s/files/1/0905/0138/2438/files/IMG_8716_1.jpg"
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
                        src="https://cdn.shopify.com/s/files/1/0905/0138/2438/files/DSC_0004.jpg?v=1758995259"
                        className="size-full object-cover"
                        sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
                        width={176}
                        height={256}
                        loading="lazy"
                      />
                    </div>
                    <div className="h-64 w-44 overflow-hidden rounded-lg">
                      <Image
                        src="https://cdn.shopify.com/s/files/1/0905/0138/2438/files/DSC_0007_2.jpg?v=1747332563"
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
              to="/products/aircraft"
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
    <div className="bg-gray-50">
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
              <Video
                data={{
                  id: '35d38740ff1043cc9b9af765bdcff65e',
                  sources: [
                    {
                      url: 'https://cdn.shopify.com/videos/c/o/v/bb7a8ed368cc4095afd2619c1c01be60.mp4',
                      mimeType: 'video/mp4',
                      height: 800,
                      width: 1200,
                    }
                  ],
                  previewImage: {
                    url: 'https://cdn.shopify.com/s/files/1/0905/0138/2438/files/preview_images/bb7a8ed368cc4095afd2619c1c01be60.thumbnail.0000000000_800x800.jpg',
                    altText: 'Plotting machine drawing aircraft art timelapse video preview'
                  }
                }}
                className="w-full h-full object-cover"
                controls
                playsInline
              />
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


function Products() {
  return (
    <div className="relative bg-gray-800 px-6 py-32 sm:px-12 sm:py-40 lg:px-16">
      <div className="absolute inset-0 overflow-hidden">
        <Image
          alt="Aircraft blueprint art full-width background"
          src="https://cdn.shopify.com/s/files/1/0905/0138/2438/files/DSC_0004.jpg?v=1758995259"
          className="size-full object-cover"
        />
      </div>
      <div aria-hidden="true" className="absolute inset-0 bg-gray-900/60" />
      <div className="relative mx-auto flex max-w-3xl flex-col items-center text-center">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Perfect Gift For Pilots!</h2>
        <p className="mt-3 text-xl text-white">
          Give the pilot or aviation enthusiast in your life a truly one-of-a-kind gift.
        </p>
        <Link
          to="/products/aircraft"
          className="mt-8 block w-full rounded-md border border-transparent bg-white px-8 py-3 text-base font-medium text-gray-900 hover:bg-gray-100 sm:w-auto"
        >
          Shop Now
        </Link>
      </div>
    </div>
  )
}
