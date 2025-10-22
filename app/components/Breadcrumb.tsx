import {ChevronRightIcon, HomeIcon} from '@heroicons/react/20/solid';
import {Link} from 'react-router';

export interface BreadcrumbItem {
  name: string;
  href: string;
  current?: boolean;
}

export interface BreadcrumbProps {
  pages: BreadcrumbItem[];
  homeHref?: string;
}

export default function Breadcrumb({pages, homeHref = '/'}: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex">
      <ol role="list" className="flex items-center space-x-4">
        <li className="shrink-0">
          <div>
            <Link
              to={homeHref}
              className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-300"
            >
              <HomeIcon aria-hidden="true" className="size-5 shrink-0" />
              <span className="sr-only">Home</span>
            </Link>
          </div>
        </li>
        {pages.map((page, index) => {
          const isLast = index === pages.length - 1;
          return (
            <li key={page.name} className={isLast ? 'min-w-0 flex-1' : 'shrink-0'}>
              <div className="flex items-center min-w-0">
                <ChevronRightIcon
                  aria-hidden="true"
                  className="size-5 shrink-0 text-gray-400 dark:text-gray-500"
                />
                {page.current ? (
                  <span
                    aria-current="page"
                    className="ml-4 text-sm font-medium text-gray-900 dark:text-white truncate"
                    title={page.name}
                  >
                    {page.name}
                  </span>
                ) : (
                  <Link
                    to={page.href}
                    className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 truncate"
                    title={page.name}
                  >
                    {page.name}
                  </Link>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
