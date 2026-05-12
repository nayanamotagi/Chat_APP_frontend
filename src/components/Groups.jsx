import { useState, useEffect } from 'react';
import { groupsAPI } from '../api/groups';
import { usersAPI } from '../api/users';
import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import { FiPlus, FiUsers, FiSettings, FiX, FiSearch } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Groups({ onClose, onSelectGroup }) {
  const { user } = useAuthStore();
  const { setActiveChat } = useChatStore();
  const [groups, setGroups] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      const response = await groupsAPI.getGroups();
      setGroups(response.data.groups || []);
    } catch (error) {
      console.error('Failed to load groups:', error);
      toast.error('Failed to load groups');
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      const response = await usersAPI.searchUsers(query);
      setSearchResults(response.data.users || []);
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      toast.error('Group name is required');
      return;
    }

    setLoading(true);
    try {
      const response = await groupsAPI.createGroup(groupName, selectedUsers);
      toast.success('Group created successfully');
      setShowCreate(false);
      setGroupName('');
      setSelectedUsers([]);
      loadGroups();
      if (onSelectGroup) {
        onSelectGroup(response.data.group);
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectGroup = async (group) => {
    try {
      const groupData = await groupsAPI.getGroup(group._id);
      if (groupData.data.group.chatId) {
        setActiveChat({ ...groupData.data.group, type: 'group' });
        if (onSelectGroup) {
          onSelectGroup(groupData.data.group);
        }
      }
    } catch (error) {
      toast.error('Failed to load group');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex">
      <div className="w-full md:w-96 bg-white dark:bg-dark-800 h-full flex flex-col">
        <div className="h-16 px-4 bg-primary-500 dark:bg-primary-600 flex items-center justify-between">
          <h2 className="text-white font-semibold">Groups</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCreate(true)}
              className="p-2 hover:bg-primary-600 dark:hover:bg-primary-700 rounded-lg transition-colors"
            >
              <FiPlus className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-primary-600 dark:hover:bg-primary-700 rounded-lg transition-colors"
            >
              <FiX className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {showCreate ? (
          <div className="flex-1 overflow-y-auto p-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Group Name
              </label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                placeholder="Enter group name"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Add Members
              </label>
              <div className="relative mb-2">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                  placeholder="Search users..."
                />
              </div>
              {searchResults.length > 0 && (
                <div className="border border-gray-200 dark:border-dark-700 rounded-lg max-h-40 overflow-y-auto">
                  {searchResults.map((user) => (
                    <button
                      key={user._id}
                      onClick={() => toggleUserSelection(user._id)}
                      className={`w-full px-4 py-2 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-dark-700 ${
                        selectedUsers.includes(user._id) ? 'bg-primary-50 dark:bg-primary-900' : ''
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white">
                        {user.profilePhoto ? (
                          <img src={`/api/uploads/${user.profilePhoto}`} alt="" className="w-full h-full rounded-full object-cover" />
                        ) : (
                          user.displayName?.[0]?.toUpperCase() || '?'
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {user.displayName}
                        </div>
                      </div>
                      {selectedUsers.includes(user._id) && (
                        <div className="w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowCreate(false);
                  setGroupName('');
                  setSelectedUsers([]);
                  setSearchQuery('');
                }}
                className="flex-1 bg-gray-200 dark:bg-dark-700 hover:bg-gray-300 dark:hover:bg-dark-600 text-gray-700 dark:text-gray-300 font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGroup}
                disabled={loading || !groupName.trim()}
                className="flex-1 bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Group'}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {groups.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                <FiUsers className="w-16 h-16 mb-4" />
                <p className="text-lg font-medium">No groups yet</p>
                <p className="text-sm">Create your first group</p>
              </div>
            ) : (
              groups.map((group) => (
                <button
                  key={group._id}
                  onClick={() => handleSelectGroup(group)}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors border-b border-gray-100 dark:border-dark-700"
                >
                  <div className="w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center text-white font-semibold">
                    {group.profilePhoto ? (
                      <img src={`/api/uploads/${group.profilePhoto}`} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      group.name?.[0]?.toUpperCase() || 'G'
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 dark:text-white truncate">
                      {group.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {group.memberIds?.length || 0} members
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>
      <div className="flex-1" onClick={onClose} />
    </div>
  );
}

