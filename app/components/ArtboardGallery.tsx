import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import { ArtboardRender } from './ArtboardRender';

export default function ArtboardGallery() {
  return (
    <div className="w-full rounded-lg bg-gray-300 p-4 sm:p-6">
      <TabGroup>
        <div className="flex flex-col gap-4 lg:flex-row">
          {/* Thumbnail tabs - now on the left */}
          <div className="order-1 lg:order-none lg:mr-6">
            <TabList
              className="flex max-w-full gap-3 overflow-x-auto rounded-md p-2 lg:flex-col lg:overflow-visible lg:bg-transparent lg:p-0"
            >
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
                title="Select Video"
              >
                <div className="h-full w-full flex items-center justify-center bg-black rounded">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <polygon points="9.5,7.5 16.5,12 9.5,16.5" fill="white" />
                  </svg>
                </div>
              </Tab>
              <Tab
                className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md ring-2 ring-transparent transition data-selected:ring-white data-focus-visible:ring-blue-500 lg:h-16 lg:w-16"
                title="Artboard Render"
              >
                <div className="h-full w-full flex items-center justify-center bg-blue-900 rounded">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <rect x="4" y="4" width="16" height="16" rx="2" fill="white" stroke="none" />
                    <rect x="7" y="7" width="10" height="10" rx="1" fill="#1e293b" stroke="none" />
                  </svg>
                </div>
              </Tab>
            </TabList>
          </div>

          {/* Preview area */}
          <div className="relative order-2 lg:order-none flex-1">
            <div className="flex h-[55vh] items-center justify-center rounded-md sm:h-[60vh] lg:h-[70vh]">
              <TabPanels className="h-full w-full">
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
                <TabPanel className="h-full w-full" unmount={false}>
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
                    <ArtboardRender />
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
