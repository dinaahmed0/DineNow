import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, Button, Modal, ModalHeader, ModalBody, ModalFooter, TextInput, Label } from 'flowbite-react';
import Swal from 'sweetalert2';
import {
  FaUser,
  FaSignOutAlt,
  FaSpinner,
  FaEnvelope,
  FaEdit,
  FaUserCircle,
  FaBell,
  FaKey,
  FaCalendarAlt,
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { APP_ROUTES } from '../../constants/routes';
import { changePassword } from '../../services/auth';

interface LocalProfilePrefs {
  defaultGuests: number;
  emailReminders: boolean;
  smsReminders: boolean;
}

const DEFAULT_PREFS: LocalProfilePrefs = {
  defaultGuests: 2,
  emailReminders: true,
  smsReminders: false,
};

const PREFS_STORAGE_KEY = 'profilePreferences';

function capitalizeName(name: string): string {
  if (!name) return 'Guest';
  return name
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function loadLocalPrefs(email: string): LocalProfilePrefs {
  try {
    const raw = localStorage.getItem(PREFS_STORAGE_KEY);
    if (!raw) return DEFAULT_PREFS;
    const all = JSON.parse(raw) as Record<string, LocalProfilePrefs>;
    return { ...DEFAULT_PREFS, ...all[email] };
  } catch {
    return DEFAULT_PREFS;
  }
}

function saveLocalPrefs(email: string, prefs: LocalProfilePrefs): void {
  try {
    const raw = localStorage.getItem(PREFS_STORAGE_KEY);
    const all = raw ? (JSON.parse(raw) as Record<string, LocalProfilePrefs>) : {};
    all[email] = prefs;
    localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(all));
  } catch (error) {
    console.error('Failed to save profile preferences:', error);
  }
}

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [prefs, setPrefs] = useState<LocalProfilePrefs>(DEFAULT_PREFS);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editingPrefs, setEditingPrefs] = useState<LocalProfilePrefs>(DEFAULT_PREFS);

  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const [changingPassword, setChangingPassword] = useState(false);

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (user?.email) {
      const loaded = loadLocalPrefs(user.email);
      setPrefs(loaded);
      setEditingPrefs(loaded);
    }
  }, [user?.email]);

  const saveProfileChanges = () => {
    if (!user?.email) return;
    saveLocalPrefs(user.email, editingPrefs);
    setPrefs(editingPrefs);
    setIsEditingProfile(false);
    setShowPasswordSection(false);
    setPasswordData({ current: '', new: '', confirm: '' });
    Swal.fire('Saved', 'Your preferences were saved on this device.', 'success');
  };

  const handleInlinePasswordChange = async () => {
    if (passwordData.new !== passwordData.confirm) {
      Swal.fire('Error', 'New passwords do not match', 'error');
      return;
    }
    if (!PASSWORD_REGEX.test(passwordData.new)) {
      Swal.fire(
        'Error',
        'Password must be at least 8 characters with uppercase, lowercase, number, and special character (@$!%*?&).',
        'error'
      );
      return;
    }

    setChangingPassword(true);
    try {
      const response = await changePassword({
        currentPassword: passwordData.current,
        newPassword: passwordData.new,
        confirmPassword: passwordData.confirm,
      });

      if (response.succeeded) {
        Swal.fire('Success', response.message || 'Password changed successfully', 'success');
        setShowPasswordSection(false);
        setPasswordData({ current: '', new: '', confirm: '' });
      } else {
        Swal.fire('Error', response.message || 'Failed to change password', 'error');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to change password';
      Swal.fire('Error', message, 'error');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogout = () => {
    setIsLoggingOut(true);
    logout();
    setShowLogoutModal(false);
    setIsLoggingOut(false);
    navigate(APP_ROUTES.login);
  };

  const closeEditModal = () => {
    setIsEditingProfile(false);
    setShowPasswordSection(false);
    setEditingPrefs(prefs);
    setPasswordData({ current: '', new: '', confirm: '' });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please sign in to view your profile.</p>
          <Button onClick={() => navigate(APP_ROUTES.login)} className="bg-[#6B8A62]">
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-5">
      <div className="max-w-4xl mx-auto sm:px-6 lg:px-8 py-4">
        <button
          type="button"
          onClick={() => navigate(APP_ROUTES.home)}
          className="flex items-center gap-2 text-[#6B8A62] hover:text-[#5A7352] font-medium transition-colors duration-200 cursor-pointer"
        >
          ← Back to Home
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="mb-8 bg-gray-50 overflow-hidden">
          <div className="flex flex-col items-center text-center border-b border-gray-100 pb-6">
            <div className="w-24 h-24 bg-[#6B8A62] rounded-full flex items-center justify-center shadow-lg mb-4">
              <FaUserCircle className="text-white text-5xl" />
            </div>

            <div className="inline-flex items-center gap-2 bg-[#6B8A62]/10 rounded-full px-2 mb-2 shadow-sm">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#6B8A62]" />
              <span className="text-sm font-medium text-gray-700">
                Member since {new Date().getFullYear()}
              </span>
            </div>

            <h2 className="text-2xl font-bold text-gray-900">
              {capitalizeName(user.displayName)}
            </h2>
          </div>

          <div className="flex justify-between border-b border-gray-100 py-5 px-4">
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaUser className="text-[#6B8A62]" /> Account
              </h3>
              <div className="flex items-center gap-3 text-gray-600">
                <FaEnvelope className="text-gray-500 w-4 h-4 shrink-0" />
                <span>{user.email}</span>
              </div>
            </div>
            <Button
              size="sm"
              className="mt-3 bg-gray-400 hover:bg-gray-500 cursor-pointer shrink-0"
              onClick={() => {
                setEditingPrefs(prefs);
                setIsEditingProfile(true);
              }}
            >
              <FaEdit className="mr-2" /> Edit
            </Button>
          </div>

          <div className="border-b border-gray-100 py-5 px-4">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FaBell className="text-[#6B8A62]" /> Preferences
            </h3>
            <p className="text-sm text-gray-500 mb-3">
              Saved on this device for quicker booking.
            </p>
            <div className="space-y-2 text-gray-700">
              <p>Default guests: {prefs.defaultGuests}</p>
              <p>Email reminders: {prefs.emailReminders ? 'On' : 'Off'}</p>
              <p>SMS reminders: {prefs.smsReminders ? 'On' : 'Off'}</p>
            </div>
          </div>

          <div className="py-5 px-4 border-b border-gray-100">
            <Link
              to={APP_ROUTES.myReservations}
              className="flex items-center justify-center gap-2 w-full max-w-xs mx-auto py-2.5 px-4 rounded-lg bg-[#6B8A62] text-white hover:bg-[#5A7352] transition-colors"
            >
              <FaCalendarAlt />
              My Reservations
            </Link>
          </div>

          <div className="pt-5 pb-6 flex flex-col sm:flex-row gap-3 max-w-xs mx-auto px-4">
            <Button
              onClick={() => setShowLogoutModal(true)}
              className="flex-1 bg-red-500 cursor-pointer hover:bg-red-600"
            >
              <FaSignOutAlt className="mr-2" /> Log out
            </Button>
          </div>
        </Card>
      </div>

      <Modal show={isEditingProfile} onClose={closeEditModal} size="lg">
        <ModalHeader>Edit profile</ModalHeader>
        <ModalBody>
          <div className="space-y-5">
            <div>
              <Label htmlFor="guests">Default number of guests</Label>
              <select
                id="guests"
                value={editingPrefs.defaultGuests}
                onChange={(e) =>
                  setEditingPrefs({
                    ...editingPrefs,
                    defaultGuests: parseInt(e.target.value, 10),
                  })
                }
                className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm focus:border-[#6B8A62] focus:ring-[#6B8A62]"
              >
                {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? 'guest' : 'guests'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label>Notification preferences</Label>
              <div className="space-y-2 mt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingPrefs.emailReminders}
                    onChange={(e) =>
                      setEditingPrefs({ ...editingPrefs, emailReminders: e.target.checked })
                    }
                    className="w-4 h-4 text-[#6B8A62] rounded focus:ring-[#6B8A62]"
                  />
                  <span className="text-gray-700">Email reminders</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingPrefs.smsReminders}
                    onChange={(e) =>
                      setEditingPrefs({ ...editingPrefs, smsReminders: e.target.checked })
                    }
                    className="w-4 h-4 text-[#6B8A62] rounded focus:ring-[#6B8A62]"
                  />
                  <span className="text-gray-700">SMS reminders</span>
                </label>
              </div>
            </div>

            <div className="border-t border-gray-200 my-2" />

            <Button
              type="button"
              color="light"
              onClick={() => setShowPasswordSection(!showPasswordSection)}
              className="w-full border border-gray-300"
            >
              <FaKey className="mr-2" />
              {showPasswordSection ? 'Hide' : 'Change password'}
            </Button>

            {showPasswordSection && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800">Update password</h4>
                <div>
                  <Label htmlFor="current-password">Current password</Label>
                  <TextInput
                    id="current-password"
                    type="password"
                    value={passwordData.current}
                    onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="new-password">New password</Label>
                  <TextInput
                    id="new-password"
                    type="password"
                    value={passwordData.new}
                    onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="confirm-password">Confirm new password</Label>
                  <TextInput
                    id="confirm-password"
                    type="password"
                    value={passwordData.confirm}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, confirm: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
                <Button
                  size="sm"
                  onClick={handleInlinePasswordChange}
                  disabled={changingPassword}
                  className="bg-[#6B8A62] hover:bg-[#5A7352] w-full"
                >
                  {changingPassword ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" /> Updating...
                    </>
                  ) : (
                    'Update password'
                  )}
                </Button>
              </div>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button onClick={saveProfileChanges} className="bg-[#6B8A62] hover:bg-[#5A7352]">
            Save preferences
          </Button>
          <Button color="gray" onClick={closeEditModal}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>

      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 backdrop-blur-md bg-black/30" />
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <FaSignOutAlt className="text-red-600 text-2xl" />
              </div>
            </div>
            <h3 className="text-center text-xl font-semibold text-gray-900 mb-2">
              {isLoggingOut ? 'Logging out...' : 'Ready to leave?'}
            </h3>
            <p className="text-center text-gray-500 mb-6">
              You will need to sign in again to access your account.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                disabled={isLoggingOut}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
              >
                Stay signed in
              </button>
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 flex items-center gap-2 min-w-[120px] justify-center"
              >
                {isLoggingOut ? (
                  <>
                    <FaSpinner className="animate-spin" /> Logging out...
                  </>
                ) : (
                  'Log out'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

