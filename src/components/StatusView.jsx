import { useState, useEffect } from 'react';
import { statusAPI } from '../api/status';
import { FiX, FiCamera, FiImage, FiVideo } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function StatusView({ onClose }) {
  const [statuses, setStatuses] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCreate, setShowCreate] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [statusType, setStatusType] = useState('text');
  const [statusFile, setStatusFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStatuses();
  }, []);

  const loadStatuses = async () => {
    try {
      const response = await statusAPI.getContactsStatus();
      setStatuses(response.data.statuses || []);
    } catch (error) {
      console.error('Failed to load statuses:', error);
    }
  };

  const handleCreateStatus = async () => {
    if (statusType === 'text' && !statusText.trim()) {
      toast.error('Status text is required');
      return;
    }
    if (statusType !== 'text' && !statusFile) {
      toast.error('Please select a file');
      return;
    }

    setLoading(true);
    try {
      await statusAPI.createStatus(statusType, statusText, statusFile);
      toast.success('Status created');
      setShowCreate(false);
      setStatusText('');
      setStatusFile(null);
      loadStatuses();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create status');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setStatusFile(file);
      setStatusType(file.type.startsWith('image/') ? 'image' : 'video');
    }
  };

  const currentStatus = statuses[currentIndex];

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      {showCreate ? (
        <div className="bg-white dark:bg-dark-800 rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create Status</h2>
            <button
              onClick={() => {
                setShowCreate(false);
                setStatusText('');
                setStatusFile(null);
              }}
              className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg"
            >
              <FiX className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setStatusType('text')}
                  className={`flex-1 py-2 px-4 rounded-lg ${
                    statusType === 'text'
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Text
                </button>
                <button
                  onClick={() => setStatusType('image')}
                  className={`flex-1 py-2 px-4 rounded-lg ${
                    statusType === 'image'
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <FiImage className="inline w-4 h-4 mr-2" />
                  Image
                </button>
                <button
                  onClick={() => setStatusType('video')}
                  className={`flex-1 py-2 px-4 rounded-lg ${
                    statusType === 'video'
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <FiVideo className="inline w-4 h-4 mr-2" />
                  Video
                </button>
              </div>
            </div>

            {statusType === 'text' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status Text
                </label>
                <textarea
                  value={statusText}
                  onChange={(e) => setStatusText(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                  placeholder="What's on your mind?"
                  maxLength={500}
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {statusType === 'image' ? 'Image' : 'Video'}
                </label>
                <input
                  type="file"
                  accept={statusType === 'image' ? 'image/*' : 'video/*'}
                  onChange={handleFileSelect}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700"
                />
                {statusFile && (
                  <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Selected: {statusFile.name}
                  </div>
                )}
              </div>
            )}

            <button
              onClick={handleCreateStatus}
              disabled={loading}
              className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Status'}
            </button>
          </div>
        </div>
      ) : (
        <>
          {statuses.length > 0 && currentStatus ? (
            <div className="relative w-full h-full flex items-center justify-center">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70"
              >
                <FiX className="w-6 h-6" />
              </button>

              <div className="max-w-2xl w-full h-full flex flex-col">
                {currentStatus.statuses?.map((status, idx) => (
                  <div key={status._id} className="flex-1 flex items-center justify-center bg-gray-900">
                    {status.type === 'text' ? (
                      <div className="text-white text-2xl p-8 text-center">
                        {status.content?.text}
                      </div>
                    ) : status.type === 'image' ? (
                      <img
                        src={`/api/uploads/${status.content.mediaUrl}`}
                        alt="Status"
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : (
                      <video
                        src={`/api/uploads/${status.content.mediaUrl}`}
                        controls
                        className="max-w-full max-h-full"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-dark-800 rounded-lg p-8 text-center">
              <FiCamera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Status</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">No status updates available</p>
              <button
                onClick={() => setShowCreate(true)}
                className="bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2 px-6 rounded-lg"
              >
                Create Status
              </button>
              <button
                onClick={onClose}
                className="ml-4 bg-gray-200 dark:bg-dark-700 hover:bg-gray-300 dark:hover:bg-dark-600 text-gray-700 dark:text-gray-300 font-semibold py-2 px-6 rounded-lg"
              >
                Close
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

