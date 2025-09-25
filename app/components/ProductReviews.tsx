import { JudgemeAllReviewsCount } from "@judgeme/shopify-hydrogen";
import { StarIcon } from '@heroicons/react/20/solid';
import { useReviewsAside } from './ReviewsAside';

function classNames(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

/**
 * ProductReviews
 * 
 * Displays product reviews with star rating and review count.
 * 
 * Props: none
 */
export function ProductReviews() {
  const { openReviews } = useReviewsAside();
  
  // Static rating for now - you can replace this with dynamic data
  const rating = 4.8;

  return (
    <section>
      
      <div className="flex items-center gap-2">
        
        <div className="flex items-center">
          {[0, 1, 2, 3, 4].map((starIndex) => (
            <StarIcon
              key={starIndex}
              aria-hidden="true"
              className={classNames(
                rating > starIndex ? 'text-yellow-400' : 'text-gray-200',
                'size-5 shrink-0'
              )}
            />
          ))}
        </div>
        
        <span className="text-gray-500">({rating}/5)</span>

        <a
          href="#reviews"
          onClick={(e) => {
            e.preventDefault();
            openReviews();
          }}
          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 underline cursor-pointer"
        >
          <JudgemeAllReviewsCount />
          <span>Reviews</span>
        </a>
      </div>

    </section>
  );
}
