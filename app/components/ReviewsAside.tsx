import {useEffect} from 'react';
import {Aside, useAside} from './Aside';

/**
 * Reviews Aside Component
 * Displays Judge.me reviews widget in a sidebar
 */
export function ReviewsAside() {
  const {type} = useAside();
  
  if (type !== 'reviews') return null;

  useEffect(() => {
    if (type !== 'reviews') return;
    const timeout = window.setTimeout(() => {
      // Trigger Judge.me to (re)render widgets after DOM is present
      const w = window as unknown as {
        jdgm_preloader?: () => void;
        jdgmCacheServer?: { reloadAll: () => void };
      };
      if (w.jdgm_preloader && !w.jdgmCacheServer) {
        w.jdgm_preloader();
      } else if (w.jdgmCacheServer && w.jdgmCacheServer.reloadAll) {
        w.jdgmCacheServer.reloadAll();
      }
    }, 200);
    return () => window.clearTimeout(timeout);
  }, [type]);

  return (
    <Aside type="reviews" heading="Reviews">
      <div className="reviews-content reviews-aside">
        <div className="jdgm-widget jdgm-all-reviews-widget">
          <div className="jdgm-all-reviews__body"></div>
        </div>
      </div>
    </Aside>
  );
}

/**
 * Hook to open the reviews aside
 */
export function useReviewsAside() {
  const {open} = useAside();
  
  return {
    openReviews: () => open('reviews'),
  };
}
