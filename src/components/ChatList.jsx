import { useEffect, useState } from 'react';
import { useChatStore } from '../store/chatStore';
import { chatAPI } from '../api/chat';
import { usersAPI } from '../api/users';
import { useAuthStore } from '../store/authStore';
import { FiSearch, FiMenu, FiMoon, FiSun, FiPlus } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

export default function ChatList({ onChatSelect, onMenuClick, darkMode, toggleDarkMode }) {
  const { chats, setChats, setActiveChat } = useChatStore();
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      const response = await chatAPI.getChats();
      setChats(response.data.chats);
    } catch (error) {
      console.error('Failed to load chats:', error);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const response = await usersAPI.searchUsers(query);
      setSearchResults(response.data.users || []);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleStartChat = async (userId) => {
    try {
      const response = await chatAPI.createPrivateChat(userId);
      const chat = response.data.chat;
      setChats([chat, ...chats.filter(c => c._id !== chat._id)]);
      setActiveChat(chat);
      setShowNewChat(false);
      setSearchQuery('');
      setSearchResults([]);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to start chat');
    }
  };

  const getChatName = (chat) => {
    if (chat.type === 'group') {
      return chat.name || 'Group Chat';
    }
    const other = chat.otherParticipant || chat.participants?.find(p => p._id !== user?.id);
    return other?.displayName || 'Unknown';
  };

  const getChatAvatar = (chat) => {
    if (chat.type === 'group') {
      return chat.profilePhoto || null;
    }
    const other = chat.otherParticipant || chat.participants?.find(p => p._id !== user?.id);
    return other?.profilePhoto || null;
  };

  const getLastMessage = (chat) => {
    if (!chat.lastMessage) return 'No messages yet';
    const msg = chat.lastMessage;
    if (msg.type === 'text') return msg.content?.text || '';
    if (msg.type === 'image') return '📷 Image';
    if (msg.type === 'video') return '🎥 Video';
    if (msg.type === 'audio') return '🎤 Audio';
    if (msg.type === 'document') return '📄 Document';
    return 'Message';
  };

  const filteredChats = chats.filter(chat => {
    if (!searchQuery) return true;
    const name = getChatName(chat).toLowerCase();
    return name.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="w-full md:w-96 border-r border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-800 flex flex-col">
      {/* Header */}
      <div className="h-16 px-4 py-3 bg-primary-500 dark:bg-primary-600 flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <button
            onClick={onMenuClick}
            className="p-2 hover:bg-primary-600 dark:hover:bg-primary-700 rounded-lg transition-colors"
            title="Menu"
            aria-label="Open menu"
          >
            <FiMenu className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-white font-semibold text-lg">Chats</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleDarkMode}
            className="p-2 hover:bg-primary-600 dark:hover:bg-primary-700 rounded-lg transition-colors"
          >
            {darkMode ? (
              <FiSun className="w-5 h-5 text-white" />
            ) : (
              <FiMoon className="w-5 h-5 text-white" />
            )}
          </button>
          <button
            onClick={() => setShowNewChat(!showNewChat)}
            className="p-2 hover:bg-primary-600 dark:hover:bg-primary-700 rounded-lg transition-colors"
          >
            <FiPlus className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="p-3 bg-gray-50 dark:bg-dark-900">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search or start new chat"
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400"
          />
        </div>
      </div>

      {/* New Chat Results */}
      {showNewChat && searchResults.length > 0 && (
        <div className="border-b border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-800">
          <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
            Search Results
          </div>
          {searchResults.map((result) => (
            <button
              key={result._id}
              onClick={() => handleStartChat(result._id)}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-semibold">
                {result.profilePhoto ? (
                  <img src={`/api/uploads/${result.profilePhoto}`} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                  result.displayName?.[0]?.toUpperCase() || '?'
                )}
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium text-gray-900 dark:text-white">
                  {result.displayName}
                </div>
                {result.username && (
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    @{result.username}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <div className="text-6xl mb-4">💬</div>
            <p className="text-lg font-medium">No chats yet</p>
            <p className="text-sm">Start a new conversation</p>
          </div>
        ) : (
          filteredChats.map((chat) => (
            <button
              key={chat._id}
              onClick={() => onChatSelect(chat)}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors border-b border-gray-100 dark:border-dark-700"
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center text-white font-semibold">
                  {getChatAvatar(chat) ? (
                    <img
                      src={`/api/uploads/${getChatAvatar(chat)}`}
                      alt=""
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    getChatName(chat)?.[0]?.toUpperCase() || '?'
                  )}
                </div>
                {chat.otherParticipant?.isOnline && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-dark-800"></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="font-semibold text-gray-900 dark:text-white truncate">
                    {getChatName(chat)}
                  </div>
                  {chat.lastMessageAt && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">
                      {formatDistanceToNow(new Date(chat.lastMessageAt), { addSuffix: true })}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {getLastMessage(chat)}
                  </p>
                  {chat.unreadCount > 0 && (
                    <span className="ml-2 bg-primary-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                      {chat.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

