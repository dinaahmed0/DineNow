import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, Button, Avatar, Badge, Modal } from 'flowbite-react';
import { 
  FaUser, FaCalendarAlt, FaClock, FaSignOutAlt,
  FaHistory, FaTicketAlt, FaSpinner, FaStar,
  FaPhone, FaEnvelope, FaUtensils, FaTimes,FaCalendar
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { APP_ROUTES } from '../../constants/routes';

interface Reservation {
  id: number;
  userName: string;
  restaurantName: string;
  tableNumber: number;
  startDateTime: string;
  endDateTime: string;
  numberOfGuests: number;
  bookNumber: number;
  status: string;
  notes: string;
  createdAt: string;
}

interface Review {
  id: number;
  rating: number;
  comment: string;
  userName: string;
}

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'reviews'>('upcoming');
  const [loading, setLoading] = useState(true);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Logout modal state
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Get auth token
  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  });

  // Load reservations from API
  const loadReservations = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        'https://reservationproj.runasp.net/api/Reservation/User/GetAllReservation?PageIndex=1&PageSize=50',
        { headers: getAuthHeaders() }
      );
      
      const result = await response.json();
      console.log('API Response:', result);
      
      if (response.ok && result.succeeded && result.data) {
        setReservations(result.data);
      } else if (response.status === 401) {
        logout();
        navigate('/login');
      } else {
        setReservations([]);
      }
    } catch (error) {
      console.error('Error loading reservations:', error);
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  // Load reviews from API
  const loadReviews = async () => {
    try {
      setLoadingReviews(true);
      const response = await fetch(
        'https://reservationproj.runasp.net/api/Restaurant/get-reviews',
        { headers: getAuthHeaders() }
      );
      
      const result = await response.json();
      console.log('Reviews API Response:', result);
      
      if (response.ok && result.succeeded && result.data && result.data.data) {
        setReviews(result.data.data);
      } else if (response.status === 401) {
        logout();
        navigate('/login');
      } else {
        setReviews([]);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };

  // Cancel reservation
  const cancelReservation = async (reservationId: number) => {
    if (!confirm('Are you sure you want to cancel this reservation?')) return;
    
    try {
      const response = await fetch('https://reservationproj.runasp.net/api/Reservation/Cancel', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ reservationId })
      });
      
      const result = await response.json();
      
      if (response.ok && result.succeeded) {
        alert('Reservation cancelled successfully');
        await loadReservations();
      } else {
        alert(result.message || 'Failed to cancel reservation');
      }
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      alert('Network error occurred');
    }
  };

  // Submit review
  const submitReview = async () => {
    if (!selectedReservation) return;
    
    if (!reviewComment.trim()) {
      alert('Please add a comment for your review');
      return;
    }
    
    setSubmitting(true);
    try {
      const response = await fetch('https://reservationproj.runasp.net/api/Restaurant/add-review', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          restaurantId: selectedReservation.id,
          rating: reviewRating,
          comment: reviewComment.trim()
        })
      });
      
      const result = await response.json();
      
      if (response.ok && result.succeeded) {
        alert('Thank you for your review!');
        setShowReviewModal(false);
        setReviewComment('');
        setReviewRating(5);
        setSelectedReservation(null);
        await loadReservations();
      } else {
        alert(result.message || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Network error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    setTimeout(() => {
      logout();
      setShowLogoutModal(false);
      setIsLoggingOut(false);
      navigate(APP_ROUTES.login);
    }, 1000);
  };

  useEffect(() => {
    loadReservations();
  }, []);

  useEffect(() => {
    if (activeTab === 'reviews') {
      loadReviews();
    }
  }, [activeTab]);

  // Filter reservations
  const upcomingReservations = reservations.filter(r => 
    ['Pending', 'Approved'].includes(r.status)
  );
  const pastReservations = reservations.filter(r => 
    ['Completed', 'Cancelled', 'Rejected'].includes(r.status)
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Approved': return 'success';
      case 'Pending': return 'warning';
      case 'Completed': return 'info';
      case 'Cancelled': return 'failure';
      case 'Rejected': return 'failure';
      default: return 'gray';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your reservations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mt-5">
             <Button 
              onClick={() => navigate('/')}
              size="xs"
              className='cursor-pointer py-3 text-white bg-emerald-700 rounded-xl '
            >
              ← Back
            </Button>
            <h2 className="text-3xl font-bold text-gray-900">Your <span className='text-emerald-700'>Profile</span></h2> 
            {/* <h1 className="text-4xl font-bold text-gray-900">Your Profile</h1> */}
            <button
              onClick={() => setShowLogoutModal(true)}
              className="flex items-center gap-2 px-6 py-3 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-all duration-200 cursor-pointer"
            >
              <FaSignOutAlt />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Info Card */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  {/* User Info Card */}
  <Card className="mb-8">
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      {/* Left side - User Name */}
      <div className="flex items-center gap-4">
        {/* <Avatar 
          size="lg" 
          placeholderInitials={user?.displayName?.charAt(0) || 'U'}
          className="ring-4 ring-emerald-100"
        /> */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{user?.displayName || 'User'}</h2>
          
        </div>
      </div>

      {/* Right side - Stats in horizontal row */}
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
          <FaEnvelope className="text-emerald-600 w-4 h-4" />
          <span className="text-gray-600 text-sm">{user?.email}</span>
        </div>
        
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
          <FaTicketAlt className="text-emerald-600 w-4 h-4" />
          <span className="text-gray-600 text-sm">
            <span className="font-semibold text-gray-900">{reservations.length}</span> total reservations
          </span>
        </div>
      </div>
    </div>
  </Card>
</div>

        {/* Stats Cards */}
        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="text-center">
            <div className="p-4">
              <div className="text-3xl font-bold text-emerald-600">{upcomingReservations.length}</div>
              <div className="text-sm text-gray-600">Upcoming</div>
            </div>
          </Card>
          <Card className="text-center">
            <div className="p-4">
              <div className="text-3xl font-bold text-gray-600">{pastReservations.length}</div>
              <div className="text-sm text-gray-600">Past</div>
            </div>
          </Card>
          <Card className="text-center">
            <div className="p-4">
              <div className="text-3xl font-bold text-amber-600">
                {pastReservations.filter(r => r.status === 'Completed').length}
              </div>
              <div className="text-sm text-gray-600">Reviews</div>
            </div>
          </Card>
        </div> */}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`flex-1 px-6 py-3 text-sm font-medium transition ${
                activeTab === 'upcoming'
                  ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Upcoming ({upcomingReservations.length})
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`flex-1 px-6 py-3 text-sm font-medium transition ${
                activeTab === 'past'
                  ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Past ({pastReservations.length})
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`flex-1 px-6 py-3 text-sm font-medium transition ${
                activeTab === 'reviews'
                  ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Reviews ({reviews.length})
            </button>
          </div>
        </div>

        {/* Reservations List */}
        <div className="space-y-4">
          {activeTab === 'reviews' ? (
            loadingReviews ? (
              <Card className="text-center py-12">
                <FaSpinner className="animate-spin text-4xl text-emerald-600 mx-auto mb-4" />
                <p className="text-gray-600">Loading your reviews...</p>
              </Card>
            ) : reviews.length === 0 ? (
              <Card className="text-center py-12">
                <FaStar className="text-gray-400 text-5xl mb-4 text-center m-auto" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No reviews yet
                </h3>
                <p className="text-gray-600">
                  Your reviews will appear here after you rate your dining experiences.
                </p>
              </Card>
            ) : (
              reviews.map((review) => (
                <Card key={review.id} className="hover:shadow-lg transition-shadow">
                  <div className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <FaStar className="text-yellow-500 text-xl" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{review.userName}</h3>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <FaStar
                                key={star}
                                className={`text-sm ${
                                  star <= review.rating ? 'text-yellow-400' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-600">{review.comment}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )
          ) : (activeTab === 'upcoming' ? upcomingReservations : pastReservations).length === 0 ? (
            <Card className="text-center py-12">
              <FaCalendarAlt className="text-gray-400 text-5xl mb-4 text-center m-auto" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No {activeTab} reservations
              </h3>
              <p className="text-gray-600">
                {activeTab === 'upcoming' 
                  ? 'You have no upcoming reservations. Start exploring Now!' 
                  : 'Your dining history will appear here'}
              </p>
              {activeTab === 'upcoming' && (
                <Button 
                  onClick={() => navigate('/spots')} 
                  className="mt-4 bg-emerald-600 hover:bg-emerald-700 max-w-xs mx-auto"
                >
                  View all spots
                </Button>
              )}
            </Card>
          ) : (
            (activeTab === 'upcoming' ? upcomingReservations : pastReservations).map((reservation) => (
              <Card key={reservation.id} className="hover:shadow-lg transition-shadow">
                <div className="p-4">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                          <FaUtensils className="text-emerald-600 text-xl" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {reservation.restaurantName || reservation.userName}
                          </h3>
                          <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <FaCalendarAlt className="text-emerald-600" />
                              {formatDate(reservation.startDateTime)}
                            </span>
                            <span className="flex items-center gap-1">
                              <FaClock className="text-emerald-600" />
                              {formatTime(reservation.startDateTime)}
                            </span>
                            <span className="flex items-center gap-1">
                              <FaUser className="text-emerald-600" />
                              {reservation.numberOfGuests} guests
                            </span>
                            {reservation.tableNumber > 0 && (
                              <span>Table #{reservation.tableNumber}</span>
                            )}
                          </div>
                          {reservation.notes && (
                            <p className="mt-2 text-sm text-gray-500 italic">"{reservation.notes}"</p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      <Badge color={getStatusColor(reservation.status)}>
                        {reservation.status}
                      </Badge>
                      <div className="flex gap-2">
                        {activeTab === 'upcoming' && reservation.status === 'Approved' && (
                          <Button 
                            size="sm" 
                            color="failure"
                            onClick={() => cancelReservation(reservation.id)}
                          >
                            Cancel
                          </Button>
                        )}
                        {activeTab === 'past' && reservation.status === 'Completed' && (
                          <Button 
                            size="sm"
                            color="success"
                            onClick={() => {
                              setSelectedReservation(reservation);
                              setShowReviewModal(true);
                            }}
                          >
                            <FaStar className="mr-1" />
                            Review
                          </Button>
                        )}
                        <Button size="sm" outline>
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Logout Button at the Bottom */}
        {/* <div className="mt-12 pt-6 border-t border-gray-200">
          <div className="flex justify-center">
            <button
              onClick={() => setShowLogoutModal(true)}
              className="flex items-center gap-2 px-6 py-3 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-all duration-200 cursor-pointer"
            >
              <FaSignOutAlt />
              <span>Logout</span>
            </button>
          </div>
        </div> */}
      </div>

      {/* Review Modal */}
      <Modal show={showReviewModal} onClose={() => setShowReviewModal(false)}>
        <Modal.Header>Rate Your Experience</Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <div className="text-center">
              <div className="flex justify-center gap-2 text-4xl mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setReviewRating(star)}
                    className={`transition-transform hover:scale-110 ${
                      star <= reviewRating ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                  >
                    ★
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
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={submitReview} disabled={submitting}>
            {submitting ? <FaSpinner className="animate-spin mr-2" /> : <FaStar className="mr-2" />}
            Submit Review
          </Button>
          <Button color="gray" onClick={() => setShowReviewModal(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Logout Modal - Same as Navbar */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 backdrop-blur-md bg-black/30" />

          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-fadeIn">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <FaSignOutAlt className="text-red-600 text-2xl" />
              </div>
            </div>
            
            <h3 className="text-center text-xl font-semibold text-gray-900 mb-2">
              {isLoggingOut ? "Logging out..." : "Ready to leave?"}
            </h3>
            <p className="text-center text-gray-500 mb-6">
              {isLoggingOut 
                ? "Please wait while we log you out..." 
                : "You'll need to log back in to access your profile and reservations."}
            </p>
            
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowLogoutModal(false)}
                disabled={isLoggingOut}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoggingOut ? "Can't cancel" : "Stay Logged In"}
              </button>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[120px] justify-center"
              >
                {isLoggingOut ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Logging out...
                  </>
                ) : (
                  'Logout'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      <div className='py-5 flex m-auto'>
        <p className="text-sm text-gray-500 mt-1">Member since {new Date().getFullYear()}</p>
      </div>
    </div>
  );
}