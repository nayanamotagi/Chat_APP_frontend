import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { authAPI } from '../api/auth';
import { usersAPI } from '../api/users';
import { FiX, FiUser, FiSettings, FiLogOut, FiCamera, FiUsers, FiImage, FiMessageCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Sidebar({ onClose, darkMode, toggleDarkMode, onShowGroups, onShowStatus }) {
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      logout();
      toast.success('Logged out successfully');
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      // Still logout locally even if API call fails
      logout();
      toast.success('Logged out');
      window.location.href = '/login';
    }
  };

  const handleUpdateProfile = async () => {
    try {
      await usersAPI.updateProfile({ displayName, username, bio });
      toast.success('Profile updated');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update profile');
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      await usersAPI.uploadProfilePhoto(file);
      toast.success('Profile photo updated');
      window.location.reload();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to upload photo');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex">
      <div className="w-80 bg-white dark:bg-dark-800 h-full flex flex-col">
        <div className="h-16 px-4 bg-primary-500 dark:bg-primary-600 flex items-center justify-between">
          <h2 className="text-white font-semibold">Menu</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-primary-600 dark:hover:bg-primary-700 rounded-lg transition-colors"
          >
            <FiX className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4 border-b border-gray-200 dark:border-dark-700">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-primary-500 flex items-center justify-center text-white font-semibold text-xl">
                  {user?.profilePhoto ? (
                    <img
                      src={`/api/uploads/${user.profilePhoto}`}
                      alt=""
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    user?.displayName?.[0]?.toUpperCase() || '?'
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-primary-500 text-white p-1.5 rounded-full cursor-pointer hover:bg-primary-600">
                  <FiCamera className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 dark:text-white truncate">
                  {user?.displayName}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {user?.email}
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 space-y-2">
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'profile'
                  ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                  : 'hover:bg-gray-100 dark:hover:bg-dark-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <FiUser className="w-5 h-5" />
              <span>Profile</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('groups');
                if (onShowGroups) onShowGroups();
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'groups'
                  ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                  : 'hover:bg-gray-100 dark:hover:bg-dark-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <FiUsers className="w-5 h-5" />
              <span>Groups</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('status');
                if (onShowStatus) onShowStatus();
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'status'
                  ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                  : 'hover:bg-gray-100 dark:hover:bg-dark-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <FiMessageCircle className="w-5 h-5" />
              <span>Status</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'settings'
                  ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                  : 'hover:bg-gray-100 dark:hover:bg-dark-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <FiSettings className="w-5 h-5" />
              <span>Settings</span>
            </button>
          </div>

          {activeTab === 'profile' && (
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Bio
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  maxLength={150}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white resize-none"
                />
              </div>
              <button
                onClick={handleUpdateProfile}
                className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Save Changes
              </button>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">Dark Mode</span>
                <button
                  onClick={toggleDarkMode}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    darkMode ? 'bg-primary-500' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      darkMode ? 'transform translate-x-6' : ''
                    }`}
                  />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-dark-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white font-semibold transition-colors shadow-md hover:shadow-lg"
          >
            <FiLogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
      <div className="flex-1" onClick={onClose} />
    </div>
  );
}

