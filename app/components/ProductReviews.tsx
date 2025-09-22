import {
  JudgemeAllReviewsCount,
  JudgemeAllReviewsRating,
} from "@judgeme/shopify-hydrogen";
import { useReviewsAside } from './ReviewsAside';

/**
 * ProductReviews
 * 
 * Skeleton component for displaying product reviews.
 * Replace with actual implementation as needed.
 * 
 * Props: none
 */
export function ProductReviews() {
  const { openReviews } = useReviewsAside();

  return (
    <section>
      
      <div className="flex items-center gap-2">
        
        <JudgemeAllReviewsRating /> 
        
        <span className="text-gray-500">(4.8/5)</span>

        <button
          onClick={openReviews}
          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 underline cursor-pointer"
        >
          <JudgemeAllReviewsCount />
          <span>Reviews</span>
        </button>
      </div>

    </section>
  );
}
