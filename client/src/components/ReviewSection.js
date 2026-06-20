import React, { useEffect, useState } from 'react';
import useCarStore from '../store/useCarStore';
import useAuthStore from '../store/useAuthStore';

function ReviewSection({ carId }) {
  const { carReviews, reviewsLoading, fetchCarReviews, submitReview } = useCarStore();
  const { user, profile } = useAuthStore();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (carId) {
      fetchCarReviews(carId);
    }
  }, [carId, fetchCarReviews]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    const userName = profile?.name || user.email.split('@')[0];
    const success = await submitReview(carId, rating, comment, userName);
    if (success) {
      setRating(5);
      setComment('');
    }
    setSubmitting(false);
  };

  const renderStars = (num) => {
    return '★'.repeat(num) + '☆'.repeat(5 - num);
  };

  return (
    <div className="mt-8 bg-white p-6 rounded-lg shadow border border-gray-100">
      <h3 className="text-2xl font-bold mb-6 border-b pb-2 text-gray-800">Customer Reviews</h3>
      
      {/* Review Form for logged in users */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-8 p-5 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="font-semibold mb-3 text-lg text-gray-700">Leave a Review</h4>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
            <select 
              value={rating} 
              onChange={(e) => setRating(Number(e.target.value))}
              className="p-2 border border-gray-300 rounded text-yellow-500 font-bold bg-white focus:ring-blue-500"
            >
              <option value={5}>★★★★★ (5/5)</option>
              <option value={4}>★★★★☆ (4/5)</option>
              <option value={3}>★★★☆☆ (3/5)</option>
              <option value={2}>★★☆☆☆ (2/5)</option>
              <option value={1}>★☆☆☆☆ (1/5)</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
            <textarea
              required
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
              rows="3"
              placeholder="Share your experience..."
            ></textarea>
          </div>
          <button 
            type="submit" 
            disabled={submitting}
            className="bg-blue-600 text-white px-6 py-2 rounded font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      ) : (
        <div className="mb-8 p-4 bg-gray-50 rounded-lg text-center text-gray-600 border border-gray-200">
          Please log in to leave a review.
        </div>
      )}

      {/* Reviews List */}
      <div>
        {reviewsLoading ? (
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        ) : carReviews.length === 0 ? (
          <p className="text-gray-500 italic text-center py-4">No reviews yet. Be the first to review!</p>
        ) : (
          <div className="space-y-6">
            {carReviews.map((review) => (
              <div key={review.id} className="p-4 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-gray-800">{review.userName}</span>
                  <span className="text-sm text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="text-yellow-400 mb-3 text-lg tracking-widest">{renderStars(review.rating)}</div>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ReviewSection;
