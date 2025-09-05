import React from 'react';

import {
    Tab,
    TabGroup,
    TabList,
    TabPanel,
    TabPanels,
  } from '@headlessui/react'

type ArtboardPreviewProps = {
  // Define your props here as needed
};

export function ArtboardPreview(props: ArtboardPreviewProps) {
  return (
    <div>
            {/* Image gallery */}
            <TabGroup className="flex flex-col-reverse">
              {/* Image selector */}
              <div className="mx-auto mt-6 hidden w-full max-w-2xl sm:block lg:max-w-none">
                <TabList className="grid grid-cols-4 gap-6">                
                    <Tab key="1"
                      className="group relative flex h-24 cursor-pointer items-center justify-center rounded-md bg-white text-sm font-medium text-gray-900 uppercase hover:bg-gray-50 focus:ring-3 focus:ring-indigo-500/50 focus:ring-offset-4 focus:outline-hidden">
                    </Tab>
                </TabList>
              </div>

              <TabPanels>
                  <TabPanel>
                    asdf
                  </TabPanel>
              </TabPanels>
            </TabGroup>

    </div>
  );
}
