import {type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {useLoaderData, type MetaFunction} from 'react-router';
import drawscapeServerApi from '~/lib/drawscapeServerApi';

export const meta: MetaFunction<typeof loader> = ({data}) => {
  return [
    {title: `${data?.project.title || 'Project'} | Drawscape Gallery`},
    {
      rel: 'canonical',
      href: `/gallery/${data?.project.id}`,
    },
  ];
};

interface ProjectImage {
  id: string;
  project_id: number;
  url: string;
  filename: string;
  title: string;
  thumbnail: string | null;
  file_type?: string;
  size?: number;
  type?: string;
  created_at?: string;
  updated_at?: string;
}

interface Project {
  id: number;
  title: string;
  description?: string;
  category?: string;
  artist?: string;
  pens?: string;
  paper?: string;
  created_at?: string;
  updated_at?: string;
  published?: boolean;
}

export async function loader({context, params}: LoaderFunctionArgs) {
  const {id} = params;

  if (!id) {
    throw new Response('Project ID required', {status: 400});
  }

  let project: Project | null = null;
  let images: ProjectImage[] = [];

  try {
    const api = drawscapeServerApi(context.env.DRAWSCAPE_API_URL);

    // Fetch project details
    const projectResponse = await api.get<Project>(`projects/${id}`);
    project = projectResponse;

    // Fetch project images
    const imagesResponse = await api.get<ProjectImage[]>('project-images', {
      project_id: id,
      sort: 'position',
    });
    images = Array.isArray(imagesResponse) ? imagesResponse : [];
  } catch (error) {
    console.error('Error fetching project details:', error);
    throw new Response('Project not found', {status: 404});
  }

  if (!project) {
    throw new Response('Project not found', {status: 404});
  }

  return {project, images};
}

export default function GalleryDetail() {
  const {project, images} = useLoaderData<typeof loader>();

  // Helper function to format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white py-24 sm:py-32 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <a href="/gallery" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                Gallery
              </a>
            </li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-900 dark:text-white">{project.title}</li>
          </ol>
        </nav>

        {/* Project Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl dark:text-white">
            {project.title}
          </h1>
          {project.description && (
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              {project.description}
            </p>
          )}

          {/* Project Metadata */}
          <div className="mt-6 flex flex-wrap gap-4 text-sm">
            {project.category && (
              <div className="flex items-center gap-2">
                <span className="text-gray-500 dark:text-gray-400">Category:</span>
                <span className="font-medium text-gray-900 dark:text-white">{project.category}</span>
              </div>
            )}
            {project.artist && (
              <div className="flex items-center gap-2">
                <span className="text-gray-500 dark:text-gray-400">Artist:</span>
                <span className="font-medium text-gray-900 dark:text-white">{project.artist}</span>
              </div>
            )}
            {project.created_at && (
              <div className="flex items-center gap-2">
                <span className="text-gray-500 dark:text-gray-400">Created:</span>
                <span className="font-medium text-gray-900 dark:text-white">{formatDate(project.created_at)}</span>
              </div>
            )}
          </div>

          {/* Additional Details */}
          {(project.pens || project.paper) && (
            <div className="mt-6 flex flex-wrap gap-4 text-sm">
              {project.pens && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 dark:text-gray-400">Pens:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{project.pens}</span>
                </div>
              )}
              {project.paper && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 dark:text-gray-400">Paper:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{project.paper}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Images Grid */}
        {images.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((image) => (
              <div key={image.id} className="relative aspect-square overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                <img
                  src={image.url}
                  alt={image.title || project.title}
                  className="size-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No images available for this project.</p>
          </div>
        )}

        {/* Back to Gallery Link */}
        <div className="mt-12 text-center">
          <a
            href="/gallery"
            className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Back to Gallery
          </a>
        </div>
      </div>
    </div>
  );
}
