import { useState } from 'react';
import { Star, MessageSquare } from 'lucide-react';
import { Rating } from './Rating';
import { reviews as allReviews } from '@/data/sampleData';
import type { Review } from '@/types';

interface ReviewsProps {
  targetType: Review['targetType'];
  targetId: string;
  baseRating: number;
  reviewsCount: number;
}

export function Reviews({ targetType, targetId, baseRating, reviewsCount }: ReviewsProps) {
  const [open, setOpen] = useState(false);
  const itemReviews = allReviews.filter(
    (r) => r.targetType === targetType && r.targetId === targetId,
  );

  return (
    <div className="mt-4 border-t border-navy-100 pt-4">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-navy-700">
          <MessageSquare size={16} className="text-ocean-600" />
          Read reviews
          {itemReviews.length > 0 && (
            <span className="text-navy-400 font-normal">({itemReviews.length})</span>
          )}
        </span>
        <span className="text-xs font-semibold text-ocean-600">
          {open ? 'Hide' : 'Show'}
        </span>
      </button>

      {open && (
        <div className="mt-4 space-y-4 animate-fade-in">
          {itemReviews.length === 0 ? (
            <div className="rounded-2xl bg-navy-50 p-4 text-center text-sm text-navy-500">
              No reviews yet for this listing. Be the first to share your experience.
            </div>
          ) : (
            itemReviews.map((rev) => <ReviewCard key={rev.id} review={rev} />)
          )}
          <div className="rounded-2xl border border-dashed border-navy-200 p-4 text-center">
            <p className="text-sm text-navy-500">
              Prototype note: review submission is disabled in this demo. Showing sample reviews.
            </p>
          </div>
        </div>
      )}

      <div className="mt-3 flex items-center gap-2">
        <Rating value={baseRating} count={reviewsCount} showCount />
      </div>
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const initials = review.author.split(' ').map((p) => p[0]).join('').slice(0, 2);
  return (
    <div className="rounded-2xl border border-navy-100 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-ocean-100 text-xs font-bold text-ocean-700">
            {initials}
          </div>
          <div>
            <p className="text-sm font-semibold text-navy-800">{review.author}</p>
            <p className="text-xs text-navy-400">
              {new Date(review.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-sand-50 px-2 py-1">
          <Star size={12} className="fill-sand-400 text-sand-400" />
          <span className="text-xs font-bold text-navy-700">{review.rating}.0</span>
        </div>
      </div>
      <p className="mt-3 text-sm font-semibold text-navy-800">{review.title}</p>
      <p className="mt-1 text-sm leading-relaxed text-navy-600">{review.body}</p>
    </div>
  );
}
