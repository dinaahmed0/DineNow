import { useState, useEffect, type FormEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaStar, FaMapMarkerAlt, FaPhone, FaClock, FaGlobe, FaHeart, FaRegHeart } from 'react-icons/fa';
import { Card, Button, Badge, Spinner } from 'flowbite-react';
import { getRestaurantById, getRestaurantReviews, addReview } from '../../services/restaurant';
import type { ReturnRestaurantQuery, GetReviewQueryPagination } from '../../types/restaurant';
import { useAuth } from '../../contexts/AuthContext';

interface RestaurantDetailsProps {
  isAdmin?: boolean;
  onEditRestaurant?: (restaurant: ReturnRestaurantQuery) => void;
}

export default function RestaurantDetails({ isAdmin = false, onEditRestaurant }: RestaurantDetailsProps) {
  const { id } = useParams<{ id: string }>();
  const [restaurant, setRestaurant] = useState<ReturnRestaurantQuery | null>(null);
  const [reviews, setReviews] = useState<GetReviewQueryPagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchRestaurantData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch restaurant details
        const restaurantData = await getRestaurantById(Number(id));
        setRestaurant(restaurantData);

        // Fetch restaurant reviews
        const reviewsData = await getRestaurantReviews(Number(id));
        setReviews(reviewsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load restaurant details');
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantData();
  }, [id]);

  const handleSubmitReview = async (e: FormEvent) => {
    e.preventDefault();
    if (!restaurant || !newReview.comment.trim() || !isAuthenticated) return;

    try {
      setSubmittingReview(true);
      await addReview({
        restaurantId: restaurant.id,
        rating: newReview.rating,
        comment: newReview.comment.trim()
      });

      // Refresh reviews
      const reviewsData = await getRestaurantReviews(restaurant.id);
      setReviews(reviewsData);

      // Reset form
      setNewReview({ rating: 5, comment: '' });
      setShowReviewForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner size="xl" />
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <Link to="/restaurants" className="inline-flex items-center px-4 py-2 mb-6 text-emerald-600 border border-emerald-600 rounded hover:bg-emerald-50">
          ← Back to Restaurants
        </Link>
        <div className="text-center py-12">
          <div className="text-red-500 text-lg mb-4">{error || 'Restaurant not found'}</div>
          <Link to="/restaurants">
            <Button color="failure">Back to Restaurants</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isAdminUser = user && (user.email.includes('admin') || isAdmin);

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Back Navigation */}
      <Link to="/restaurants" className="inline-flex items-center px-4 py-2 mb-6 text-emerald-600 border border-emerald-600 rounded hover:bg-emerald-50">
        ← Back to Restaurants
      </Link>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Restaurant Info */}
        <div className="space-y-6">
          <div>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">{restaurant.name}</h1>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-1">
                    <FaStar className="text-yellow-400" />
                    <span className="font-semibold text-gray-700">{restaurant.rating}</span>
                    <span className="text-gray-500">({restaurant.reviewCount} reviews)</span>
                  </div>
                  <Badge color="success" className="bg-emerald-600">
                    {restaurant.cuisine}
                  </Badge>
                  <Badge color="light">{restaurant.priceRange}</Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setIsFavorite(!isFavorite)}
                  color="light"
                  className="!p-2"
                >
                  {isFavorite ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
                </Button>
                {isAdminUser && onEditRestaurant && (
                  <Button onClick={() => onEditRestaurant(restaurant)} color="warning" size="sm">
                    Edit Restaurant
                  </Button>
                )}
              </div>
            </div>

            <p className="text-lg text-gray-700 mb-6">{restaurant.description}</p>

            {/* Restaurant Details */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <FaMapMarkerAlt className="text-emerald-600" />
                <span className="text-gray-700">{restaurant.address}</span>
              </div>
              <div className="flex items-center gap-3">
                <FaPhone className="text-emerald-600" />
                <span className="text-gray-700">{restaurant.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <FaClock className="text-emerald-600" />
                <span className="text-gray-700">{restaurant.hours}</span>
              </div>
              {restaurant.website && (
                <div className="flex items-center gap-3">
                  <FaGlobe className="text-emerald-600" />
                  <a 
                    href={`https://${restaurant.website}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-emerald-600 hover:text-emerald-700 hover:underline"
                  >
                    {restaurant.website}
                  </a>
                </div>
              )}
            </div>

            {/* Features */}
            {restaurant.features.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Features</h3>
                <div className="flex flex-wrap gap-2">
                  {restaurant.features.map((feature, index) => (
                    <Badge key={index} color="light">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 mt-8">
              <Button
                color="success"
                className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 px-8 py-3"
                onClick={() => {
                  // Navigate to booking - will implement later
                  console.log('Navigate to booking for restaurant:', restaurant.id);
                }}
              >
                Reserve Table
              </Button>
              <Button
                color="light"
                onClick={() => setShowReviewForm(!showReviewForm)}
              >
                Write Review
              </Button>
            </div>
          </div>

          {/* Review Form */}
          {showReviewForm && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Write a Review</h3>
              {!isAuthenticated && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-700">
                    Please <Link to="/login" className="text-emerald-600 hover:underline">log in</Link> to write a review.
                  </p>
                </div>
              )}
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewReview({ ...newReview, rating: star })}
                        className="text-2xl focus:outline-none"
                      >
                        <FaStar 
                          className={star <= newReview.rating ? 'text-yellow-400' : 'text-gray-300'} 
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
                  <textarea
                    value={newReview.comment}
                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Share your experience..."
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    type="submit"
                    color="success"
                    disabled={submittingReview || !isAuthenticated}
                    className="flex items-center gap-2"
                  >
                    {submittingReview && <Spinner size="sm" />}
                    Submit Review
                  </Button>
                  <Button
                    type="button"
                    color="light"
                    onClick={() => setShowReviewForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          )}
        </div>

        {/* Restaurant Image */}
        <div>
          <div className="relative h-96 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden">
            {restaurant.image && (
              <img
                src={restaurant.image}
                alt={restaurant.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      {reviews && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Reviews</h2>
          
          {reviews.reviews.length === 0 ? (
            <Card className="text-center py-8">
              <div className="text-4xl text-gray-300 mx-auto mb-4">📝</div>
              <p className="text-gray-500">No reviews yet. Be the first to review!</p>
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">{reviews.averageRating}</div>
                  <div className="text-sm text-gray-500">Average Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-semibold text-gray-900">{reviews.totalCount}</div>
                  <div className="text-sm text-gray-500">Total Reviews</div>
                </div>
              </div>
              
              {reviews.reviews.map((review) => (
                <Card key={review.id} className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900">{review.userName}</h4>
                      <div className="flex items-center gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <FaStar
                            key={i}
                            className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

