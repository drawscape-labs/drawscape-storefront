import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import { ArtboardRender } from './ArtboardRender';
import { useArtboards } from '~/context/artboards';

import { EyeIcon, PlayCircleIcon } from '@heroicons/react/24/outline';

export default function ArtboardGallery() {
  const { colorScheme } = useArtboards();
  
  // Color mapping for eye icon based on paper color
  const getEyeIconColor = (paperColor: string) => {
    const colorMap: Record<string, string> = {
      navy: '#ffffff', // white on navy
      white: '#000000', // black on white
      blue: '#ffffff', // white on blue
      red: '#ffffff', // white on red
      black: '#ffffff', // white on black
      tan: '#000000', // black on tan
    };
    
    return colorMap[paperColor] || '#ffffff'; // default to white
  };

  const eyeIconColor = colorScheme 
    ? getEyeIconColor(colorScheme.paper_color)
    : '#ffffff';

  // Set a consistent icon size for both EyeIcon and PlayCircleIcon
  const iconSizeClass = "h-8 w-8";

  return (
    <div className="w-screen -mx-4 rounded-none sm:mx-0 sm:w-full sm:rounded-lg bg-gray-200 p-4 sm:p-6">
      <TabGroup>
        <div className="flex flex-col gap-4 lg:flex-row">
          {/* Thumbnail tabs - on the left on desktop, bottom on mobile */}
          <div className="order-2 lg:order-none lg:mr-6">
            <TabList
              className="flex max-w-full gap-3 overflow-x-auto rounded-md p-2 lg:flex-col lg:overflow-visible lg:bg-transparent lg:p-0"
            >
              
              {/* Artboard Render */}
              <Tab
                className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md ring-2 ring-transparent transition data-selected:ring-white data-focus-visible:ring-blue-500 lg:h-16 lg:w-16 bg-gray-800 flex items-center justify-center"
                title="Artboard Render"
              >
                <div className="relative flex h-full w-full items-center justify-center">
                  <EyeIcon
                    className={`absolute inset-0 m-auto z-10 pointer-events-none ${iconSizeClass}`}
                    style={{ color: eyeIconColor }}
                    aria-hidden="true"
                  />
                  <ArtboardRender />
                </div>
              </Tab>
              
              {/* Video */}
              <Tab
                className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md ring-2 ring-transparent transition data-selected:ring-white data-focus-visible:ring-blue-500 lg:h-16 lg:w-16"
                title="Select Video"
              >
                <div className="h-full w-full flex items-center justify-center bg-gray-800 rounded">
                  <PlayCircleIcon
                    className={`${iconSizeClass} text-white`}
                    aria-hidden="true"
                  />
                </div>
              </Tab>

              <Tab
                className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md ring-2 ring-transparent transition data-selected:ring-white data-focus-visible:ring-blue-500 lg:h-16 lg:w-16"
                title="Select 1"
              >
                <img src="https://picsum.photos/id/1015/200/200" alt="" className="h-full w-full object-cover" />
              </Tab>
              <Tab
                className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md ring-2 ring-transparent transition data-selected:ring-white data-focus-visible:ring-blue-500 lg:h-16 lg:w-16"
                title="Select 2"
              >
                <img src="https://picsum.photos/id/1025/200/200" alt="" className="h-full w-full object-cover" />
              </Tab>
              <Tab
                className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md ring-2 ring-transparent transition data-selected:ring-white data-focus-visible:ring-blue-500 lg:h-16 lg:w-16"
                title="Select 2"
              >
                <img src="https://picsum.photos/id/1025/200/200" alt="" className="h-full w-full object-cover" />
              </Tab>
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

                {/* Video */}
                <TabPanel className="h-full w-full" >
                  <div className="flex h-full w-full items-center justify-center">
                    <video
                      controls
                      className="max-h-full w-auto object-contain bg-black rounded">
                      <source src="https://cdn.shopify.com/videos/c/o/v/bb7a8ed368cc4095afd2619c1c01be60.mp4" type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </TabPanel>


                <TabPanel className="h-full w-full" unmount={false}>
                  <div className="flex h-full w-full items-center justify-center">
                    <img
                      src="https://picsum.photos/id/1015/800/1100"
                      alt="Preview 1"
                      className="max-h-full w-auto object-contain"
                    />
                  </div>
                </TabPanel>

                <TabPanel className="h-full w-full" unmount={false}>
                  <div className="flex h-full w-full items-center justify-center">
                    <img
                      src="https://picsum.photos/id/1025/800/1100"
                      alt="Preview 2"
                      className="max-h-full w-auto object-contain"
                    />
                  </div>
                </TabPanel>

              </TabPanels>
            </div>
          </div>
        </div>
      </TabGroup>
    </div>
  );
}
