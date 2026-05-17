import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Modal, ModalHeader, ModalBody, ModalFooter, TextInput, Label, Checkbox } from 'flowbite-react';
import { apiGet, apiPut } from '../../services/api/client';
import { cancelReservation as cancelReservationApi } from '../../services/reservation';
import Swal from 'sweetalert2';

import { 
  FaUser, FaCalendarAlt, FaClock, FaSignOutAlt,
  FaHistory, FaTicketAlt, FaSpinner, FaStar,
  FaPhone, FaEnvelope, FaUtensils, FaTimes, FaEdit,
  FaUserCircle, FaBell, FaCookieBite, FaKey, FaTrashAlt
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { APP_ROUTES } from '../../constants/routes';

interface Reservation {
  id: number;
  userName: string;
  restaurantName: string;
  restaurantId: number;
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

interface UserProfileData {
  phoneNumber: string;
  defaultGuests: number;
  dietaryPreferences: string[];
  emailReminders: boolean;
  smsReminders: boolean;
}

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Tab state
  const [activeTab, setActiveTab] = useState<'profile' | 'reservations'>('profile');
  const [reservationSubTab, setReservationSubTab] = useState<'upcoming' | 'past'>('upcoming');
  
  // Data states
  const [loading, setLoading] = useState(true);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  
  // Profile form state
  const [profileData, setProfileData] = useState<UserProfileData>({
    phoneNumber: '',
    defaultGuests: 2,
    dietaryPreferences: [],
    emailReminders: true,
    smsReminders: false,
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editingData, setEditingData] = useState<UserProfileData>(profileData);
  
  // Password change state inside edit modal
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [passwordData, setPasswordData] = useState({ 
    current: '', 
    new: '', 
    confirm: '' 
  });
  
  // Dietary options
  const dietaryOptions = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'No Nuts', 'Halal', 'Kosher'];
  
  // Review modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Logout modal state
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // Separate change password modal (keeping for backward compatibility)
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [standalonePasswordData, setStandalonePasswordData] = useState({ current: '', new: '', confirm: '' });

  // Load reservations from API
  const loadReservations = async () => {
    try {
      setLoading(true);
      const result = await apiGet<any>(
        '/api/Reservation/User/GetAllReservation?PageIndex=1&PageSize=50'
      );

      if (result?.succeeded && result?.data?.data && Array.isArray(result.data.data)) {
        setReservations(result.data.data);
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

  const capitalizeName = (name: string) => {
  if (!name) return 'John Doe';
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

  // Load user profile data
  const loadProfileData = async () => {
    try {
      const result = await apiGet<any>('/api/User/profile');
      if (result?.succeeded && result?.data) {
        const data = result.data;
        setProfileData({
          phoneNumber: data.phoneNumber || '',
          defaultGuests: data.defaultGuests || 2,
          dietaryPreferences: data.dietaryPreferences || [],
          emailReminders: data.emailReminders ?? true,
          smsReminders: data.smsReminders ?? false,
        });
        setEditingData({
          phoneNumber: data.phoneNumber || '',
          defaultGuests: data.defaultGuests || 2,
          dietaryPreferences: data.dietaryPreferences || [],
          emailReminders: data.emailReminders ?? true,
          smsReminders: data.smsReminders ?? false,
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      const defaultData = {
        phoneNumber: '+1 234 567 8900',
        defaultGuests: 2,
        dietaryPreferences: [],
        emailReminders: true,
        smsReminders: false,
      };
      setProfileData(defaultData);
      setEditingData(defaultData);
    }
  };

  // Save profile changes
  const saveProfileChanges = async () => {
    try {
      // Replace with your actual API endpoint
      await apiPut('/api/User/profile', editingData);
      setProfileData(editingData);
      setIsEditingProfile(false);
      setShowPasswordSection(false);
      setPasswordData({ current: '', new: '', confirm: '' });
      Swal.fire('Success!', 'Profile updated successfully', 'success');
    } catch (error) {
      Swal.fire('Error!', 'Failed to update profile', 'error');
    }
  };

  // Handle password change from inside edit modal
  const handleInlinePasswordChange = async () => {
    if (passwordData.new !== passwordData.confirm) {
      Swal.fire('Error!', 'New passwords do not match', 'error');
      return;
    }
    if (passwordData.new.length < 6) {
      Swal.fire('Error!', 'Password must be at least 6 characters', 'error');
      return;
    }
    
    try {
      await apiPut('/api/User/change-password', {
        currentPassword: passwordData.current,
        newPassword: passwordData.new
      });
      Swal.fire('Success!', 'Password changed successfully', 'success');
      setShowPasswordSection(false);
      setPasswordData({ current: '', new: '', confirm: '' });
    } catch (error) {
      Swal.fire('Error!', 'Failed to change password', 'error');
    }
  };

  // Toggle dietary preference
  const toggleDietaryPreference = (pref: string) => {
    setEditingData(prev => ({
      ...prev,
      dietaryPreferences: prev.dietaryPreferences.includes(pref)
        ? prev.dietaryPreferences.filter(p => p !== pref)
        : [...prev.dietaryPreferences, pref]
    }));
  };

  // Cancel reservation
  const cancelReservation = async (reservationId: number, restaurantName: string) => {
    const result = await Swal.fire({
      title: 'Cancel Reservation?',
      html: `Are you sure you want to cancel your reservation at <strong>${restaurantName}</strong>?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, cancel it!',
      cancelButtonText: 'No, keep it'
    });

    if (result.isConfirmed) {
      try {
        const response = await cancelReservationApi(reservationId);
        if (response?.succeeded) {
          await Swal.fire('Cancelled!', 'Your reservation has been cancelled.', 'success');
          await loadReservations();
        } else {
          await Swal.fire('Error!', response?.message || 'Failed to cancel reservation', 'error');
        }
      } catch (error) {
        await Swal.fire('Error!', 'Network error occurred. Please try again.', 'error');
      }
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

  // Handle standalone password change (from main page button)
  const handleStandalonePasswordChange = async () => {
    if (standalonePasswordData.new !== standalonePasswordData.confirm) {
      Swal.fire('Error!', 'New passwords do not match', 'error');
      return;
    }
    if (standalonePasswordData.new.length < 6) {
      Swal.fire('Error!', 'Password must be at least 6 characters', 'error');
      return;
    }
    
    try {
      await apiPut('/api/User/change-password', {
        currentPassword: standalonePasswordData.current,
        newPassword: standalonePasswordData.new
      });
      Swal.fire('Success!', 'Password changed successfully', 'success');
      setShowPasswordModal(false);
      setStandalonePasswordData({ current: '', new: '', confirm: '' });
    } catch (error) {
      Swal.fire('Error!', 'Failed to change password', 'error');
    }
  };

  useEffect(() => {
    loadReservations();
    loadProfileData();
  }, []);

  // Filter reservations
  const upcomingReservations = Array.isArray(reservations) 
    ? reservations.filter(r => ['Pending', 'Approved'].includes(r.status))
    : [];
  const pastReservations = Array.isArray(reservations)
    ? reservations.filter(r => ['Completed', 'Cancelled', 'Rejected'].includes(r.status))
    : [];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
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

  if (loading && reservations.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-5">
      {/* Header */}
     <div className="max-w-4xl mx-auto  sm:px-6 lg:px-8 py-4">
      <button 
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium transition-colors duration-200 cursor-pointer"
      >
        ← Back to Home
      </button>
    </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Profile Card */}
        <Card className="mb-8 bg-gray-50 overflow-hidden">
          {/* Avatar and Header Section */}
          <div className="flex flex-col items-center text-center border-b border-gray-100 pb-6">
            <div className="relative mb-4">
              <div className="w-24 h-24 bg-emerald-700 rounded-full flex items-center justify-center shadow-lg">
                <FaUserCircle className="text-white text-5xl" />
              </div>
            </div>
            {/* <h2 className="text-2xl font-bold text-gray-900">{user?.displayName || 'John Doe'}</h2> */}

            <div className="inline-flex items-center gap-2 bg-emerald-50 rounded-full px-2 mb-2 shadow-sm">
              <span className="relative flex h-2 w-2">
                {/* <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span> */}
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-300"></span>
              </span>
              <span className="text-sm font-medium text-gray-700">
                Member since {new Date().getFullYear()}
              </span>
            </div>

            <h2 className="text-2xl font-bold text-gray-900">
              {capitalizeName(user?.displayName)}
            </h2>

          </div>

          {/* Personal Information */}
          <div className="flex justify-between border-b border-gray-100 py-5">
            <div className=''>
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaUser className="text-emerald-600" /> Personal Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-600">
                  <FaEnvelope className="text-gray-500 w-4 h-4" />
                  <span>{user?.email || ''}</span>
                </div>
              </div>
            </div>
            <Button 
              size="sm" 
              className="mt-3 bg-gray-400 hover:bg-gray-500 cursor-pointer"
              onClick={() => setIsEditingProfile(true)}
            >
              <FaEdit className="mr-2" /> Edit Profile
            </Button>
          </div>

          {/* Notification Settings */}
          <div className="border-b border-gray-100 py-5">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FaBell className="text-emerald-600" /> Notification Settings
            </h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={profileData.emailReminders}
                  readOnly
                  className="w-4 h-4 text-gray-600 rounded focus:ring-gray-500"
                />
                <span className="text-gray-700">Email reminders</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={profileData.smsReminders}
                  readOnly
                  className="w-4 h-4 text-gray-600 rounded focus:ring-gray-500"
                />
                <span className="text-gray-700">SMS reminders</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-5 flex flex-col sm:flex-row gap-3 max-w-xs mx-auto">
            <Button
              onClick={() => setShowLogoutModal(true)}
              className="flex-1 bg-red-500 cursor-pointer hover:bg-red-600 "
            >
              <FaSignOutAlt className="mr-2" /> LogOut
            </Button>
          </div>

          {/* <div className="text-center">
        <p className="text-sm text-gray-400">Member since {new Date().getFullYear()}</p>
      </div> */}
        </Card>

        {/* Tabs for Reservations vs Profile Settings */}
        {/* <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 px-6 py-3 text-sm font-medium transition ${
                activeTab === 'profile'
                  ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Profile Settings
            </button>
            <button
              onClick={() => setActiveTab('reservations')}
              className={`flex-1 px-6 py-3 text-sm font-medium transition ${
                activeTab === 'reservations'
                  ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              My Reservations
            </button>
          </div>
        </div> */}

        {activeTab === 'reservations' && (
          <>
            {/* Reservation Sub-tabs */}
            {/* <div className="flex gap-2 mb-6">
              <button
                onClick={() => setReservationSubTab('upcoming')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  reservationSubTab === 'upcoming'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Upcoming ({upcomingReservations.length})
              </button>
              <button
                onClick={() => setReservationSubTab('past')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  reservationSubTab === 'past'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Past ({pastReservations.length})
              </button>
            </div> */}

            {/* Reservations List */}
            {/* <div className="space-y-4">
              {(reservationSubTab === 'upcoming' ? upcomingReservations : pastReservations).length === 0 ? (
                <Card className="text-center py-12">
                  <FaCalendarAlt className="text-gray-400 text-5xl mb-4 mx-auto" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No {reservationSubTab} reservations
                  </h3>
                  <p className="text-gray-600">
                    {reservationSubTab === 'upcoming' 
                      ? 'You have no upcoming reservations. Start exploring now!' 
                      : 'Your dining history will appear here'}
                  </p>
                  {reservationSubTab === 'upcoming' && (
                    <Button 
                      onClick={() => navigate('/spots')} 
                      className="mt-4 bg-emerald-600 hover:bg-emerald-700 max-w-xs mx-auto"
                    >
                      View all spots
                    </Button>
                  )}
                </Card>
              ) : (
                (reservationSubTab === 'upcoming' ? upcomingReservations : pastReservations).map((reservation) => (
                  <Card key={reservation.id} className="hover:shadow-lg transition-shadow">
                    <div className="p-4">
                      <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <FaUtensils className="text-emerald-600 text-lg" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {reservation.restaurantName}
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
                              </div>
                              {reservation.notes && (
                                <p className="mt-2 text-sm text-gray-500 italic">"{reservation.notes}"</p>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${getStatusColor(reservation.status)}-100 text-${getStatusColor(reservation.status)}-700`}>
                            {reservation.status}
                          </span>
                          <div className="flex gap-2">
                            {reservationSubTab === 'upcoming' && reservation.status === 'Approved' && (
                              <Button 
                                size="sm" 
                                color="failure"
                                onClick={() => cancelReservation(reservation.id, reservation.restaurantName)}
                              >
                                Cancel
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
            </div> */}
          </>
        )}
      </div>

      {/* Edit Profile Modal - NOW WITH CHANGE PASSWORD BUTTON INSIDE */}
      <Modal show={isEditingProfile} onClose={() => {
        setIsEditingProfile(false);
        setShowPasswordSection(false);
        setPasswordData({ current: '', new: '', confirm: '' });
      }} size="lg">
        <ModalHeader>Edit Profile</ModalHeader>
        <ModalBody>
          <div className="space-y-5">
            {/* Phone Number */}
            <div>
              <Label htmlFor="phone" value="Phone Number" />
              <TextInput
                id="phone"
                type="tel"
                placeholder="+1 234 567 8900"
                value={editingData.phoneNumber}
                onChange={(e) => setEditingData({ ...editingData, phoneNumber: e.target.value })}
                className="mt-1"
              />
            </div>
            
            {/* Default Guests */}
            <div>
              <Label htmlFor="guests" value="Default Number of Guests" />
              <select
                id="guests"
                value={editingData.defaultGuests}
                onChange={(e) => setEditingData({ ...editingData, defaultGuests: parseInt(e.target.value) })}
                className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm focus:border-emerald-500 focus:ring-emerald-500"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                  <option key={num} value={num}>{num} {num === 1 ? 'guest' : 'guests'}</option>
                ))}
              </select>
            </div>
            
            {/* Dietary Preferences */}
            {/* <div>
              <Label value="Dietary Preferences" />
              <div className="flex flex-wrap gap-2 mt-2">
                {dietaryOptions.map(option => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => toggleDietaryPreference(option)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                      editingData.dietaryPreferences.includes(option)
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div> */}
            
            {/* Notification Settings */}
            <div>
              <Label value="Notification Preferences" />
              <div className="space-y-2 mt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingData.emailReminders}
                    onChange={(e) => setEditingData({ ...editingData, emailReminders: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <span className="text-gray-700">Email reminders</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingData.smsReminders}
                    onChange={(e) => setEditingData({ ...editingData, smsReminders: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <span className="text-gray-700">SMS reminders</span>
                </label>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 my-2"></div>

            {/* Change Password Section - Toggle Button */}
            <div>
              <Button
                type="button"
                color="light"
                onClick={() => setShowPasswordSection(!showPasswordSection)}
                className="w-full border border-gray-300"
              >
                <FaKey className="mr-2" />
                {showPasswordSection ? 'Hide' : 'Change Password'}
              </Button>
            </div>

            {/* Password Change Fields - Conditionally Shown */}
            {showPasswordSection && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800">Update Password</h4>
                <div>
                  <Label htmlFor="current-password" value="Current Password" />
                  <TextInput
                    id="current-password"
                    type="password"
                    placeholder="Enter current password"
                    value={passwordData.current}
                    onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="new-password" value="New Password" />
                  <TextInput
                    id="new-password"
                    type="password"
                    placeholder="Enter new password (min. 6 characters)"
                    value={passwordData.new}
                    onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="confirm-password" value="Confirm New Password" />
                  <TextInput
                    id="confirm-password"
                    type="password"
                    placeholder="Confirm new password"
                    value={passwordData.confirm}
                    onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <Button
                  size="sm"
                  onClick={handleInlinePasswordChange}
                  className="bg-emerald-600 hover:bg-emerald-700 w-full"
                >
                  Update Password
                </Button>
              </div>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button onClick={saveProfileChanges} className="bg-emerald-600 hover:bg-emerald-700">
            Save All Changes
          </Button>
          <Button color="gray" onClick={() => {
            setIsEditingProfile(false);
            setShowPasswordSection(false);
            setPasswordData({ current: '', new: '', confirm: '' });
          }}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>

      {/* Standalone Change Password Modal (kept for reference, but hidden) */}
      {/* You can remove this modal entirely if you want, since password change is now inside Edit Profile */}

      {/* Logout Modal */}
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
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors cursor-pointer disabled:opacity-50"
              >
                Stay Logged In
              </button>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors cursor-pointer flex items-center gap-2 min-w-[120px] justify-center"
              >
                {isLoggingOut ? <><FaSpinner className="animate-spin" /> Logging out...</> : 'Logout'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      
    </div>
  );
}