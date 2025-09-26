import React, {useState, useCallback, useEffect, useRef} from 'react';
import { Link } from 'react-router';
import { useAside } from '~/components/Aside';
import { Button } from '~/ui/button';
import API from '~/lib/drawscapeApi';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { byPrefixAndName } from '@awesome.me/kit-725782e741/icons'


// Helper: Return a Heroicon for each schematic category
function getCategoryIcon(category: string) {
  switch (category) {
    case 'sailboats':
      return <FontAwesomeIcon icon={byPrefixAndName.fad['sailboat']} />;
    case 'airport_diagrams':
      return <FontAwesomeIcon icon={byPrefixAndName.fad['map-location-dot']} />;
    case 'aircraft':
      return <FontAwesomeIcon icon={byPrefixAndName.fad['plane']} />
    default:
      return <FontAwesomeIcon icon={byPrefixAndName.fad['question']} />;
  }
}

export function SearchSchematics() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { close, open } = useAside();
  
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
        limit: 25,
        published: true,
        tracking: true,
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
        return `/products/sailboats?schematic_id=${schematic.id}`;
      case 'airport_diagrams':
        return `/products/airports?schematic_id=${schematic.id}`;
      case 'aircraft':
        return `/products/aircraft?schematic_id=${schematic.id}`;
      default:
        return `/`;
    }
  }

  // Handle schematic click - close aside before navigation
  function handleSchematicClick() {
    close();
  }

  // Handle submit request button click - close search and open request modal
  function handleSubmitRequestClick() {
    close();
    open('request-design');
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search Form - Fixed at top */}
      <form className="flex items-center gap-2 mb-6 flex-shrink-0" onSubmit={handleSubmit}>
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
          Search
        </button>
        {error && <div className="text-red-500 text-sm ml-2">{error}</div>}
      </form>

      {/* Scrollable Results Area */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {/* Results Table - Hidden while loading */}
        {!loading && results.length > 0 && (
          <div className="flow-root">
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full py-2 align-middle">
                <ul className="relative min-w-full divide-y divide-gray-300 dark:divide-white/15">
                  {results.map((schematic, index) => (
                    <li key={schematic.id || index}>
                      <Link
                        to={getSchematicLink(schematic)}
                        prefetch="intent"
                        className="flex items-start w-full py-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group"
                        onClick={handleSchematicClick}
                        style={{ textDecoration: 'none' }}
                      >
                        {/* Title: allow wrapping to multiple lines without pushing category */}
                        <span className="flex-1 min-w-0 pr-3 text-sm font-medium text-indigo-600 dark:text-indigo-400 group-hover:underline whitespace-normal break-words">
                          {schematic.title}
                        </span>
                        {/* Category: fixed on right, does not move */}
                        <span className="flex-shrink-0 px-3 text-sm whitespace-nowrap text-right flex items-center gap-2">
                          {getCategoryIcon(schematic.category)}
                          <span className="text-gray-500 dark:text-gray-400">
                            {schematic.category
                              .replace(/_.*/, '').replace(/_/g, ' ')
                              .replace(/^./, (c: string) => c.toUpperCase())}
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
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

      {/* Request CTA - Fixed at bottom of aside container */}
      <div className="flex-shrink-0 mt-6">
        <div className="bg-gray-50 sm:rounded-lg dark:bg-gray-800/50">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Don't see what you are looking for?</h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500 dark:text-gray-400">
              <p>Submit a request and we'll notify you when it's added to the store.</p>
            </div>
            <div className="mt-5">
              <Button color="light" onClick={handleSubmitRequestClick}>
                Submit Request
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
