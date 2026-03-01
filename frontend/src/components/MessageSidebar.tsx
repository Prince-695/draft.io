'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Send, Search, MessageCircle } from 'lucide-react';
import { useAuthStore, useUIStore, useChatStore } from '@/stores';
import { getChatSocket } from '@/lib/chatSocketInstance';
import { userApi } from '@/lib/api/user';
import { chatApi } from '@/lib/api/chat';
import type { User as UserType, ChatMessage } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ROUTES } from '@/utils/constants';
import { useRouter } from 'next/navigation';

export function MessageSidebar() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { messagePanelOpen, setMessagePanelOpen } = useUIStore();
  const {
    conversations,
    activeConversation,
    messages,
    onlineUsers,
    typingUsers,
    setActiveConversation,
    setConversations,
    setConversationMessages,
    addMessage,
  } = useChatStore();

  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserType[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // User search debounce
  useEffect(() => {
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    if (!searchQuery.trim()) { setSearchResults([]); return; }

    searchDebounce.current = setTimeout(async () => {
      try {
        const res = await userApi.searchUsers(searchQuery);
        setSearchResults(res?.data?.filter((u: UserType) => u.id !== user?.id).slice(0, 5) || []);
      } catch { setSearchResults([]); }
    }, 300);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  function sendMessage() {
    if (!messageInput.trim() || !activeConversation) return;
    const socket = getChatSocket();
    if (!socket?.connected) return;
    // Backend expects: { receiverId, content }
    socket.emit('send_message', {
      receiverId: activeConversation.id,
      content: messageInput.trim(),
    });
    // ChatSocketProvider handles 'message_sent' confirmation and adds to store
    setMessageInput('');
  }

  async function startConversation(target: UserType) {
    setActiveConversation(target);
    setMessageInput('');
    setSearchQuery('');
    setSearchResults([]);
    // Add to conversations list if not already there
    const alreadyExists = useChatStore.getState().conversations.some((c) => c.user.id === target.id);
    if (!alreadyExists) {
      useChatStore.getState().setConversations([
        { user: target, unreadCount: 0 },
        ...useChatStore.getState().conversations,
      ]);
    }
    // Probe online status
    getChatSocket()?.emit('check_online', { userId: target.id });
    // Load message history
    if (!user?.id) return;
    try {
      const res = await chatApi.getMessages(target.id);
      const msgs = (res?.data?.messages ?? []).map((msg: any) => ({
        id: msg._id?.toString() ?? msg.id ?? '',
        sender_id: msg.senderId ?? msg.sender_id ?? '',
        receiver_id: msg.receiverId ?? msg.receiver_id ?? '',
        conversation_id: msg.conversationId ?? msg.conversation_id ?? '',
        message: msg.content ?? msg.message ?? '',
        created_at: msg.createdAt ?? msg.created_at ?? '',
      }));
      setConversationMessages(target.id, user.id, msgs);
    } catch {
      // ignore — socket messages in store still visible
    }
  }

  const conversationMessages = activeConversation
    ? messages.filter(
        (m: ChatMessage) =>
          (m.sender_id === user?.id && m.receiver_id === activeConversation.id) ||
          (m.sender_id === activeConversation.id && m.receiver_id === user?.id)
      )
    : [];

  if (!messagePanelOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40 transition-opacity"
        onClick={() => setMessagePanelOpen(false)}
      />

      {/* Panel — covers right 50% */}
      <div className="fixed top-0 right-0 h-full w-full sm:w-1/2 bg-background border-l border-border shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Messaging</h2>
          </div>
          <button
            onClick={() => setMessagePanelOpen(false)}
            className="p-1.5 hover:bg-accent rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-1 min-h-0">
          {/* Conversations list */}
          <div className="w-64 shrink-0 border-r border-border flex flex-col bg-card/50">
            {/* Search */}
            <div className="p-3 border-b border-border">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search people..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-sm bg-muted/50 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            {/* Search results */}
            {searchResults.length > 0 && (
              <div className="border-b border-border">
                {searchResults.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => startConversation(u)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-accent transition-colors text-left"
                  >
                    <Avatar className="w-8 h-8 shrink-0">
                      <AvatarImage src={u.profile_picture_url} />
                      <AvatarFallback>{u.username?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{u.full_name || u.username}</div>
                      <div className="text-xs text-muted-foreground truncate">@{u.username}</div>
                    </div>
                    {onlineUsers.has(u.id) && (
                      <span className="w-2 h-2 rounded-full bg-green-500 ml-auto shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Recent conversations */}
            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 && !searchQuery && (
                <div className="p-4 text-center text-xs text-muted-foreground mt-4">
                  <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  Search people above to start a conversation
                </div>
              )}
              {conversations.map((conv) => {
                const convUser = conv.user;
                const isOnline = onlineUsers.has(convUser.id);
                const isActive = activeConversation?.id === convUser.id;
                return (
                  <button
                    key={convUser.id}
                    onClick={() => startConversation(convUser)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-accent transition-colors text-left ${isActive ? 'bg-accent' : ''}`}
                  >
                    <div className="relative shrink-0">
                      <Avatar className="w-9 h-9">
                        <AvatarImage src={convUser.profile_picture_url} />
                        <AvatarFallback>{convUser.username?.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      {isOnline && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-background" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{convUser.full_name || convUser.username}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {'@' + convUser.username}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chat area */}
          <div className="flex-1 flex flex-col min-w-0">
            {activeConversation ? (
              <>
                {/* Chat header */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card/50">
                  <div className="relative">
                    <Avatar className="w-9 h-9">
                      <AvatarImage src={activeConversation.profile_picture_url} />
                      <AvatarFallback>{activeConversation.username?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    {onlineUsers.has(activeConversation.id) && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-background" />
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{activeConversation.full_name || activeConversation.username}</div>
                    <div className="text-xs text-muted-foreground">
                      {typingUsers.has(activeConversation.id)
                        ? 'Typing...'
                        : onlineUsers.has(activeConversation.id)
                        ? 'Active now'
                        : 'Offline'}
                    </div>
                  </div>
                  <button
                    onClick={() => router.push(ROUTES.CHAT)}
                    className="ml-auto text-xs text-primary hover:underline"
                  >
                    Open full chat
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {conversationMessages.length === 0 && (
                    <div className="text-center text-sm text-muted-foreground mt-8">
                      Start a conversation with {activeConversation.full_name || activeConversation.username}
                    </div>
                  )}
                  {conversationMessages.map((msg: ChatMessage) => {
                    const isOwn = msg.sender_id === user?.id;
                    return (
                      <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                            isOwn
                              ? 'bg-primary text-primary-foreground rounded-br-sm'
                              : 'bg-muted rounded-bl-sm'
                          }`}
                        >
                          {msg.message}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-3 border-t border-border bg-card/50">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                      placeholder={`Message ${activeConversation.username}...`}
                      className="flex-1 px-3 py-2 text-sm bg-muted/50 border border-border rounded-full focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!messageInput.trim()}
                      className="p-2 bg-primary text-primary-foreground rounded-full disabled:opacity-50 hover:bg-primary/90 transition-colors"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center px-6">
                <div>
                  <MessageCircle className="w-14 h-14 mx-auto mb-3 text-muted-foreground/30" />
                  <p className="font-medium text-muted-foreground">Select a conversation</p>
                  <p className="text-xs text-muted-foreground mt-1">or search for someone to message</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
