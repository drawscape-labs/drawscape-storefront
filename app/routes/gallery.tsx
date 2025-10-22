import {type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {useLoaderData, useSearchParams, type MetaFunction} from 'react-router';
import drawscapeServerApi from '~/lib/drawscapeServerApi';
import {Select} from '~/ui/select';

export const meta: MetaFunction<typeof loader> = () => {
  return [
    {title: 'Gallery | Drawscape'},
    {
      rel: 'canonical',
      href: '/gallery',
    },
  ];
};

interface Project {
  id: number;
  title: string;
  description?: string;
  category?: string;
  created_at?: string;
  updated_at?: string;
  published?: boolean;
  image_url?: string;
  thumbnail?: string | null;
  images?: Array<{url: string; thumbnail?: string | null}>;
  // Add other project fields as needed based on API response
}

export async function loader({context, request}: LoaderFunctionArgs) {
  let projects: Project[] = [];
  let categories: string[] = [];

  try {
    const api = drawscapeServerApi(context.env.DRAWSCAPE_API_URL);

    // Get category filter from URL search params
    const url = new URL(request.url);
    const selectedCategory = url.searchParams.get('category');

    // Fetch categories
    const categoriesResponse = await api.get<{categories: string[]}>('projects/categories');
    categories = categoriesResponse?.categories || [];

    // Fetch projects with optional category filter
    const projectParams: Record<string, any> = {
      published: true,
      limit: 10,
      sort: '-created_at',
    };

    if (selectedCategory && selectedCategory !== 'all') {
      projectParams.category = selectedCategory;
    }

    const response = await api.get<Project[]>('projects', projectParams);
    projects = Array.isArray(response) ? response : [];
  } catch (error) {
    console.error('Error fetching projects from Drawscape API:', error);
    projects = [];
  }

  return {projects, categories};
}

export default function Gallery() {
  const {projects, categories} = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategory = searchParams.get('category') || 'all';

  // Helper function to format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Helper function to get project image
  const getProjectImage = (project: Project) => {
    // Priority: thumbnail, image_url, first image in images array, fallback placeholder
    if (project.thumbnail) return project.thumbnail;
    if (project.image_url) return project.image_url;
    if (project.images && project.images.length > 0) {
      return project.images[0].thumbnail || project.images[0].url;
    }
    return 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?ixlib=rb-4.0.3&auto=format&fit=crop&w=3270&q=80'; // Fallback image
  };

  // Handle category change
  const handleCategoryChange = (category: string) => {
    if (category === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({category});
    }
  };

  return (
    <div className="bg-white py-24 sm:py-32 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-semibold tracking-tight text-balance text-gray-900 sm:text-5xl dark:text-white">
            Project Gallery
          </h2>
          <p className="mt-2 text-lg/8 text-gray-600 dark:text-gray-400">
            Explore our latest plotter art creations
          </p>

          {/* Category Filter Dropdown */}
          <div className="mt-6 flex justify-center">
            <div className="w-full max-w-xs">
              <Select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </div>

        {projects.length > 0 ? (
          <div className="mx-auto mt-16 grid max-w-2xl auto-rows-fr grid-cols-1 gap-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {projects.map((project) => (
              <article
                key={project.id}
                className="relative isolate flex flex-col justify-end overflow-hidden rounded-2xl bg-gray-900 px-8 pt-[60%] pb-8 sm:pt-48 lg:pt-80 dark:bg-gray-800"
              >
                <img
                  alt={project.title}
                  src={getProjectImage(project)}
                  className="absolute inset-0 -z-10 size-full object-cover"
                />
                <div className="absolute inset-0 -z-10 bg-linear-to-t from-gray-900 via-gray-900/40 dark:from-black/80 dark:via-black/40" />
                <div className="absolute inset-0 -z-10 rounded-2xl inset-ring inset-ring-gray-900/10 dark:inset-ring-white/10" />

                <div className="flex flex-wrap items-center gap-y-1 overflow-hidden text-sm/6 text-gray-300">
                  <time dateTime={project.created_at} className="mr-8">
                    {formatDate(project.created_at)}
                  </time>
                  {project.category && (
                    <>
                      <div className="-ml-4 flex items-center gap-x-4">
                        <svg
                          viewBox="0 0 2 2"
                          className="-ml-0.5 size-0.5 flex-none fill-white/50 dark:fill-gray-300/50"
                        >
                          <circle r={1} cx={1} cy={1} />
                        </svg>
                        <div className="flex gap-x-2.5">
                          <span className="text-gray-300">{project.category}</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <h3 className="mt-3 text-lg/6 font-semibold text-white">
                  <span className="absolute inset-0" />
                  {project.title}
                </h3>
              </article>
            ))}
          </div>
        ) : (
          <div className="mx-auto mt-16 max-w-2xl text-center">
            <p className="text-lg text-gray-600 dark:text-gray-400">
              No projects found.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
