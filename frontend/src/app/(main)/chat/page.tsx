'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore, useChatStore } from '@/stores';
import { socketService } from '@/lib/socket';
import { formatDate } from '@/utils/helpers';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { userApi } from '@/lib/api/user';
import { Search, X, ExternalLink } from 'lucide-react';
import { ROUTES } from '@/utils/constants';
import type { User as UserType } from '@/types';

export default function ChatPage() {
  const { user } = useAuthStore();
  const { conversations, messages, onlineUsers, typingUsers, addMessage, setOnlineUsers, addTypingUser, removeTypingUser, setConversations } = useChatStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [peopleSearch, setPeopleSearch] = useState('');
  const [peopleResults, setPeopleResults] = useState<UserType[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Connect to WebSocket
    const token = useAuthStore.getState().tokens?.accessToken;
    if (!token) return;

    const socket = socketService.connect(token);

    // Listen for messages
    socket.on('message:new', (message: any) => {
      addMessage(message);
    });

    // Listen for online status
    socket.on('user:online', (userIds: string[]) => {
      setOnlineUsers(userIds);
    });

    // Listen for typing
    socket.on('user:typing', ({ userId }: any) => {
      addTypingUser(userId);
      setTimeout(() => removeTypingUser(userId), 3000);
    });

    return () => {
      // Only remove our listeners; keep the socket alive for the session
      socket.off('message:new');
      socket.off('user:online');
      socket.off('user:typing');
    };
  }, []);

  // People search
  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    if (!peopleSearch.trim()) { setPeopleResults([]); return; }
    searchDebounceRef.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await userApi.searchUsers(peopleSearch);
        if (res?.data) setPeopleResults((res.data as UserType[]).slice(0, 6));
      } catch { /* ignore */ } finally {
        setSearchLoading(false);
      }
    }, 300);
  }, [peopleSearch]);

  const activeUser = conversations.find((c) => c.user.id === selectedConversation)?.user ?? null;

  const handleSelectUser = (u: UserType) => {
    const alreadyExists = conversations.some((c) => c.user.id === u.id);
    if (!alreadyExists) {
      setConversations([{ user: u, unreadCount: 0 }, ...conversations]);
    }
    setSelectedConversation(u.id);
    setPeopleSearch('');
    setPeopleResults([]);
    setShowSearch(false);
  };

  // Auto-open conversation when arriving from a blog "Message" button
  useEffect(() => {
    const userId = searchParams.get('userId');
    const username = searchParams.get('username');
    const name = searchParams.get('name');
    if (userId && username) {
      const targetUser: UserType = {
        id: userId,
        username,
        full_name: name || username,
        email: '',
        created_at: '',
        updated_at: '',
      };
      handleSelectUser(targetUser);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

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
    ? messages.filter((m) => (m.conversationId ?? m.conversation_id) === selectedConversation)
    : [];

  return (
    <div className="h-screen bg-background flex">
      {/* Conversations List */}
      <div className="w-80 bg-card border-r overflow-y-auto">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold">Messages</h2>
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
          {showSearch && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={peopleSearch}
                onChange={(e) => setPeopleSearch(e.target.value)}
                placeholder="Search people..."
                autoFocus
                className="w-full pl-9 pr-8 py-2 bg-muted/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {peopleSearch && (
                <button
                  onClick={() => { setPeopleSearch(''); setPeopleResults([]); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              {(searchLoading || peopleResults.length > 0) && (
                <div className="absolute top-full mt-1 left-0 right-0 bg-popover border border-border rounded-lg shadow-lg z-10 overflow-hidden">
                  {searchLoading && (
                    <div className="p-3 text-sm text-muted-foreground text-center flex items-center justify-center gap-2">
                      <div className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      Searching...
                    </div>
                  )}
                  {!searchLoading && peopleResults.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => handleSelectUser(u)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-accent transition-colors text-left"
                    >
                      <Avatar className="w-8 h-8 shrink-0">
                        <AvatarImage src={u.profile_picture_url} />
                        <AvatarFallback>{u.username?.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{u.full_name || u.username}</div>
                        <div className="text-xs text-muted-foreground truncate">@{u.username}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="divide-y">
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No conversations yet
            </div>
          ) : (
            conversations.map((conv) => {
              const otherUser = conv.user;
              const isOnline = otherUser ? onlineUsers.has(otherUser.id) : false;
              
              return (
                <div
                  key={otherUser.id}
                  onClick={() => setSelectedConversation(otherUser.id)}
                  className={`p-4 cursor-pointer hover:bg-accent ${
                    selectedConversation === otherUser.id ? 'bg-accent' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={otherUser?.profile_picture_url} />
                        <AvatarFallback>{otherUser?.username?.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      {isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{otherUser?.full_name || otherUser?.username}</div>
                      <div className="text-sm text-muted-foreground truncate">
                        {conv.lastMessage?.message || 'No messages yet'}
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
            <div className="p-4 border-b bg-card">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={activeUser?.profile_picture_url} />
                  <AvatarFallback>{activeUser?.username?.charAt(0).toUpperCase() ?? '?'}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div
                    className="font-medium cursor-pointer hover:underline truncate"
                    onClick={() => activeUser?.username && router.push(`${ROUTES.PROFILE}/${activeUser.username}`)}
                  >
                    {activeUser?.full_name || activeUser?.username || 'Unknown User'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {typingUsers.size > 0 ? 'Typing...' : activeUser && onlineUsers.has(activeUser.id) ? 'Online' : 'Offline'}
                  </div>
                </div>
                {activeUser?.username && (
                  <button
                    onClick={() => router.push(`${ROUTES.PROFILE}/${activeUser.username}`)}
                    className="text-muted-foreground hover:text-foreground"
                    title="View profile"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {conversationMessages.map((message) => {
                const isOwn = message.sender_id === user?.id;
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-md px-4 py-2 rounded-lg ${
                        isOwn
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-card border'
                      }`}
                    >
                      <div>{message.message}</div>
                      <div
                        className={`text-xs mt-1 ${
                          isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
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
            <div className="p-4 border-t bg-card">
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
                  className="flex-1 px-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-ring focus:outline-none"
                />
                <button
                  onClick={handleSendMessage}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                >
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
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
