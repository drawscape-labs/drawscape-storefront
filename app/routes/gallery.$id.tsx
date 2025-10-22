import {type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {useLoaderData, type MetaFunction} from 'react-router';
import drawscapeServerApi from '~/lib/drawscapeServerApi';
import Breadcrumb from '~/components/Breadcrumb';

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


  console.log('ID:', id);
  
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
    <div className="bg-white py-8 sm:py-12 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Breadcrumb
            pages={[
              {name: 'Gallery', href: '/gallery', current: false},
              {name: project.title, href: `/gallery/${project.id}`, current: true},
            ]}
          />
        </div>

        {/* Project Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl dark:text-white">
            {project.title}
          </h1>

          {/* Project Metadata */}
          {(project.category || project.artist || project.created_at || project.pens || project.paper) && (
            <div className="mt-6 flex flex-col gap-2 text-sm sm:flex-row sm:flex-wrap sm:gap-4">
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
              <div key={image.id} className="relative overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                <img
                  src={image.thumbnail || image.url}
                  alt={image.title || project.title}
                  className="w-full sm:w-auto h-auto"
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
