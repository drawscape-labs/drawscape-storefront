import React, {useState, useCallback, useEffect, useRef} from 'react';
import { useNavigate } from 'react-router';
import { useAside } from '~/components/Aside';
import API from '~/lib/drawscapeApi';

export function SearchSchematics() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { close } = useAside();
  
  // Refs to track current request and timeout
  const currentControllerRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced search function
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setResults([]);
      setError(null);
      return;
    }

    // Cancel any existing request
    if (currentControllerRef.current) {
      currentControllerRef.current.abort();
    }

    // Create new AbortController for this request
    const controller = new AbortController();
    currentControllerRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      // Call the Drawscape API search endpoint with abort signal
      const data = await API.get('schematics/search', {
        q: searchQuery,
        limit: 10,
        published: true,
      }, {
        signal: controller.signal
      });
      
      setResults(data || []);
    } catch (err: any) {
      // Don't set error if request was aborted
      if (err.name !== 'AbortError' && err.name !== 'CanceledError') {
        setError(err?.message || 'Search failed');
      }
    } finally {
      // Only update loading state if this is still the current request
      if (currentControllerRef.current === controller) {
        setLoading(false);
      }
    }
  }, []);

  // Debounced effect for search
  useEffect(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for debounced search
    timeoutRef.current = setTimeout(() => {
      performSearch(query);
    }, 300); // 300ms debounce delay

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [query, performSearch]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (currentControllerRef.current) {
        currentControllerRef.current.abort();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // The search will be triggered by the useEffect when query changes
    // This is just for form submission behavior
  }

  // Helper to get the correct link based on category
  function getSchematicLink(schematic: any) {
    switch (schematic.category) {
      case 'sailboats':
        return `/products/sailboat?schematic_id=${schematic.id}`;
      case 'airport_diagrams':
        return `/products/airports?schematic_id=${schematic.id}`;
      case 'aircraft':
        return `/aircraft?schematic_id=${schematic.id}`;
      default:
        return `/schematics/${schematic.id}`;
    }
  }

  // Handle schematic click - close aside and navigate
  function handleSchematicClick(schematic: any) {
    const link = getSchematicLink(schematic);
    close(); // Close the aside first
    navigate(link); // Then navigate to trigger full page reinitialization
  }

  return (
    <div className="">
      <form className="flex items-center gap-2 mb-6" onSubmit={handleSubmit}>
        <input
          type="search"
          name="schematic-search"
          placeholder="Search schematics"
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
        />
        <button
          type="submit"
          className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:shadow-none dark:focus-visible:outline-indigo-500"
          disabled={loading}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
        {error && <div className="text-red-500 text-sm ml-2">{error}</div>}
      </form>

      {/* Results Table - Hidden while loading */}
      {!loading && results.length > 0 && (
        <div className="flow-root">
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full py-2 align-middle">
              <table className="relative min-w-full divide-y divide-gray-300 dark:divide-white/15">
                <tbody className="divide-y divide-gray-200 dark:divide-white/10">
                  {results.map((schematic, index) => (
                    <tr key={schematic.id || index}>
                      <td className="py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-gray-900 sm:pl-0 dark:text-white">
                        <a 
                          href={getSchematicLink(schematic)}
                          onClick={(e) => {
                            e.preventDefault();
                            handleSchematicClick(schematic);
                          }}
                          className="hover:underline text-left"
                        >
                          {schematic.title}
                        </a>
                      </td>
                      <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400 text-right">
                        {schematic.category}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* No results message */}
      {!loading && results.length === 0 && query && (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">No schematics found for "{query}"</p>
        </div>
      )}
    </div>
  );
}
