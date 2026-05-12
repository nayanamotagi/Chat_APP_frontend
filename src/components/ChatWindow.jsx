import { useEffect, useRef, useState } from 'react';
import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import { chatAPI } from '../api/chat';
import { callsAPI } from '../api/calls';
import { socketService } from '../services/socket';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import { FiArrowLeft, FiMenu, FiPhone, FiVideo } from 'react-icons/fi';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function ChatWindow({ chat, onBack, onMenuClick }) {
  const { messages, addMessage, setMessages, typingUsers } = useChatStore();
  const { user } = useAuthStore();
  const messagesEndRef = useRef(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const chatMessages = messages[chat._id] || [];

  useEffect(() => {
    if (chat._id) {
      loadMessages();
      socketService.joinChat(chat._id);
      socketService.markAsRead(chat._id);
    }

    return () => {
      if (chat._id) {
        socketService.leaveChat(chat._id);
      }
    };
  }, [chat._id]);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const loadMessages = async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const response = await chatAPI.getMessages(chat._id, page);
      const newMessages = response.data.messages || [];
      
      if (newMessages.length === 0) {
        setHasMore(false);
      } else {
        setMessages(chat._id, [...newMessages, ...chatMessages]);
        setPage(page + 1);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (text, type, media, replyTo) => {
    try {
      let response;
      if (type === 'text') {
        response = await chatAPI.sendTextMessage(chat._id, text, replyTo);
      } else if (media) {
        const formData = new FormData();
        formData.append('media', media);
        formData.append('type', type);
        if (replyTo) formData.append('replyTo', replyTo);
        response = await chatAPI.sendMediaMessage(chat._id, formData);
      }

      // Add message optimistically to UI immediately
      if (response?.data?.message) {
        addMessage(chat._id, response.data.message);
      }
      
      // Message will also be added via socket event (for other participants)
      // Duplicate prevention in store will handle if same message arrives twice
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to send message');
    }
  };

  const getChatName = () => {
    if (chat.type === 'group') {
      return chat.name || 'Group Chat';
    }
    const other = chat.otherParticipant || chat.participants?.find(p => p._id !== user?.id);
    return other?.displayName || 'Unknown';
  };

  const getChatAvatar = () => {
    if (chat.type === 'group') {
      return chat.profilePhoto || null;
    }
    const other = chat.otherParticipant || chat.participants?.find(p => p._id !== user?.id);
    return other?.profilePhoto || null;
  };

  const isTyping = typingUsers[chat._id];

  const handleVoiceCall = async () => {
    try {
      const otherUserId = chat.type === 'private' 
        ? (chat.otherParticipant?._id || chat.participants?.find(p => p._id !== user?.id)?._id)
        : null;
      
      if (!otherUserId) {
        toast.error('Cannot initiate call');
        return;
      }

      await callsAPI.createCall('voice', 'one-to-one', chat._id, null, [otherUserId]);
      toast.success('Call initiated');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to initiate call');
    }
  };

  const handleVideoCall = async () => {
    try {
      const otherUserId = chat.type === 'private'
        ? (chat.otherParticipant?._id || chat.participants?.find(p => p._id !== user?.id)?._id)
        : null;
      
      if (!otherUserId) {
        toast.error('Cannot initiate call');
        return;
      }

      await callsAPI.createCall('video', 'one-to-one', chat._id, null, [otherUserId]);
      toast.success('Video call initiated');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to initiate call');
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50 dark:bg-dark-900">
      {/* Header */}
      <div className="h-16 px-4 bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-dark-700 flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            onClick={onBack}
            className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
          >
            <FiArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
          <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
            {getChatAvatar() ? (
              <img
                src={`/api/uploads/${getChatAvatar()}`}
                alt=""
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              getChatName()?.[0]?.toUpperCase() || '?'
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 dark:text-white truncate">
              {getChatName()}
            </div>
            {isTyping ? (
              <div className="text-xs text-primary-500">typing...</div>
            ) : chat.otherParticipant?.isOnline ? (
              <div className="text-xs text-gray-500 dark:text-gray-400">online</div>
            ) : chat.otherParticipant?.lastSeen ? (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                last seen {format(new Date(chat.otherParticipant.lastSeen), 'HH:mm')}
              </div>
            ) : null}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleVoiceCall}
            className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
          >
            <FiPhone className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
          <button
            onClick={handleVideoCall}
            className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
          >
            <FiVideo className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
          <button
            onClick={onMenuClick}
            className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
          >
            <FiMenu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 scrollbar-hide">
        {loading && page > 1 && (
          <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-2">
            Loading...
          </div>
        )}
        
        {chatMessages.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <div className="text-6xl mb-4">💬</div>
            <p className="text-lg font-medium">No messages yet</p>
            <p className="text-sm">Start the conversation</p>
          </div>
        ) : (
          chatMessages.map((message, index) => {
            const prevMessage = chatMessages[index - 1];
            const showDate = !prevMessage || 
              format(new Date(message.createdAt), 'dd/MM/yyyy') !== 
              format(new Date(prevMessage.createdAt), 'dd/MM/yyyy');

            return (
              <div key={message._id}>
                {showDate && (
                  <div className="text-center text-xs text-gray-500 dark:text-gray-400 my-4">
                    {format(new Date(message.createdAt), 'MMMM d, yyyy')}
                  </div>
                )}
                <MessageBubble
                  message={message}
                  isOwn={message.senderId._id === user?.id || message.senderId === user?.id}
                />
              </div>
            );
          })
        )}
        
        {isTyping && (
          <div className="flex items-center gap-2 px-4 py-2">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">typing...</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <MessageInput onSend={handleSendMessage} chatId={chat._id} />
    </div>
  );
}

