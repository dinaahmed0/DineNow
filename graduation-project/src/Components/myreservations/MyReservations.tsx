import { useAuth } from '../../contexts/AuthContext';
import {
  CalendarIcon,
  ClockIcon,
  UsersIcon,
  ChevronRightIcon,
  XMarkIcon,
  CheckCircleIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { cancelReservation, getAllUserReservations } from '../../services/reservation';
import { addReview } from '../../services/restaurant';
import type { ReservationUserItem } from '../../types/reservation';
import type { AddReviewCommand } from '../../types/restaurant';

const normalizeStatus = (status: string) => status.toLowerCase();

const getStatusStyles = (status: string) => {
  switch (normalizeStatus(status)) {
    case 'approved':
    case 'confirmed':
      return {
        bg: 'bg-green-100',
        text: 'text-green-800',
        icon: <CheckCircleIcon className="w-4 h-4 mr-1" />,
      };
    case 'pending':
      return {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        icon: <QuestionMarkCircleIcon className="w-4 h-4 mr-1" />,
      };
    case 'cancelled':
    case 'rejected':
      return {
        bg: 'bg-red-100',
        text: 'text-red-800',
        icon: <XMarkIcon className="w-4 h-4 mr-1" />,
      };
    default:
      return {
        bg: 'bg-gray-100',
        text: 'text-gray-700',
        icon: null,
      };
  }
};

const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const formatTime = (dateString: string) =>
  new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const canBeCancelled = (status: string) => {
  const normalized = normalizeStatus(status);
  return normalized !== 'completed' && normalized !== 'cancelled' && normalized !== 'rejected';
};

const MyReservations = () => {
  const { user } = useAuth();
  const [selectedReservation, setSelectedReservation] = useState<number | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [reservationToCancel, setReservationToCancel] = useState<number | null>(null);
  const [reservations, setReservations] = useState<ReservationUserItem[]>([]);
  const [showPast, setShowPast] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Review modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedReservationForReview, setSelectedReservationForReview] = useState<ReservationUserItem | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const fetchReservations = async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await getAllUserReservations({ pageIndex: 1, pageSize: 50 });
      if (!response.succeeded) {
        throw new Error(response.message || 'Failed to fetch reservations');
      }
      setReservations(response.data.data || []);
    } catch (fetchError) {
      const message = fetchError instanceof Error ? fetchError.message : 'Failed to fetch reservations';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [user]);

  const activeReservations = useMemo(
    () =>
      reservations.filter((reservation) => {
        const status = normalizeStatus(reservation.status);
        return status !== 'completed' && status !== 'cancelled' && status !== 'rejected';
      }),
    [reservations]
  );

  const pastReservations = useMemo(
    () =>
      reservations.filter((reservation) => {
        const status = normalizeStatus(reservation.status);
        return status === 'completed' || status === 'cancelled' || status === 'rejected';
      }),
    [reservations]
  );

  const handleCancelReservation = (id: number) => {
    setReservationToCancel(id);
    setShowCancelModal(true);
  };

  const confirmCancel = async () => {
    if (!reservationToCancel) return;

    setIsCancelling(true);
    try {
      const response = await cancelReservation(reservationToCancel);
      if (!response.succeeded) {
        throw new Error(response.message || 'Cancel request failed');
      }
      setShowCancelModal(false);
      setReservationToCancel(null);
      await fetchReservations();
    } catch (cancelError) {
      const message = cancelError instanceof Error ? cancelError.message : 'Failed to cancel reservation';
      alert(message);
    } finally {
      setIsCancelling(false);
    }
  };

  const handleOpenReviewModal = (reservation: ReservationUserItem) => {
    setSelectedReservationForReview(reservation);
    setReviewRating(5);
    setReviewComment('');
    setShowReviewModal(true);
  };

  const handleSubmitReview = async () => {
    if (!selectedReservationForReview) return;
    
    if (!reviewComment.trim()) {
      alert('Please add a comment for your review');
      return;
    }

    setIsSubmittingReview(true);
    try {
      const reviewData: AddReviewCommand = {
        restaurantId: selectedReservationForReview.id,
        rating: reviewRating,
        comment: reviewComment.trim()
      };
      
      const response = await addReview(reviewData);
      
      if (response) {
        alert('Thank you for your review!');
        setShowReviewModal(false);
        setReviewComment('');
        setReviewRating(5);
        setSelectedReservationForReview(null);
      } else {
        alert('Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Network error occurred');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="bg-white rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center shadow-lg">
            <CalendarIcon className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Reservations Yet</h2>
          <p className="text-gray-600 mb-6">Please log in to view and manage your restaurant reservations.</p>
          <Link
            to="/login"
            className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all transform hover:scale-105"
          >
            Sign In to Continue
            <ChevronRightIcon className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm uppercase tracking-wide">Total Reservations</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{reservations.length}</p>
              </div>
              <div className="bg-emerald-100 rounded-full p-3">
                <CalendarIcon className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm uppercase tracking-wide">Upcoming</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{activeReservations.length}</p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm uppercase tracking-wide">Total Guests</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {reservations.reduce((sum, reservation) => sum + reservation.numberOfGuests, 0)}
                </p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <UsersIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setShowPast(false)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                !showPast ? 'bg-emerald-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Upcoming Reservations
            </button>
            <button
              onClick={() => setShowPast(true)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                showPast ? 'bg-emerald-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Past Reservations
            </button>
          </div>

          {!showPast && activeReservations.length > 0 && (
            <p className="text-sm text-gray-500">
              {activeReservations.length} upcoming reservation{activeReservations.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {isLoading ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-500">Loading reservations...</div>
        ) : error ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button onClick={fetchReservations} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
              Try Again
            </button>
          </div>
        ) : !showPast ? (
          activeReservations.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                <CalendarIcon className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Upcoming Reservations</h3>
              <p className="text-gray-500 mb-6">Ready for a dining experience? Book a table at your favorite restaurant.</p>
              <Link to="/restaurants" className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all">
                Browse Restaurants
                <ChevronRightIcon className="w-5 h-5 ml-2" />
              </Link>
            </div>
          ) : (
            <div className="grid gap-6">
              {activeReservations.map((reservation) => {
                const statusStyle = getStatusStyles(reservation.status);
                const isExpanded = selectedReservation === reservation.id;

                return (
                  <div key={reservation.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-48 h-48 md:h-auto relative overflow-hidden">
                        <img
                          src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400"
                          alt={reservation.restaurantName}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 left-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                            {statusStyle.icon}
                            {reservation.status}
                          </span>
                        </div>
                      </div>

                      <div className="flex-1 p-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">{reservation.restaurantName}</h3>
                            <p className="text-sm text-gray-500">Book #{reservation.bookNumber}</p>
                          </div>
                          <button
                            onClick={() => setSelectedReservation(isExpanded ? null : reservation.id)}
                            className="text-emerald-600 hover:text-emerald-700 transition-colors"
                          >
                            <ChevronRightIcon className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                          </button>
                        </div>

                        <div className="flex flex-wrap gap-4 mb-4 mt-3">
                          <div className="flex items-center text-gray-700">
                            <CalendarIcon className="w-5 h-5 mr-2 text-emerald-600" />
                            <span>{formatDate(reservation.startDateTime)}</span>
                          </div>
                          <div className="flex items-center text-gray-700">
                            <ClockIcon className="w-5 h-5 mr-2 text-emerald-600" />
                            <span>{formatTime(reservation.startDateTime)}</span>
                          </div>
                          <div className="flex items-center text-gray-700">
                            <UsersIcon className="w-5 h-5 mr-2 text-emerald-600" />
                            <span>
                              {reservation.numberOfGuests} {reservation.numberOfGuests === 1 ? 'Guest' : 'Guests'}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          {canBeCancelled(reservation.status) && (
                            <button
                              onClick={() => handleCancelReservation(reservation.id)}
                              className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
                            >
                              Cancel Reservation
                            </button>
                          )}
                        </div>

                        {isExpanded && (
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <p className="text-sm text-gray-500">
                              <span className="font-medium text-gray-700">Notes:</span> {reservation.notes || 'No notes'}
                            </p>
                            <p className="text-xs text-gray-400 mt-2">
                              Booked on {new Date(reservation.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : pastReservations.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <p className="text-gray-500">No past reservations yet.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {pastReservations.map((reservation) => (
              <div key={reservation.id} className="bg-white rounded-xl shadow-sm p-6 opacity-75 hover:opacity-100 transition-opacity">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{reservation.restaurantName}</h3>
                    <p className="text-gray-500 text-sm mt-1">
                      {formatDate(reservation.startDateTime)} at {formatTime(reservation.startDateTime)}
                    </p>
                    <p className="text-gray-500 text-sm">{reservation.numberOfGuests} guests</p>
                  </div>
                  <button 
                    onClick={() => handleOpenReviewModal(reservation)}
                    className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                  >
                    Leave a Review
                    <StarIcon className="w-4 h-4 inline ml-1" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <XMarkIcon className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Cancel Reservation?</h3>
              <p className="text-gray-600 mb-6">Are you sure you want to cancel this reservation? This action cannot be undone.</p>
              <div className="flex gap-3">
                <button
                  onClick={confirmCancel}
                  disabled={isCancelling}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-300 transition-colors"
                >
                  {isCancelling ? 'Cancelling...' : 'Yes, Cancel'}
                </button>
                <button
                  onClick={() => setShowCancelModal(false)}
                  disabled={isCancelling}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Keep Reservation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showReviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="bg-yellow-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <StarIcon className="w-8 h-8 text-yellow-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Rate Your Experience</h3>
              <p className="text-gray-600">How was your dining at {selectedReservationForReview?.restaurantName}?</p>
            </div>

            <div className="space-y-4">
              <div className="text-center">
                <div className="flex justify-center gap-2 text-4xl mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className="transition-transform hover:scale-110"
                    >
                      <StarIcon
                        className={`w-10 h-10 ${
                          star <= reviewRating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-600">
                  {reviewRating === 5 ? 'Excellent!' : 
                   reviewRating === 4 ? 'Very Good' : 
                   reviewRating === 3 ? 'Good' : 
                   reviewRating === 2 ? 'Not Great' : 'Poor'}
                </p>
              </div>
              
              <textarea
                rows={4}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Share your experience at this restaurant..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSubmitReview}
                disabled={isSubmittingReview}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-emerald-300 transition-colors flex items-center justify-center gap-2"
              >
                {isSubmittingReview ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <StarIcon className="w-4 h-4" />
                    Submit Review
                  </>
                )}
              </button>
              <button
                onClick={() => setShowReviewModal(false)}
                disabled={isSubmittingReview}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyReservations;

