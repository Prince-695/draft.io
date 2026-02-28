'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore, useChatStore } from '@/stores';
import { formatDate } from '@/utils/helpers';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { userApi } from '@/lib/api/user';
import { chatApi } from '@/lib/api/chat';
import { Search, X, ExternalLink, Send } from 'lucide-react';
import { ROUTES } from '@/utils/constants';
import type { User as UserType } from '@/types';
import { io, Socket } from 'socket.io-client';

// Chat service runs on port 5007 — separate from the notification service (5006)
const CHAT_WS_URL = process.env.NEXT_PUBLIC_CHAT_WS_URL || 'http://localhost:5007';

export default function ChatPage() {
  const { user } = useAuthStore();
  const { conversations, messages, onlineUsers, addMessage, addOnlineUser, removeOnlineUser, addTypingUser, removeTypingUser, setConversations, setMessages } = useChatStore();
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
  const chatSocketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const selectedConvRef = useRef<string | null>(null);

  // Keep ref in sync so socket callbacks always see current value
  useEffect(() => {
    selectedConvRef.current = selectedConversation;
  }, [selectedConversation]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Normalize backend camelCase → ChatMessage snake_case type
  const normalizeMessage = (msg: any) => ({
    id: msg._id?.toString() ?? msg.id ?? '',
    sender_id: msg.senderId,
    receiver_id: msg.receiverId,
    conversation_id: msg.conversationId,
    message: msg.content,
    created_at: msg.createdAt ?? new Date().toISOString(),
  });

  useEffect(() => {
    const token = useAuthStore.getState().tokens?.accessToken;
    if (!token) return;

    // Connect directly to chat-service (port 5007), NOT the notification service (5006)
    const socket = io(CHAT_WS_URL, {
      auth: { token },
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });
    chatSocketRef.current = socket;

    socket.on('connect', () => console.log('Chat socket connected'));
    socket.on('connect_error', (e) => console.warn('Chat socket error:', e.message));

    // Backend emits 'receive_message' to the receiver
    socket.on('receive_message', (message: any) => {
      const normalized = normalizeMessage(message);
      addMessage(normalized);
      // Update conversation sidebar lastMessage
      useChatStore.setState((state) => ({
        conversations: state.conversations.map((conv) =>
          conv.user.id === normalized.sender_id
            ? { ...conv, lastMessage: normalized }
            : conv
        ),
      }));
    });

    // Backend emits 'message_sent' back to the sender as confirmation
    socket.on('message_sent', (message: any) => {
      const normalized = normalizeMessage(message);
      addMessage(normalized);
      // Update conversation sidebar lastMessage
      useChatStore.setState((state) => ({
        conversations: state.conversations.map((conv) =>
          conv.user.id === normalized.receiver_id
            ? { ...conv, lastMessage: normalized }
            : conv
        ),
      }));
    });

    // Backend broadcasts 'user_online' with { userId } when a user connects
    socket.on('user_online', ({ userId }: { userId: string }) => {
      addOnlineUser(userId);
    });

    // Backend broadcasts 'user_offline' with { userId } when a user disconnects
    socket.on('user_offline', ({ userId }: { userId: string }) => {
      removeOnlineUser(userId);
    });

    // Typing indicator
    socket.on('typing_indicator', ({ senderId, isTyping: typing }: any) => {
      if (typing) {
        addTypingUser(senderId);
        setTimeout(() => removeTypingUser(senderId), 3000);
      } else {
        removeTypingUser(senderId);
      }
    });

    return () => {
      socket.disconnect();
      chatSocketRef.current = null;
    };
  }, []);

  // Hydrate conversation list from backend on mount
  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      try {
        const res = await chatApi.getConversations();
        if (!res?.data?.length) return;
        const enriched = await Promise.all(
          res.data.map(async (conv) => {
            const otherUserId = conv.participants.find((p) => p !== user.id);
            if (!otherUserId) return null;
            try {
              const profileRes = await userApi.getUserById(otherUserId);
              const otherUser = profileRes?.data as UserType;
              if (!otherUser) return null;
              return {
                user: otherUser,
                unreadCount: 0,
                lastMessage: conv.lastMessage
                  ? {
                      id: '',
                      sender_id: '',
                      receiver_id: user.id,
                      conversation_id: '',
                      message: conv.lastMessage,
                      created_at: conv.lastMessageAt ?? '',
                    }
                  : undefined,
              };
            } catch {
              return null;
            }
          })
        );
        const valid = enriched.filter(Boolean) as any[];
        if (valid.length > 0) setConversations(valid);
      } catch {
        // ignore
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Load message history when a conversation is opened
  useEffect(() => {
    if (!selectedConversation) return;
    (async () => {
      try {
        const res = await chatApi.getMessages(selectedConversation);
        const msgs = res?.data?.messages ?? [];
        setMessages(msgs.map((msg) => normalizeMessage(msg)));
      } catch {
        // ignore
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConversation]);

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
    if (!messageInput.trim() || !selectedConversation || !chatSocketRef.current) return;

    // Backend expects: { receiverId, content }
    chatSocketRef.current.emit('send_message', {
      receiverId: selectedConversation,
      content: messageInput.trim(),
    });

    setMessageInput('');
    setIsTyping(false);
  };

  const handleTyping = () => {
    if (!isTyping && selectedConversation && chatSocketRef.current) {
      setIsTyping(true);
      // Backend expects: { receiverId }
      chatSocketRef.current.emit('typing_start', { receiverId: selectedConversation });
      setTimeout(() => {
        setIsTyping(false);
        chatSocketRef.current?.emit('typing_stop', { receiverId: selectedConversation });
      }, 3000);
    }
  };

  // Filter messages for the active conversation by sender/receiver
  const conversationMessages = selectedConversation
    ? messages.filter((m) =>
        m.sender_id === selectedConversation ||
        m.receiver_id === selectedConversation
      )
    : [];

  return (
    <div className="h-[calc(100vh-4rem)] bg-background flex overflow-hidden">
      {/* Conversations List */}
      <div className="w-80 bg-card border-r flex flex-col overflow-hidden shrink-0">
        <div className="p-4 border-b shrink-0">
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

        {/* Conversation list — scrollable */}
        <div className="flex-1 overflow-y-auto divide-y">
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              Search for people above to start a conversation
            </div>
          ) : (
            conversations.map((conv) => {
              const otherUser = conv.user;
              const isOnline = otherUser ? onlineUsers.has(otherUser.id) : false;
              return (
                <div
                  key={otherUser.id}
                  onClick={() => setSelectedConversation(otherUser.id)}
                  className={`p-4 cursor-pointer hover:bg-accent transition-colors ${
                    selectedConversation === otherUser.id ? 'bg-accent' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
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
      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedConversation ? (
          <>
            {/* Chat Header — sticky */}
            <div className="p-4 border-b bg-card shrink-0">
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
                    {activeUser && onlineUsers.has(activeUser.id)
                      ? <span className="text-green-500">● Online</span>
                      : <span>● Offline</span>}
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

            {/* Messages — scrollable area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {conversationMessages.length === 0 && (
                <div className="text-center text-muted-foreground text-sm py-8">
                  No messages yet. Say hi! 👋
                </div>
              )}
              {conversationMessages.map((message) => {
                const isOwn = message.sender_id === user?.id;
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-sm lg:max-w-md px-4 py-2.5 rounded-2xl ${
                        isOwn
                          ? 'bg-primary text-primary-foreground rounded-br-sm'
                          : 'bg-card border rounded-bl-sm'
                      }`}
                    >
                      <div className="text-sm leading-relaxed">{message.message}</div>
                      <div
                        className={`text-xs mt-1 ${
                          isOwn ? 'text-primary-foreground/60' : 'text-muted-foreground'
                        }`}
                      >
                        {message.created_at ? formatDate(message.created_at) : ''}
                      </div>
                    </div>
                  </div>
                );
              })}
              {/* Scroll anchor */}
              <div ref={messagesEndRef} />
            </div>

            {/* Input bar — sticky at bottom */}
            <div className="shrink-0 p-4 border-t bg-card/80 backdrop-blur-sm">
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => {
                    setMessageInput(e.target.value);
                    handleTyping();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2.5 border rounded-full bg-background focus:ring-2 focus:ring-ring focus:outline-none text-sm"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                  className="p-2.5 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <div className="text-6xl mb-4">💬</div>
              <div className="text-xl font-medium">Select a conversation</div>
              <div className="text-sm mt-1">Choose a chat to start messaging</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
