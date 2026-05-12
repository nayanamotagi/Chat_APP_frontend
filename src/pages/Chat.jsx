import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import { chatAPI } from '../api/chat';
import { socketService } from '../services/socket';
import ChatList from '../components/ChatList';
import ChatWindow from '../components/ChatWindow';
import Sidebar from '../components/Sidebar';
import Groups from '../components/Groups';
import StatusView from '../components/StatusView';
import { Toaster } from 'react-hot-toast';

export default function Chat() {
  const { user, token } = useAuthStore();
  const { setChats, setActiveChat, activeChat } = useChatStore();
  const [showSidebar, setShowSidebar] = useState(false);
  const [showGroups, setShowGroups] = useState(false);
  const [showStatus, setShowStatus] = useState(false);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('darkMode') === 'true' || false
  );

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    if (token && user) {
      socketService.connect(token);
      loadChats();
    }

    return () => {
      socketService.disconnect();
    };
  }, [token, user]);

  const loadChats = async () => {
    try {
      const response = await chatAPI.getChats();
      setChats(response.data.chats);
    } catch (error) {
      console.error('Failed to load chats:', error);
    }
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode.toString());
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-dark-900">
      <Toaster position="top-right" />
      
      {/* Chat List */}
      <ChatList
        onChatSelect={(chat) => setActiveChat(chat)}
        onMenuClick={() => setShowSidebar(true)}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
      />

      {/* Chat Window */}
      {activeChat ? (
        <ChatWindow
          chat={activeChat}
          onBack={() => setActiveChat(null)}
          onMenuClick={() => setShowSidebar(true)}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-100 dark:bg-dark-800">
          <div className="text-center">
            <div className="w-24 h-24 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Select a chat to start messaging
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Your conversations will appear here
            </p>
          </div>
        </div>
      )}

      {/* Sidebar */}
      {showSidebar && (
        <Sidebar
          onClose={() => setShowSidebar(false)}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          onShowGroups={() => {
            setShowSidebar(false);
            setShowGroups(true);
          }}
          onShowStatus={() => {
            setShowSidebar(false);
            setShowStatus(true);
          }}
        />
      )}

      {/* Groups */}
      {showGroups && (
        <Groups
          onClose={() => setShowGroups(false)}
          onSelectGroup={(group) => {
            setShowGroups(false);
            if (group.chatId) {
              setActiveChat({ ...group, type: 'group' });
            }
          }}
        />
      )}

      {/* Status */}
      {showStatus && (
        <StatusView onClose={() => setShowStatus(false)} />
      )}
    </div>
  );
}

