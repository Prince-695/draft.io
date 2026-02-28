'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores';
import { socketService } from '@/lib/socket';
import { formatDate } from '@/utils/helpers';
import apiClient from '@/lib/api/client';
import { API_ENDPOINTS, ROUTES } from '@/utils/constants';
import type { Notification } from '@/types';

const ICONS: Record<string, string> = {
  like: '❤️', comment: '💬', follow: '👤', mention: '@', default: '🔔',
};

async function fetchNotifications(): Promise<Notification[]> {
  const res = await apiClient.get(API_ENDPOINTS.NOTIFICATIONS.LIST, {
    params: { limit: 10, offset: 0 },
  });
  const payload = res.data?.data ?? res.data;
  return Array.isArray(payload) ? payload : (payload?.notifications ?? []);
}

export function NotificationDropdown() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
    enabled: isAuthenticated,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    refetchInterval: 60_000, // poll every 60s as fallback
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      await apiClient.patch(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  // Real-time: listen for new notifications via socket
  useEffect(() => {
    const socket = socketService.getSocket();
    if (!socket) return;
    const handler = (notification: Notification) => {
      queryClient.setQueryData<Notification[]>(['notifications'], (prev = []) => [
        notification,
        ...prev,
      ]);
    };
    socket.on('notification:new', handler);
    return () => { socket.off('notification:new', handler); };
  }, [queryClient]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative p-2 rounded-lg text-foreground/70 hover:text-foreground hover:bg-accent transition-colors"
        aria-label="Notifications"
      >
        <span className="text-xl">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-4.5 h-4.5 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center px-1">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-96 bg-popover border border-border rounded-xl shadow-xl z-20 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-border flex justify-between items-center">
              <h3 className="font-bold text-base">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllReadMutation.mutate()}
                    className="text-xs text-primary hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>
            </div>

            {/* List */}
            <div className="max-h-95 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <div className="text-4xl mb-2">🔔</div>
                  <p className="text-sm">No notifications yet</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`px-4 py-3 border-b border-border/50 hover:bg-accent/50 transition-colors ${
                      !n.is_read ? 'bg-primary/5' : ''
                    }`}
                  >
                    <div className="flex gap-3 items-start">
                      <span className="text-xl shrink-0 mt-0.5">
                        {ICONS[n.type] ?? ICONS.default}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium leading-tight">{n.title}</p>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{n.message}</p>
                        <p className="text-xs text-muted-foreground/60 mt-1">
                          {formatDate(n.created_at)}
                        </p>
                      </div>
                      {!n.is_read && (
                        <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-border text-center">
              <button
                onClick={() => { setIsOpen(false); router.push(ROUTES.NOTIFICATIONS); }}
                className="text-sm text-primary hover:underline"
              >
                View all notifications
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
