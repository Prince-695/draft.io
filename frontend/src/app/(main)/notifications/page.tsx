'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import { API_ENDPOINTS } from '@/utils/constants';
import { formatDate } from '@/utils/helpers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Check, CheckCheck, Trash2 } from 'lucide-react';
import type { Notification } from '@/types';

const ICONS: Record<string, string> = {
  like: '❤️', comment: '💬', follow: '👤', mention: '@',
  blog_published: '📝', default: '🔔',
};

async function fetchNotifications(): Promise<Notification[]> {
  const res = await apiClient.get(API_ENDPOINTS.NOTIFICATIONS.LIST, {
    params: { limit: 50, offset: 0 },
  });
  const payload = res.data?.data ?? res.data;
  return Array.isArray(payload) ? payload : (payload?.notifications ?? []);
}

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.patch(`${API_ENDPOINTS.NOTIFICATIONS.MARK_READ}/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      await apiClient.patch(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`${API_ENDPOINTS.NOTIFICATIONS.DELETE}/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const displayed = filter === 'unread'
    ? notifications.filter((n) => !n.is_read)
    : notifications;

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-muted-foreground text-sm mt-1">
                You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => markAllReadMutation.mutate()}
              disabled={markAllReadMutation.isPending}
            >
              <CheckCheck className="w-4 h-4" />
              Mark all read
            </Button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {(['all', 'unread'] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(f)}
              className="capitalize"
            >
              {f}
              {f === 'unread' && unreadCount > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 text-xs">
                  {unreadCount}
                </Badge>
              )}
            </Button>
          ))}
        </div>

        {/* Notifications List */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 bg-muted rounded-full" />
                    <div className="flex-1">
                      <div className="h-4 bg-muted rounded w-2/3 mb-2" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : displayed.length === 0 ? (
          <Card>
            <CardContent className="p-16 text-center">
              <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <CardTitle className="mb-2">
                {filter === 'unread' ? 'All caught up!' : 'No notifications yet'}
              </CardTitle>
              <p className="text-muted-foreground text-sm">
                {filter === 'unread'
                  ? 'You have no unread notifications.'
                  : 'Your notifications will appear here when someone interacts with your content.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {displayed.map((notification) => (
              <Card
                key={notification.id}
                className={`transition-colors ${!notification.is_read ? 'border-primary/30 bg-primary/5' : ''}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl w-10 text-center shrink-0 mt-0.5">
                      {ICONS[notification.type] ?? ICONS.default}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{notification.title}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(notification.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {!notification.is_read && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          title="Mark as read"
                          onClick={() => markReadMutation.mutate(notification.id)}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        title="Delete"
                        onClick={() => deleteMutation.mutate(notification.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
