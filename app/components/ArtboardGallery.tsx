import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import { ArtboardRender } from './ArtboardRender';
import { useArtboards } from '~/context/artboards';
import { EyeIcon, PlayCircleIcon } from '@heroicons/react/24/outline';

// Types kept intentionally simple for readability
export type ProductImage = {
  id: string;
  url: string;
  altText: string | null;
  width: number;
  height: number;
};

export type ProductVideo = {
  id: string;
  sources: Array<{ url: string; mimeType: string }>;
  previewImage?: { url?: string; width?: number; height?: number; altText?: string };
};

export type ProductMedia = {
  edges?: Array<{ node: any }>;
};

export type VariantImage = {
  id?: string | null;
  url?: string;
  altText?: string | null;
  width?: number | null;
  height?: number | null;
} | null;

const ICON_SIZE_CLASS = 'h-8 w-8';
const TAB_BASE_CLASS =
  'relative h-14 w-14 shrink-0 overflow-hidden rounded-md ring-2 ring-white transition data-[selected]:ring-2 data-[selected]:ring-indigo-500 data-[focus-visible]:ring-4 data-[focus-visible]:ring-indigo-400 lg:h-16 lg:w-16 flex items-center justify-center';
const TAB_ARTBOARD_CLASS = `${TAB_BASE_CLASS} bg-gray-800`;

function getEyeIconColor(paperColor?: string): string {
  const colorMap: Record<string, string> = {
    navy: '#ffffff',
    white: '#000000',
    blue: '#ffffff',
    red: '#ffffff',
    black: '#ffffff',
    tan: '#000000',
  };
  return (paperColor && colorMap[paperColor]) || '#ffffff';
}

function collectImages(allMedia: any[], variantImage?: VariantImage): ProductImage[] {
  const images: ProductImage[] = allMedia
    .filter((m: any) => m?.image)
    .map((m: any) => ({
      id: m.image.id,
      url: m.image.url,
      altText: m.image.altText ?? null,
      width: m.image.width ?? 0,
      height: m.image.height ?? 0,
    }));

  if (images.length === 0 && variantImage?.url) {
    return [
      {
        id: variantImage.id ?? '',
        url: variantImage.url,
        altText: variantImage.altText ?? null,
        width: variantImage.width ?? 0,
        height: variantImage.height ?? 0,
      },
    ];
  }

  return images;
}

function collectVideos(allMedia: any[]): ProductVideo[] {
  return allMedia
    .filter((m: any) => Array.isArray(m?.sources))
    .map((m: any) => ({
      id: m.id,
      sources: m.sources,
      previewImage: m.previewImage,
    }));
}

function getImageAlt(img: ProductImage, index: number): string {
  const text = img.altText?.trim();
  return text && text.length > 0 ? text : `Product image ${index + 1}`;
}

function getVideoPreviewAlt(video: ProductVideo, index: number): string {
  const text = video.previewImage?.altText?.trim();
  return text && text.length > 0 ? text : `Video preview ${index + 1}`;
}

export default function ArtboardGallery({
  productMedia,
  variantImage,
  limit = 3,
}: {
  productMedia?: ProductMedia;
  variantImage?: VariantImage;
  limit?: number;
}) {
  const { colorScheme } = useArtboards();
  const allMedia = productMedia?.edges?.map((e) => e.node) || [];

  const images = collectImages(allMedia, variantImage);
  const videos = collectVideos(allMedia);
  
  // Calculate how many additional tabs we can show (limit - 1 for the artboard render tab)
  const maxAdditionalTabs = Math.max(0, limit - 1);
  
  // Distribute the limit between videos and images
  // Videos get priority, then images fill the remaining slots
  const maxVideos = Math.min(videos.length, maxAdditionalTabs);
  const maxImages = Math.min(images.length, maxAdditionalTabs - maxVideos);
  
  const limitedVideos = videos.slice(0, maxVideos);
  const limitedImages = images.slice(0, maxImages);
  
  const hasImages = limitedImages.length > 0;
  const hasVideos = limitedVideos.length > 0;
  const eyeIconColor = getEyeIconColor(colorScheme?.paper_color);

  return (
    <div className="w-screen -mx-4 rounded-none sm:mx-0 sm:w-full sm:rounded-lg bg-gray-200 p-4 sm:p-6">
      <TabGroup>
        <div className="flex flex-col gap-4 lg:flex-row">
          {/* Thumbnails: left on desktop, bottom on mobile */}
          <div className="order-2 lg:order-none lg:mr-6">
            <TabList className="flex max-w-full gap-3 overflow-x-auto rounded-md p-2 lg:flex-col lg:overflow-visible lg:bg-transparent lg:p-0">
              {/* Artboard Render */}
              <Tab className={TAB_ARTBOARD_CLASS} title="Artboard Render">
                <div className="relative flex h-full w-full items-center justify-center">
                  <EyeIcon
                    className={`absolute inset-0 m-auto z-10 pointer-events-none ${ICON_SIZE_CLASS}`}
                    style={{ color: eyeIconColor }}
                    aria-hidden="true"
                  />
                  <ArtboardRender />
                </div>
              </Tab>

              {/* Product Videos */}
              {hasVideos &&
                limitedVideos.map((video, idx) => (
                  <Tab key={video.id || idx} className={TAB_BASE_CLASS} title={`Select video ${idx + 1}`}>
                    <div className="relative h-full w-full flex items-center justify-center bg-gray-800 rounded">
                      {video.previewImage?.url ? (
                        <>
                          <img
                            src={video.previewImage.url}
                            alt={getVideoPreviewAlt(video, idx)}
                            className="h-full w-full object-cover"
                            width={video.previewImage.width}
                            height={video.previewImage.height}
                            loading="lazy"
                          />
                          <PlayCircleIcon
                            className={`absolute text-white inset-0 m-auto z-10 pointer-events-none ${ICON_SIZE_CLASS}`}
                            aria-hidden="true"
                          />
                        </>
                      ) : (
                        <PlayCircleIcon className={`${ICON_SIZE_CLASS} text-white`} aria-hidden="true" />
                      )}
                    </div>
                  </Tab>
                ))}

              {/* Product Images */}
              {hasImages &&
                limitedImages.map((img, idx) => (
                  <Tab key={img.id || idx} className={TAB_BASE_CLASS} title={`Select image ${idx + 1}`}>
                    <img
                      src={img.url}
                      alt={getImageAlt(img, idx)}
                      className="h-full w-full object-cover"
                      width={img.width}
                      height={img.height}
                      loading="lazy"
                    />
                  </Tab>
                ))}
            </TabList>
          </div>

          {/* Preview area */}
          <div className="relative order-1 lg:order-none flex-1">
            <div className="flex h-[55vh] items-center justify-center rounded-md sm:h-[60vh] lg:h-[70vh]">
              <TabPanels className="h-full w-full">
                {/* Artboard Render */}
                <TabPanel className="h-full w-full" unmount={false}>
                  <div className="flex h-full w-full items-center justify-center">
                    <ArtboardRender />
                  </div>
                </TabPanel>

                {/* Product Videos */}
                {hasVideos &&
                  limitedVideos.map((video, idx) => (
                    <TabPanel className="h-full w-full" key={video.id || idx}>
                      <div className="flex h-full w-full items-center justify-center">
                        <video controls poster={video.previewImage?.url} className="max-h-full w-auto object-contain bg-black rounded">
                          <source src={video.sources[0].url} type={video.sources[0].mimeType} />
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    </TabPanel>
                  ))}

                {/* Product Images */}
                {hasImages &&
                  limitedImages.map((img, idx) => (
                    <TabPanel className="h-full w-full" unmount={false} key={img.id || idx}>
                      <div className="flex h-full w-full items-center justify-center">
                        <img
                          src={img.url}
                          alt={getImageAlt(img, idx)}
                          className="max-h-full w-auto object-contain"
                          width={img.width}
                          height={img.height}
                          loading="lazy"
                        />
                      </div>
                    </TabPanel>
                  ))}
              </TabPanels>
            </div>
          </div>
        </div>
      </TabGroup>
    </div>
  );
}
