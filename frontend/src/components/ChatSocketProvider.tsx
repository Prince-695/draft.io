'use client';

/**
 * ChatSocketProvider — mounts once in the main layout.
 *
 * Manages the single shared Socket.IO connection to the chat-service so:
 * - Real-time messages arrive whether or not the user is on the /chat page
 * - Toast notifications pop up for incoming messages from other conversations
 * - The bell icon badge is updated via React Query cache injection
 */
import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'gooey-toast';
import { useAuthStore, useChatStore } from '@/stores';
import { getChatSocket, setChatSocket } from '@/lib/chatSocketInstance';
import type { Notification } from '@/types';

const CHAT_WS_URL = process.env.NEXT_PUBLIC_CHAT_WS_URL || 'http://localhost:5007';

// Pure normalizer defined at module level — no stale-closure risk
const normalizeMessage = (msg: any) => ({
  id: msg._id?.toString() ?? msg.id ?? '',
  sender_id: msg.senderId ?? msg.sender_id ?? '',
  receiver_id: msg.receiverId ?? msg.receiver_id ?? '',
  conversation_id: msg.conversationId ?? msg.conversation_id ?? '',
  message: msg.content ?? msg.message ?? '',
  created_at: msg.createdAt ?? msg.created_at ?? new Date().toISOString(),
});

export function ChatSocketProvider() {
  const { isAuthenticated, user } = useAuthStore();
  const {
    addMessage,
    addOnlineUser,
    removeOnlineUser,
    addTypingUser,
    removeTypingUser,
  } = useChatStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    const token = useAuthStore.getState().tokens?.accessToken;
    if (!token) return;

    // Reuse existing connected socket if present
    if (getChatSocket()?.connected) return;

    const socket = io(CHAT_WS_URL, {
      auth: { token },
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    });
    setChatSocket(socket);

    socket.on('connect', () => console.log('✅ Chat socket connected:', socket.id));
    socket.on('connect_error', (e) => console.warn('⚠️ Chat socket error:', e.message));

    // ── Incoming message from another user ────────────────────────────────
    socket.on('receive_message', (raw: any) => {
      const msg = normalizeMessage(raw);
      addMessage(msg);

      // Show toast + bell notification only when NOT actively viewing that chat
      const { activeConversation } = useChatStore.getState();
      const isActiveConv = activeConversation?.id === msg.sender_id;
      if (!isActiveConv) {
        const conv = useChatStore.getState().conversations.find(
          (c) => c.user.id === msg.sender_id
        );
        const senderName =
          conv?.user?.full_name || conv?.user?.username || 'Someone';

        // Toast pop-up
        toast.show({
          title: `💬 ${senderName}`,
          description: msg.message.length > 80 ? msg.message.slice(0, 80) + '…' : msg.message,
        });

        // Bell icon — inject into React Query notifications cache
        const notif: Notification = {
          id: `msg-${msg.id || Date.now()}`,
          user_id: user.id,
          type: 'message',
          title: `New message from ${senderName}`,
          message: msg.message.length > 80 ? msg.message.slice(0, 80) + '…' : msg.message,
          link: `/chat?userId=${msg.sender_id}`,
          is_read: false,
          created_at: msg.created_at,
        };
        queryClient.setQueryData<Notification[]>(['notifications'], (prev = []) => {
          if (prev.some((n) => n.id === notif.id)) return prev;
          return [notif, ...prev];
        });
      }
    });

    // ── Sender confirmation ───────────────────────────────────────────────
    socket.on('message_sent', (raw: any) => {
      addMessage(normalizeMessage(raw));
    });

    // ── Presence ──────────────────────────────────────────────────────────
    socket.on('user_online', ({ userId }: { userId: string }) => {
      addOnlineUser(userId);
    });
    socket.on('user_offline', ({ userId }: { userId: string }) => {
      removeOnlineUser(userId);
    });

    // ── Typing indicator ──────────────────────────────────────────────────
    socket.on('typing_indicator', ({ senderId, isTyping }: any) => {
      if (isTyping) {
        addTypingUser(senderId);
        setTimeout(() => removeTypingUser(senderId), 3000);
      } else {
        removeTypingUser(senderId);
      }
    });

    return () => {
      socket.disconnect();
      setChatSocket(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.id]);

  return null;
}
