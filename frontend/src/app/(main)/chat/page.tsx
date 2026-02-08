'use client';

import { useState, useEffect } from 'react';
import { useAuthStore, useChatStore } from '@/stores';
import { socketService } from '@/lib/socket';
import { formatDate } from '@/utils/helpers';

export default function ChatPage() {
  const { user } = useAuthStore();
  const { conversations, messages, onlineUsers, typingUsers, addMessage, setOnlineUsers, addTypingUser, removeTypingUser } = useChatStore();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    // Connect to WebSocket
    const token = useAuthStore.getState().tokens?.accessToken;
    if (token) {
      const socket = socketService.connect(token);

      // Listen for messages
      socket.on('message:new', (message: any) => {
        addMessage(message);
      });

      // Listen for online status
      socket.on('user:online', (userIds: string[]) => {
        setOnlineUsers(new Set(userIds));
      });

      // Listen for typing
      socket.on('user:typing', ({ userId, conversationId }: any) => {
        addTypingUser(userId);
        setTimeout(() => removeTypingUser(userId), 3000);
      });

      return () => {
        socketService.disconnect();
      };
    }
  }, []);

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedConversation) return;

    const message = {
      conversationId: selectedConversation,
      content: messageInput,
      senderId: user?.id,
    };

    socketService.emit('message:send', message);
    setMessageInput('');
    setIsTyping(false);
  };

  const handleTyping = () => {
    if (!isTyping && selectedConversation) {
      setIsTyping(true);
      socketService.emit('user:typing', { conversationId: selectedConversation });
      setTimeout(() => setIsTyping(false), 3000);
    }
  };

  const conversationMessages = selectedConversation
    ? messages.filter((m) => m.conversationId === selectedConversation)
    : [];

  return (
    <div className="h-screen bg-gray-50 flex">
      {/* Conversations List */}
      <div className="w-80 bg-white border-r overflow-y-auto">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold">Messages</h2>
        </div>
        
        <div className="divide-y">
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No conversations yet
            </div>
          ) : (
            conversations.map((conv) => {
              const otherUser = conv.participants.find((p) => p.id !== user?.id);
              const isOnline = otherUser ? onlineUsers.has(otherUser.id) : false;
              
              return (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv.id)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 ${
                    selectedConversation === conv.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center font-bold">
                        {otherUser?.username.charAt(0).toUpperCase()}
                      </div>
                      {isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{otherUser?.full_name}</div>
                      <div className="text-sm text-gray-500 truncate">
                        {conv.lastMessage || 'No messages yet'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200" />
                <div>
                  <div className="font-medium">User Name</div>
                  <div className="text-sm text-gray-500">
                    {typingUsers.size > 0 ? 'Typing...' : 'Online'}
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {conversationMessages.map((message) => {
                const isOwn = message.senderId === user?.id;
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-md px-4 py-2 rounded-lg ${
                        isOwn
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border border-gray-200'
                      }`}
                    >
                      <div>{message.content}</div>
                      <div
                        className={`text-xs mt-1 ${
                          isOwn ? 'text-blue-100' : 'text-gray-500'
                        }`}
                      >
                        {formatDate(message.created_at)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input */}
            <div className="p-4 border-t bg-white">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => {
                    setMessageInput(e.target.value);
                    handleTyping();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleSendMessage}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <div className="text-6xl mb-4">💬</div>
              <div className="text-xl font-medium">Select a conversation</div>
              <div className="text-sm">Choose a chat to start messaging</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
