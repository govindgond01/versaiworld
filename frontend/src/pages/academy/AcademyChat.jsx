import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiMessageSquare } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import ChatMessage from '../../components/notifications/ChatMessage';
import ChatInput from '../../components/notifications/ChatInput';
import { getChatThread, sendChatMessage, markThreadAsRead } from '../../services/notificationService';

const AcademyChat = () => {
  const { threadId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (threadId) {
      loadThread();
    }
  }, [threadId]);

  const loadThread = async () => {
    try {
      setLoading(true);
      const data = await getChatThread(threadId);
      setMessages(data.messages || []);
      await markThreadAsRead(threadId);
    } catch (error) {
      toast.error('Failed to load chat');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (data) => {
    try {
      setSending(true);
      const response = await sendChatMessage({
        message: data.message,
        parentId: messages[messages.length - 1]?._id,
        attachments: data.attachments
      });
      
      const newMessage = response.data.chatMessage;
      setMessages([...messages, newMessage]);
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const otherUser = messages[0]?.metadata?.fromUserName || 'Admin';

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center gap-3">
        <button
          onClick={() => navigate('/academy/notifications')}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h2 className="font-semibold">Chat with {otherUser}</h2>
          <p className="text-xs text-gray-500">{messages.length} messages</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12">
            <FiMessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No messages yet. Start chatting!</p>
          </div>
        ) : (
          messages.map(msg => (
            <ChatMessage
              key={msg._id}
              message={msg}
              isOwn={msg.direction === 'outgoing'}
            />
          ))
        )}
      </div>

      {/* Input */}
      <ChatInput
        onSend={handleSend}
        loading={sending}
        placeholder="Type your message..."
      />
    </div>
  );
};

export default AcademyChat;